const clamp=x=>Math.max(0,Math.min(1,x));
export const ease=x=>{const t=clamp(x);return t*t*t*(t*(t*6-15)+10)};
// Local waypoints follow the side ladder, rather than lifting the pilot in an arc.
const stops=[
 [0,0,0,0],[.18,0,0,0],[.34,.16,.34,-.04],
 [.47,.57,.31,-.04],[.60,.70,.10,-.04],
 [.73,.83,-.12,-.04],[.87,1.02,-.40,-.04],[1,1.35,-.46,0]
];
// Shared tangent at each rung avoids the previous stop at every waypoint.
function waypoint(p,i,k){
 const a=stops[i-1],b=stops[i],h=b[0]-a[0],t=(p-a[0])/h;
 const slope=j=>{if(j===0||j===stops.length-1)return 0;const h0=stops[j][0]-stops[j-1][0],h1=stops[j+1][0]-stops[j][0],d0=(stops[j][k]-stops[j-1][k])/h0,d1=(stops[j+1][k]-stops[j][k])/h1;if(d0*d1<=0)return 0;const w0=2*h1+h0,w1=h1+2*h0;return(w0+w1)/(w0/d0+w1/d1)};
 return(2*t*t*t-3*t*t+1)*a[k]+(t*t*t-2*t*t+t)*h*slope(i-1)+(-2*t*t*t+3*t*t)*b[k]+(t*t*t-t*t)*h*slope(i);
}
export function pilotPath(progress,outside){
 const p=clamp(progress);let i=1;while(i<stops.length-1&&p>stops[i][0])i++;
 
 // Blend terrain correction into the lower steps; preserve the measured ground endpoint.
 const correction=ease((p-.58)/.42),x=waypoint(p,i,1),y=waypoint(p,i,2),z=waypoint(p,i,3);
 return {x:x+(outside.x-1.35)*correction,y:y+(outside.y+.46)*correction,z:z+outside.z*correction,stand:ease((p-.18)/.16),climb:ease((p-.34)/.09)*(1-ease((p-.87)/.13))};
}
export function waveEnvelope(seconds){const p=((seconds%8)+8)%8;return ease(p/.8)*(1-ease((p-3.5)/1));}

export function departureWave(seconds){return ease(seconds/.35)*(1-ease((seconds-1.25)/.55))}

export function greetingArm(greeting,seconds,climb=0){return{shoulder:.18+greeting*2.65+.6*climb,elbow:greeting*(.15+.14*Math.sin(seconds*5.5))-.55*climb,wrist:greeting*Math.sin(seconds*5.5)*.22}}
