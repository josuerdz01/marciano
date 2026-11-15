// Deliberate scan: eased sweeps alternate with unequal observation pauses.
const keys=[[0,0],[1.1,0],[3.5,.29],[4.7,.29],[7.5,-.32],[8.8,-.32],[10.5,-.10],[11.5,-.10],[13.5,0],[14,0]];
export function headlampYaw(seconds,reduced=false){if(reduced)return 0;const t=((seconds%14)+14)%14;let i=1;while(i<keys.length-1&&t>keys[i][0])i++;const a=keys[i-1],b=keys[i],u=(t-a[0])/(b[0]-a[0]),s=u*u*u*(u*(u*6-15)+10);return a[1]+(b[1]-a[1])*s}

// Pause the scan at its current bearing; resume without a clock jump.
export function advanceHeadlampTime(seconds,delta,moving){return seconds+(moving?Math.max(0,delta):0)}
