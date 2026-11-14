import {sourceFetch,removeCachedSource} from './sourceCache.js';
import {parseCapabilities} from './trekWmts.js';
export const initialSite={lon:-57.70568740014555,lat:-20.148925405400668};
import {ctxLayer} from './ctxSource.js';
export {ctxLayer} from './ctxSource.js';
import {matchedLocalMap} from '../terrain/ortho.js';
async function ctxMetadata(signal){
 const response=await sourceFetch(ctxLayer.capabilities,{signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});if(!response.ok)throw new Error('No se pudo consultar CTX.');const advertised=parseCapabilities(await response.text(),'11');const service=advertised.template.split('/tile/')[0];const serviceResponse=await sourceFetch(service+'?f=json',{signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});if(!serviceResponse.ok)throw new Error('No se pudo consultar la cuadrícula CTX.');const metadata=await serviceResponse.json();const info=metadata.tileInfo,lod=info?.lods[0];if(!lod||info.origin.x!==-180||info.origin.y!==90||info.spatialReference.wkid!==104971)throw new Error('Cuadrícula planetaria CTX no compatible.');return{info,service};}
async function loadWindow(site,signal,level,{info,service}){
 const lod=info.lods.find(x=>x.level===level);if(!lod)throw new Error('Nivel CTX no disponible.');const grid={template:service+'/tile/{TileMatrix}/{TileRow}/{TileCol}',matrixId:String(lod.level),width:360/(lod.resolution*info.cols),height:180/(lod.resolution*info.rows),tileWidth:info.cols};
 const px=(site.lon+180)/360*grid.width,py=(90-site.lat)/180*grid.height;
 const startCol=Math.floor(px)-1,startRow=Math.floor(py)-1,n=3;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=n*grid.tileWidth;const ctx=canvas.getContext('2d');ctx.fillStyle='#586057';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#849078';for(let x=-canvas.height;x<canvas.width;x+=15){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+canvas.height,canvas.height);ctx.stroke()}
 const coverage=document.createElement('canvas');coverage.width=canvas.width;coverage.height=canvas.height;const cover=coverage.getContext('2d');let missing=0;await Promise.all(Array.from({length:n*n},async(_,i)=>{const row=startRow+Math.floor(i/n),col=((startCol+i%n)%grid.width+grid.width)%grid.width;if(row<0||row>=grid.height){missing++;return}const url=grid.template.replace('{Style}',grid.style).replace('{TileMatrixSet}',grid.matrixSetId).replace('{TileMatrix}',grid.matrixId).replace('{TileRow}',row).replace('{TileCol}',col);
 const response=await sourceFetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(20000)])});if(response.status===404){missing++;return}if(!response.ok){const e=new Error('CTX no respondió correctamente.');e.levelFailed=response.status>=500;throw e}let bitmap;try{bitmap=await createImageBitmap(await response.blob())}catch(e){removeCachedSource(url);const error=new Error('El servicio entregó una imagen CTX incompleta.');error.decodeFailed=true;throw error}try{signal.throwIfAborted();ctx.drawImage(bitmap,i%n*grid.tileWidth,Math.floor(i/n)*grid.tileWidth,grid.tileWidth,grid.tileWidth);cover.drawImage(bitmap,i%n*grid.tileWidth,Math.floor(i/n)*grid.tileWidth,grid.tileWidth,grid.tileWidth)}finally{bitmap.close()}}));
 signal.throwIfAborted();if(missing===9)throw new Error('No hay imágenes CTX disponibles en esta región.');
 const{CanvasTexture,SRGBColorSpace}=await import('three');const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
 const west=startCol/grid.width*360-180,north=90-startRow/grid.height*180,span=n/grid.width*360;
 const widthKm=span*Math.PI/180*3396.19*Math.cos(site.lat*Math.PI/180),heightKm=span*Math.PI/180*3396.19;
 const pixels=cover.getImageData(0,0,coverage.width,coverage.height).data;const isCovered=(x,z)=>{const cx=Math.floor((x/24+.5)*coverage.width),cy=Math.floor((z/(24/Math.cos(site.lat*Math.PI/180))+.5)*coverage.height);return cx>=0&&cy>=0&&cx<coverage.width&&cy<coverage.height&&pixels[(cy*coverage.width+cx)*4+3]>240};
 return {texture,site,level,west,north,span,widthKm,heightKm,missing,isCovered,metersPerPixel:span*Math.PI/180*3396190/canvas.width,start:[((px-startCol)/n-.5)*24,((py-startRow)/n-.5)*24/Math.cos(site.lat*Math.PI/180)],height:24/Math.cos(site.lat*Math.PI/180)};
}
export function localCoordinates(map,x,z){return {lon:((map.west+(x/24+.5)*map.span+180)%360+360)%360-180,lat:map.north-(z/map.height+.5)*map.span};}

export async function loadLocalMap(site,signal){try{const matched=await matchedLocalMap(site,signal);if(matched)return matched}catch(error){signal.throwIfAborted()}const metadata=await ctxMetadata(signal);let last;for(const level of [11,10,9]){const attempt=new AbortController();try{return await loadWindow(site,AbortSignal.any([signal,attempt.signal]),level,metadata)}catch(error){attempt.abort();signal.throwIfAborted();if(!error.decodeFailed&&!error.levelFailed)throw error;last=error}}throw last;}
