export const simulationRate=120;
export const cockpitControls=[
 {id:'speed',label:'Velocidad',unit:'km/h',min:.5,max:5,step:.5},
 {id:'budget',label:'Tiempo disponible',unit:'min',min:30,max:720,step:10},
 {id:'reserve',label:'Reserva',unit:'%',min:0,max:80,step:5},
 {id:'stopMinutes',label:'Trabajo científico',unit:'min',min:0,max:180,step:5}
];
export function validScenario(s){return cockpitControls.every(c=>Number.isFinite(s[c.id])&&s[c.id]>=c.min&&s[c.id]<=c.max)}
export function worldSpeed(speed,widthKm,rate=simulationRate){return speed/3600*rate*24/widthKm}
export function movementMetrics(worldDistance,widthKm,speed){const meters=worldDistance*widthKm/24*1000;return{meters,minutes:meters/(speed*1000)*60}}
export function chooseFeasibleRoute(routes,scenario,assess){return routes.find(r=>r.id==='gentle'&&assess(r,scenario).withinBudget)||routes.find(r=>assess(r,scenario).withinBudget)||null}

export function remainingAssessment(route,scenario,spent,startMeters,assess){return assess({...route,distance:Math.max(0,route.distance-(spent.meters-startMeters))},{...scenario,elapsedMinutes:spent.minutes})}
