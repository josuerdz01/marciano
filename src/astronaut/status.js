// A mission resource budget, not a clinical health score or measured SpO2.
export function suitResources(minutes,capacityMinutes=480){
 const capacity=Math.max(1,Number.isFinite(capacityMinutes)?capacityMinutes:480);
 const elapsed=Math.max(0,Number.isFinite(minutes)?minutes:0);
 const remaining=Math.max(0,capacity-elapsed),oxygen=remaining/capacity*100;
 return{remaining,oxygen,reserve:oxygen<=20,empty:remaining===0};
}
