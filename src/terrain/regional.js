// Preserve native cells and their NoData mask. A regional source must cover the
// complete requested viewport; never splice different vertical datums together.
export function cropRegional(dem,map){
 if(map.west<dem.west+dem.stepLon||map.west+map.span>dem.east-dem.stepLon||map.north>dem.north-dem.stepLat||map.north-map.span<dem.south+dem.stepLat)return null;
 const x=Math.floor((map.west-dem.west)/dem.stepLon)-1,y=Math.floor((dem.north-map.north)/dem.stepLat)-1,w=Math.ceil((map.west+map.span-dem.west)/dem.stepLon)+1-x,h=Math.ceil((dem.north-map.north+map.span)/dem.stepLat)+1-y;
 const values=new Float32Array(w*h);for(let r=0;r<h;r++)values.set(dem.values.subarray((y+r)*dem.width+x,(y+r)*dem.width+x+w),r*w);
 const west=dem.west+x*dem.stepLon,north=dem.north-y*dem.stepLat;
 return{...dem,width:w,height:h,west,north,east:west+w*dem.stepLon,south:north-h*dem.stepLat,values,map,delivery:'Recorte nativo CTX estéreo · SHA-256 verificado'};
}
export async function decodeElevationBytes(bytes){const magic=new Uint8Array(bytes);return magic[0]===31&&magic[1]===139?new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():bytes}
let cached;
export async function loadJezero(map,signal){
 // Fetch only inside the regional product's intended coverage.
 if(map.west<77.3||map.west+map.span>78.05||map.north>18.8||map.north-map.span<18.05)return null;
 if(!cached)cached=(async()=>{const a=await fetch('/data/jezero-dem.json');if(!a.ok)throw new Error('Metadatos CTX no disponibles');const meta=await a.json();const b=await fetch('/data/jezero-dem.f32.gz');if(!b.ok)throw new Error('DEM CTX no disponible');const bytes=await decodeElevationBytes(await b.arrayBuffer());if(bytes.byteLength!==meta.width*meta.height*4)throw new Error('DEM CTX truncado');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==meta.sha256)throw new Error('Integridad del DEM CTX incorrecta');const view=new DataView(bytes),values=Float32Array.from({length:meta.width*meta.height},(_,i)=>view.getFloat32(i*4,true));return{...meta,values}})().catch(e=>{cached=null;throw e});
 const dem=await cached;signal.throwIfAborted();return cropRegional(dem,map);
}
