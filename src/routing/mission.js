import {findRoute} from './astar.js';
// Cost is symmetric: return follows the same cells in reverse. This is a terrain
// planning scenario, not an energy, suit or astronaut performance model.
export function missionRoute(grid,a,b,science,options){
 const legs=science==null?[findRoute(grid,a,b,options)]:[findRoute(grid,a,science,options),findRoute(grid,science,b,options)];
 let offset=0;const profile=[],path=[];
 for(const [n,leg] of legs.entries()){profile.push(...leg.profile.slice(n?1:0).map(p=>({...p,distance:p.distance+offset})));path.push(...leg.path.slice(n?1:0));offset+=leg.distance;}
 return {path,profile,distance:offset,ascent:legs.reduce((s,l)=>s+l.ascent,0),descent:legs.reduce((s,l)=>s+l.descent,0),maxSlope:Math.max(...legs.map(l=>l.maxSlope)),cost:legs.reduce((s,l)=>s+l.cost,0),visited:legs.reduce((s,l)=>s+l.visited,0)};
}
export function assessMission(route,{speed,budget,reserve,stopMinutes}){
 if(![speed,budget,reserve,stopMinutes].every(Number.isFinite)||speed<=0||budget<=0||reserve<0||reserve>=100||stopMinutes<0)throw new Error('Parámetros de escenario no válidos.');
 const travelMinutes=route.distance*2/(speed*1000)*60,totalMinutes=travelMinutes+stopMinutes,usableMinutes=budget*(1-reserve/100);
 return {travelMinutes,totalMinutes,usableMinutes,marginMinutes:usableMinutes-totalMinutes,withinBudget:totalMinutes<=usableMinutes,roundTripDistance:route.distance*2};
}
