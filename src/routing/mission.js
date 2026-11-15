import {radiationStats} from './hazards.js';
import {findRoute} from './astar.js';
// Terrain planning only. A replan keeps the original base as the return target.
export function missionRoute(grid,a,b,science,options){
 const legs=science==null?[findRoute(grid,a,b,options)]:[findRoute(grid,a,science,options),findRoute(grid,science,b,options)];
 let offset=0;const profile=[],path=[];
 for(const [n,leg] of legs.entries()){profile.push(...leg.profile.slice(n?1:0).map(p=>({...p,distance:p.distance+offset})));path.push(...leg.path.slice(n?1:0));offset+=leg.distance;}
 return {path,profile,distance:offset,ascent:legs.reduce((s,l)=>s+l.ascent,0),descent:legs.reduce((s,l)=>s+l.descent,0),maxSlope:Math.max(...legs.map(l=>l.maxSlope)),cost:legs.reduce((s,l)=>s+l.cost,0),visited:legs.reduce((s,l)=>s+l.visited,0)};
}
export function assessMission(route,{speed,budget,reserve,stopMinutes,elapsedMinutes=0}){
 if(![speed,budget,reserve,stopMinutes,elapsedMinutes].every(Number.isFinite)||speed<=0||budget<=0||reserve<0||reserve>=100||stopMinutes<0||elapsedMinutes<0)throw new Error('Parámetros de escenario no válidos.');
 const roundTripDistance=route.distance+(route.returnDistance??route.distance),travelMinutes=roundTripDistance/(speed*1000)*60,totalMinutes=elapsedMinutes+travelMinutes+stopMinutes,usableMinutes=budget*(1-reserve/100);
 return {travelMinutes,totalMinutes,usableMinutes,marginMinutes:usableMinutes-totalMinutes,withinBudget:totalMinutes<=usableMinutes,roundTripDistance};
}
export function calculateRoutes({grid,a,b,science,maxSlope,base}){const routes= [{...missionRoute(grid,a,b,science,{maxSlope,weight:0}),id:'short',name:'Menor distancia'},{...missionRoute(grid,a,b,science,{maxSlope,weight:8}),id:'gentle',name:'Menor coste por pendiente'}];if(base!=null)for(const route of routes){const back=missionRoute(grid,b,base,null,{maxSlope,weight:route.id==='gentle'?8:0});route.returnDistance=back.distance;if(grid.radiation)route.returnHazard=radiationStats(back,grid);}return routes}
