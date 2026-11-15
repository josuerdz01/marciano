export const roverScale=.32;
export const wheelRadius=.27;
export const wheelContacts=[[-.65,-.31],[-.65,.31],[.65,-.31],[.65,.31]];
export const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function supportPose(x,z,yaw,heightAt,scale=roverScale){const c=Math.cos(yaw),s=Math.sin(yaw),contacts=wheelContacts.map(([X,Z])=>heightAt(x+scale*(X*c+Z*s),z+scale*(-X*s+Z*c)));if(contacts.some(h=>h==null||!Number.isFinite(h)))return null;const front=(contacts[1]+contacts[3])/2,back=(contacts[0]+contacts[2])/2,left=(contacts[0]+contacts[1])/2,right=(contacts[2]+contacts[3])/2;return{contacts,height:(front+back)/2+(.18+wheelRadius)*scale,pitch:-Math.atan2(front-back,.62*scale),roll:Math.atan2(right-left,1.3*scale)}}
// Exact underdamped spring integration; no per-frame noise or invented bumps.
export function springStep(state,target,dt,frequency=4,damping=.8){const w=2*Math.PI*frequency,d=w*Math.sqrt(1-damping*damping),x=state.value-target,A=x,B=(state.velocity+damping*w*x)/d,e=Math.exp(-damping*w*dt),cos=Math.cos(d*dt),sin=Math.sin(d*dt),q=A*cos+B*sin;return{value:target+e*q,velocity:e*(-damping*w*q+d*(-A*sin+B*cos))}}
export function advanceRoute(position,path,index,distance){let[x,z]=position,remaining=distance,i=index;while(i<path.length){const[X,Z]=path[i],length=Math.hypot(X-x,Z-z);if(length<=remaining+1e-10){x=X;z=Z;remaining-=length;i++}else{const t=remaining/length;x+=(X-x)*t;z+=(Z-z)*t;break}}return{position:[x,z],index:i,arrived:i>=path.length}}
export function antennaPulse(time){return Math.pow(.5-.5*Math.cos(time*Math.PI*2*1.35),3)}
// Flex is driven by measured chassis motion, never an idle sine/noise loop.
export function antennaStep(state,pose,dt,reducedMotion=false){
 const s=state??{pitch:{value:0,velocity:0},roll:{value:0,velocity:0},heave:{value:0,velocity:0},heightVelocity:pose.height.velocity},limit=reducedMotion?.035:.24,gain=reducedMotion?.15:1,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const pitch=clamp((-pose.pitch.velocity*.95-pose.pitch.value*.12)*gain,-limit,limit),roll=clamp((-pose.roll.velocity*.95-pose.roll.value*.12)*gain,-limit,limit),acceleration=dt>0?(pose.height.velocity-s.heightVelocity)/dt:0,heave=clamp(-acceleration/roverScale*.006*gain,-.025,.025);
 return{pitch:springStep(s.pitch,pitch,dt,2.6,reducedMotion?.9:.48),roll:springStep(s.roll,roll,dt,2.6,reducedMotion?.9:.48),heave:springStep(s.heave,heave,dt,4,.7),heightVelocity:pose.height.velocity};
}
export function antennaLight(motion,time,reducedMotion=false){const amount=Math.max(0,Math.min(1,motion)),pulse=reducedMotion?.6:antennaPulse(time),strength=amount*(.4+.6*pulse);return{strength,emissive:.18+strength*12,opacity:amount*(.4+.55*pulse),haloScale:.6+strength*.55,light:strength*2.5}}
