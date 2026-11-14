import {CanvasTexture,SRGBColorSpace} from 'three';
const WMTS='http://www.opengis.net/wmts/1.0',OWS='http://www.opengis.net/ows/1.1';
const element=(node,ns,name)=>node.getElementsByTagNameNS(ns,name)[0];
const text=(node,ns,name)=>element(node,ns,name)?.textContent.trim();
export function parseCapabilities(xml,level='2') {
 const doc=new DOMParser().parseFromString(xml,'application/xml');
 if(doc.querySelector('parsererror'))throw new Error('Metadatos WMTS inválidos.');
 const layer=element(doc,WMTS,'Layer');
 const resource=[...layer.getElementsByTagNameNS(WMTS,'ResourceURL')].find(x=>x.getAttribute('resourceType')==='tile');
 const matrixSetId=text(layer,WMTS,'TileMatrixSet');
 const matrixSet=[...doc.getElementsByTagNameNS(WMTS,'TileMatrixSet')].find(x=>text(x,OWS,'Identifier')===matrixSetId);
 const matrix=[...matrixSet.getElementsByTagNameNS(WMTS,'TileMatrix')].find(x=>text(x,OWS,'Identifier')===level);
 if(!resource||!matrix)throw new Error('El servicio no ofrece la matriz global requerida.');
 const top=text(matrix,WMTS,'TopLeftCorner').split(/\s+/).map(Number);
 const width=Number(text(matrix,WMTS,'MatrixWidth')),height=Number(text(matrix,WMTS,'MatrixHeight'));
 // This renderer accepts only the verified global equirectangular grid, never polar products.
 if(top[0]!==-180||top[1]!==90||width!==height*2)throw new Error('Proyección no compatible con el globo.');
 return {template:resource.getAttribute('template').replace('/1.0.0//','/1.0.0/'),style:text(element(layer,WMTS,'Style'),OWS,'Identifier'),matrixSetId,matrixId:text(matrix,OWS,'Identifier'),width,height,tileWidth:Number(text(matrix,WMTS,'TileWidth')),tileHeight:Number(text(matrix,WMTS,'TileHeight'))};
}
async function request(url,signal){const response=await fetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(20000)])});if(!response.ok)throw new Error(`Mars Trek respondió ${response.status}.`);return response;}
export async function loadMarsTexture(layer,signal,onProgress){
 const metadata=await request(layer.capabilities,signal);const grid=parseCapabilities(await metadata.text());
 if(layer.id==='ctx'){const service=grid.template.split('/tile/')[0],r=await request(service+'?f=json',signal),info=(await r.json()).tileInfo,lod=info?.lods.find(v=>v.level===0);if(!lod||info.cols!==512||info.rows!==512||info.origin.x!==-180||info.origin.y!==90||info.spatialReference.wkid!==104971)throw new Error('Cuadrícula CTX global no compatible.');Object.assign(grid,{matrixId:'0',width:Math.round(360/(lod.resolution*info.cols)),height:Math.round(180/(lod.resolution*info.rows)),tileWidth:info.cols,tileHeight:info.rows})}
 const canvas=document.createElement('canvas');canvas.width=grid.width*grid.tileWidth;canvas.height=grid.height*grid.tileHeight;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#586057';ctx.fillRect(0,0,canvas.width,canvas.height);
 // A visible pattern represents unavailable coverage; it must not be confused with surface observations.
 ctx.strokeStyle='#6c7466';ctx.lineWidth=2;for(let x=-canvas.height;x<canvas.width;x+=22){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+canvas.height,canvas.height);ctx.stroke()}
 const y=(90-layer.latitude)/180*canvas.height;ctx.save();ctx.beginPath();ctx.rect(0,y,canvas.width,canvas.height-2*y);ctx.clip();
 let next=0,complete=0,missing=0;const total=grid.width*grid.height;
 const worker=async()=>{while(next<total){signal.throwIfAborted();const index=next++,row=Math.floor(index/grid.width),col=index%grid.width;
 const url=grid.template.replace('{Style}',grid.style).replace('{TileMatrixSet}',grid.matrixSetId).replace('{TileMatrix}',grid.matrixId).replace('{TileRow}',row).replace('{TileCol}',col);
 // 404 means missing coverage, whereas a service or network failure keeps the previous map visible.
 const response=await fetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(20000)])});
 if(response.status===404)missing++;else{if(!response.ok)throw new Error(`Tesela no disponible (${response.status}).`);const bitmap=await createImageBitmap(await response.blob());try{signal.throwIfAborted();ctx.drawImage(bitmap,col*grid.tileWidth,row*grid.tileHeight,grid.tileWidth,grid.tileHeight)}finally{bitmap.close()}}
 onProgress(Math.round(++complete/total*100));}};
 await Promise.all(Array.from({length:6},worker));signal.throwIfAborted();ctx.restore();if(missing===total)throw new Error('El servicio no devolvió cobertura para esta capa.');
 const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
 return {texture,layer,width:canvas.width,height:canvas.height,missing,loadedAt:new Date().toISOString()};
}
