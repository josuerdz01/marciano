let worker,next=0,globalData;const listeners=new Set();const pending=new Map();
function request(kind,map){if(!worker){worker=new Worker(new URL('./nasa.worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result)};worker.onerror=()=>{for(const p of pending.values())p.reject(Error('No se pudo preparar el mapa demostrativo.'));pending.clear();worker.terminate();worker=null;globalData=null}}return new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});worker.postMessage({id,kind,map})})}
const imageRequests=new Map();
export async function loadNasaGlobal(layer='height'){
 const data=await(globalData??=fetch('/nasa-layers/manifest.json').then(async response=>{if(!response.ok)throw Error('No se encontraron las capas del proyecto NASA.');const manifest=await response.json();return{...manifest,files:manifest.layers,layers:{}}}).catch(error=>{globalData=null;throw error}));
 if(!data.layers[layer]){let image=imageRequests.get(layer);if(!image){image=fetch('/nasa-layers/'+data.files[layer]+'?v='+data.sourceHash.slice(0,12),{priority:'low'}).then(async response=>{if(!response.ok)throw Error('No se pudo cargar '+layer);return createImageBitmap(await response.blob())}).catch(error=>{imageRequests.delete(layer);throw error});imageRequests.set(layer,image)}data.layers[layer]=await image}
 return data;
}
export const loadNasaLocal=map=>request('local',{west:map.west,north:map.north,span:map.span,site:{lon:map.site.lon,lat:map.site.lat}});
