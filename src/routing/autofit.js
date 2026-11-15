import {calculateRoutes,assessMission} from './mission.js';
import {chooseFeasibleRoute} from './cockpit.js';
// Search only within supported scenario limits; unknown terrain and exclusion masks stay hard constraints.
export function calculateAdaptiveRoutes(input){if(input.allowAdjustments===false)return{routes:calculateRoutes(input),slope:input.maxSlope};let error;const slopes=[input.maxSlope,...[5,10,15,20,25,30].filter(v=>v>input.maxSlope)];for(const slope of slopes){try{return{routes:calculateRoutes({...input,maxSlope:slope}),slope}}catch(e){error=e;if(input.a===input.b)break}}throw error}
export function fitMissionScenario(routes,settings,elapsedMinutes=0){const fits=s=>chooseFeasibleRoute(routes,{...s,elapsedMinutes},assessMission);let route=fits(settings);if(route)return{route,settings,changes:[]};
 const candidates=[];for(const r of routes){const next={...settings},distance=r.distance+(r.returnDistance??r.distance),budgetFor=()=>Math.ceil((elapsedMinutes+distance/(next.speed*1000)*60+next.stopMinutes)/(1-next.reserve/100)/10)*10;
 // Preserve pace, reserve and science when extending the time window is enough.
 next.budget=Math.max(next.budget,budgetFor());
 if(next.budget>720){next.budget=720;const travelRoom=720*(1-next.reserve/100)-elapsedMinutes-next.stopMinutes;next.speed=Math.min(5,Math.max(settings.speed,travelRoom>0?Math.ceil(distance/(travelRoom/60)/1000*2)/2:5))}
 if(!assessMission(r,{...next,elapsedMinutes}).withinBudget){next.speed=5;for(let reserve=settings.reserve;reserve>=0;reserve=Math.max(-1,reserve-5)){next.reserve=Math.max(0,reserve);if(assessMission(r,{...next,elapsedMinutes}).withinBudget||reserve===0)break;if(reserve<5)reserve=5}}
 if(!assessMission(r,{...next,elapsedMinutes}).withinBudget){const remaining=720*(1-next.reserve/100)-elapsedMinutes-distance/(next.speed*1000)*60;next.stopMinutes=Math.max(0,Math.min(settings.stopMinutes,Math.floor(remaining/5)*5))}
 if(assessMission(r,{...next,elapsedMinutes}).withinBudget)candidates.push({route:r,settings:next});}
 if(!candidates.length)return null;
 // Prefer the scenario that changes the fewest knobs; then the shorter time window.
 const cost=x=>['speed','budget','reserve','stopMinutes'].filter(k=>x.settings[k]!==settings[k]).length;
 candidates.sort((a,b)=>cost(a)-cost(b)||a.settings.budget-b.settings.budget||a.route.distance-b.route.distance);
 const best=candidates[0],labels={speed:'Velocidad',budget:'Tiempo',reserve:'Reserva',stopMinutes:'Ciencia'},units={speed:'km/h',budget:'min',reserve:'%',stopMinutes:'min'};
 return{...best,changes:Object.keys(labels).filter(k=>best.settings[k]!==settings[k]).map(k=>`${labels[k]} ${settings[k]} → ${best.settings[k]} ${units[k]}`)};
}

export function resolveMissionScenario(routes,settings,elapsedMinutes=0,allowAdjustments=true){if(allowAdjustments)return fitMissionScenario(routes,settings,elapsedMinutes);const route=chooseFeasibleRoute(routes,{...settings,elapsedMinutes},assessMission);return route?{route,settings,changes:[]}:null}
