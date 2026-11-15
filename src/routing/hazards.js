import {cellCoordinates,cellIndex,metricDistance} from './geometry.js';
const cached=new WeakMap();
// Relative scenario intensity, deliberately kept separate from human mSv and GRS ppm.
export function hazardGrid(grid,map,{obstacles=[],threshold=3}={}){
 const previous=cached.get(grid);if(previous?.map===map&&previous.obstacles===obstacles&&previous.threshold===threshold)return previous.result;
 const mask=grid.mask.slice(),radiation=new Float32Array(mask.length),data=map.data;
 const blocked=obstacles.map(o=>({...o,index:cellIndex(grid,o)}));
 for(let i=0;i<mask.length;i++){
  if(!mask[i])continue;const geo=cellCoordinates(grid,i);
  if(blocked.some(o=>i===o.index||metricDistance(geo,o,grid.radius)<=o.radius)){mask[i]=0;continue}
  if(data?.fields3D?.rad){const j=cellIndex(data,geo);if(j>=0&&Number.isFinite(data.fields3D.rad[j]))radiation[i]=data.fields3D.rad[j]}
 }
 const result={...grid,mask,radiation,radiationThreshold:threshold};cached.set(grid,{map,obstacles,threshold,result});return result;
}
export function radiationMask(grid){const mask=grid.mask.slice();for(let i=0;i<mask.length;i++)if(grid.radiation[i]>=grid.radiationThreshold)mask[i]=0;return{...grid,mask}}
export function radiationStats(route,grid){let exposedMeters=0,peak=0;for(let p=0;p<route.path.length;p++){const i=route.path[p];peak=Math.max(peak,grid.radiation[i]);if(p){const j=route.path[p-1];if(Math.max(grid.radiation[i],grid.radiation[j])>=grid.radiationThreshold)exposedMeters+=metricDistance(cellCoordinates(grid,i),cellCoordinates(grid,j),grid.radius)}}return{exposedMeters,peak}}
