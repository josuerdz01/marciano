export const roverScale=.32;
export const wheelRadius=.27;
export const wheelContacts=[[-.65,-.31],[-.65,.31],[.65,-.31],[.65,.31]];
export const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function supportPose(x,z,yaw,heightAt,scale=roverScale){const c=Math.cos(yaw),s=Math.sin(yaw),contacts=wheelContacts.map(([X,Z])=>heightAt(x+scale*(X*c+Z*s),z+scale*(-X*s+Z*c)));if(contacts.some(h=>h==null||!Number.isFinite(h)))return null;const front=(contacts[1]+contacts[3])/2,back=(contacts[0]+contacts[2])/2,left=(contacts[0]+contacts[1])/2,right=(contacts[2]+contacts[3])/2;return{contacts,height:(front+back)/2+(.18+wheelRadius)*scale,pitch:-Math.atan2(front-back,.62*scale),roll:Math.atan2(right-left,1.3*scale)}}
// Exact underdamped spring integration; no per-frame noise or invented bumps.
export function springStep(state,target,dt,frequency=4,damping=.8){const w=2*Math.PI*frequency,d=w*Math.sqrt(1-damping*damping),x=state.value-target,A=x,B=(state.velocity+damping*w*x)/d,e=Math.exp(-damping*w*dt),cos=Math.cos(d*dt),sin=Math.sin(d*dt),q=A*cos+B*sin;return{value:target+e*q,velocity:e*(-damping*w*q+d*(-A*sin+B*cos))}}
export function advanceRoute(position,path,index,distance){let[x,z]=position,remaining=distance,i=index;while(i<path.length){const[X,Z]=path[i],length=Math.hypot(X-x,Z-z);if(length<=remaining+1e-10){x=X;z=Z;remaining-=length;i++}else{const t=remaining/length;x+=(X-x)*t;z+=(Z-z)*t;break}}return{position:[x,z],index:i,arrived:i>=path.length}}
export function antennaPulse(time){return Math.pow(.5-.5*Math.cos(time*Math.PI*2*1.35),3)}
