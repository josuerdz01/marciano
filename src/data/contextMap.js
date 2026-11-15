import {loadLocalLayer} from './localLayers.js';
import {getMarsLayer} from './marsLayers.js';
export function contextWindow(site){
 if(!Number.isFinite(site.lat)||!Number.isFinite(site.lon)||Math.abs(site.lat)>=89.9)throw new Error('Este punto requiere una proyección polar; elige un sitio alejado del polo.');
 const span=.263671875,lon=((site.lon+180)%360+360)%360-180,cos=Math.cos(site.lat*Math.PI/180),height=24/cos;
 return{site,span,west:lon-span/2,north:site.lat+span/2,height,widthKm:span*Math.PI/180*3396.19*cos,heightKm:span*Math.PI/180*3396.19,start:[0,0],level:null};
}
export async function loadContextMap(site,signal,load=loadLocalLayer){
 const map=contextWindow(site);let last;
 for(const id of ['mola-color','viking']){try{const image=await load(map,getMarsLayer(id),signal,{coverage:true});signal.throwIfAborted();return{...map,...image,basemapFallback:true,qualityWarning:`CTX no disponible. Se muestra ${image.layer.name} de NASA Mars Trek; la elevación se carga por separado.`,isCovered:image.isCovered}}catch(error){signal.throwIfAborted();last=error}}
 throw last;
}
export async function recoverRegionalMap(site,signal,primary,fallback=loadContextMap){try{return await primary()}catch(error){signal.throwIfAborted();return fallback(site,signal)}}
