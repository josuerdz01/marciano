const clamp=x=>Math.max(0,Math.min(1,x));
export const ease=x=>{const t=clamp(x);return t*t*t*(t*(t*6-15)+10)};
// Local waypoints follow the side ladder, rather than lifting the pilot in an arc.
const stops=[
 [0,0,0,0],[.18,0,0,0],[.34,.16,.34,-.04],
 [.47,.57,.31,-.04],[.60,.70,.10,-.04],
 [.73,.83,-.12,-.04],[.87,1.02,-.40,-.04],[1,1.35,-.46,0]
];
export function pilotPath(progress,outside){
 const p=clamp(progress);let i=1;while(i<stops.length-1&&p>stops[i][0])i++;
 const a=stops[i-1],b=stops[i],t=ease((p-a[0])/(b[0]-a[0]));
 // Blend terrain correction into the lower steps; preserve the measured ground endpoint.
 const correction=ease((p-.58)/.42),x=a[1]+(b[1]-a[1])*t,y=a[2]+(b[2]-a[2])*t,z=a[3]+(b[3]-a[3])*t;
 return {x:x+(outside.x-1.35)*correction,y:y+(outside.y+.46)*correction,z:z+outside.z*correction,stand:ease((p-.18)/.16),climb:ease((p-.34)/.09)*(1-ease((p-.87)/.13))};
}
export function waveEnvelope(seconds){const p=((seconds%8)+8)%8;return ease(p/.8)*(1-ease((p-3.5)/1));}
