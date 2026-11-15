// A mission resource budget, not a clinical health score or measured SpO2.
export function suitResources(minutes,capacityMinutes=480){
 const capacity=Math.max(1,Number.isFinite(capacityMinutes)?capacityMinutes:480);
 const elapsed=Math.max(0,Number.isFinite(minutes)?minutes:0);
 const remaining=Math.max(0,capacity-elapsed),oxygen=remaining/capacity*100;
 return{remaining,oxygen,reserve:oxygen<=20,empty:remaining===0};
}

// User-defined exposure scenario. The threshold is not a medical tolerance.
export function astronautStatus(minutes,capacity,dose,limit,rate,speed){const suit=suitResources(minutes,capacity),remainingDose=Math.max(0,limit-dose),radiationDanger=limit>0&&dose>=limit,exposureMinutes=rate>0?remainingDose/rate*60:Infinity,rangeKm=Math.max(0,Math.min(suit.remaining,exposureMinutes))/60*Math.max(0,speed);return{...suit,dose,limit,remainingDose,exposureMinutes,rangeKm,radiationDanger,danger:suit.reserve||radiationDanger}}
