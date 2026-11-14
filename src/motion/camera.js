import {CatmullRomCurve3,Vector3,Quaternion} from 'three';
export const smooth=t=>{const x=Math.min(1,Math.max(0,t));return x*x*x*(x*(x*6-15)+10)};
export const globeDistance=aspect=>7/Math.min(1,aspect);
export function journeyRig(aspect){const fit=1/Math.min(1,aspect);const position=new CatmullRomCurve3([new Vector3(-140+45*fit,140*fit,-220+180*fit),new Vector3(-65*fit,60*fit,100*fit),new Vector3(-12*fit,18*fit,40*fit),new Vector3(0,0,globeDistance(aspect))],false,'centripetal');const target=new CatmullRomCurve3([new Vector3(-140,0,-220),new Vector3(-25,0,-25),new Vector3(-5,0,0),new Vector3(0,0,0)],false,'centripetal');return{sample:t=>({position:position.getPoint(smooth(t)),target:target.getPoint(smooth(t))})}}
export function localRig(map,aspect,topDown,heightY=0){const target=new Vector3(...[map.start[0],heightY,map.start[1]]);if(!topDown)return{target,position:target.clone().add(new Vector3(7,9,10))};const halfZ=Math.max(2,map.height/2-Math.abs(target.z)),halfX=Math.max(2,12-Math.abs(target.x));const height=Math.min(halfZ,halfX/aspect)*.9/Math.tan(21*Math.PI/180);return{target,position:target.clone().add(new Vector3(0,height,.002))}}
// Rotate the viewing direction around the same focal point without dollying.
export function switchLocalRig(position,target,topDown,inclinedDirection=new Vector3(7,9,10)){
 const distance=position.distanceTo(target),direction=topDown?new Vector3(0,1,.0001).normalize():inclinedDirection.clone().normalize();
 return{target:target.clone(),position:target.clone().addScaledVector(direction,distance)};
}
export function rebaseLocalPoint(point,from,to){const oldCenter=from.west+from.span/2,newCenter=to.west+to.span/2,lon=oldCenter+point.x/24*from.span,delta=((lon-newCenter+180)%360+360)%360-180,lat=from.north-(point.z/from.height+.5)*from.span;return new Vector3(delta/to.span*24,point.y*(from.widthKm/to.widthKm),(to.north-lat)/to.span*to.height-to.height/2)}

export function viewRigAt(from,to,fromTarget,toTarget,t){const a=from.clone().sub(fromTarget),b=to.clone().sub(toTarget),distance=Math.exp(Math.log(a.length())*(1-t)+Math.log(b.length())*t),direction=a.normalize(),turn=new Quaternion().setFromUnitVectors(direction,b.normalize()),target=fromTarget.clone().lerp(toTarget,t);return{target,position:direction.applyQuaternion(new Quaternion().slerp(turn,t)).multiplyScalar(distance).add(target)}}
