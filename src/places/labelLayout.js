export const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
export const expandRect=(r,p)=>({left:r.left-p,right:r.right+p,top:r.top-p,bottom:r.bottom+p});
export const moveRect=(r,x,y)=>({left:r.left+x,right:r.right+x,top:r.top+y,bottom:r.bottom+y});
const area=r=>Math.max(0,r.right-r.left)*Math.max(0,r.bottom-r.top);
const overlap=(a,b)=>area({left:Math.max(a.left,b.left),right:Math.min(a.right,b.right),top:Math.max(a.top,b.top),bottom:Math.min(a.bottom,b.bottom)});
// Pixel layout only; geographic anchors, DEM and marker coordinates never move.
export function avoidRoverLabel(base,rover,viewport,occupied=[],previous={x:0,y:0}){
 const idle={x:0,y:0,hidden:false};if(!rover)return idle;
 const blocked=expandRect(rover,10),retention=expandRect(rover,18),wasMoved=previous.x||previous.y;
 if(!intersects(base,wasMoved?retention:blocked))return idle;
 const width=base.right-base.left,height=base.bottom-base.top,margin=10;
 const fits=r=>r.left>=margin&&r.top>=margin&&r.right<=viewport.width-margin&&r.bottom<=viewport.height-margin;
 const clear=r=>!intersects(r,blocked);
 const old=moveRect(base,previous.x,previous.y);
 if(wasMoved&&Math.abs(previous.x)>1&&fits(old)&&clear(old)&&!occupied.some(r=>intersects(old,expandRect(r,5))))return{...previous,hidden:false};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v)),candidates=[];
 function add(x,y,lateral=false){if(width>viewport.width-margin*2||height>viewport.height-margin*2)return;x=clamp(x,margin-base.left,viewport.width-margin-base.right);y=clamp(y,margin-base.top,viewport.height-margin-base.bottom);const rect=moveRect(base,x,y);if(!clear(rect)||!fits(rect))return;const obstruction=occupied.reduce((sum,r)=>sum+overlap(rect,expandRect(r,5)),0),switchSide=wasMoved&&Math.sign(x)!==Math.sign(previous.x)?100:0;candidates.push({x,y,hidden:false,obstruction,cost:x*x+y*y+switchSide+(lateral?0:viewport.width*viewport.width)})}
 // Prefer the closest side. Extra lanes let nearby labels stack without
 // displacing a second label onto the rover or outside the viewport.
 for(const offset of [0,-1,1,-2,2,-3,3]){add(blocked.right-base.left+1,offset*(height+8),true);add(blocked.left-base.right-1,offset*(height+8),true);add(offset*(width+8),blocked.top-base.bottom-1);add(offset*(width+8),blocked.bottom-base.top+1)}
 candidates.sort((a,b)=>a.obstruction-b.obstruction||a.cost-b.cost);const best=candidates[0];return best?{x:best.x,y:best.y,hidden:false}:{x:0,y:0,hidden:true};
}
