// A settled close-up is distinct from a tiny rover on the regional/global map.
// Separate enter/leave distances avoid flicker at the edge of the camera zoom.
export function shouldShowInstruments({enabled,alpha,distance,bounds,width,height,focusing,shown=false}){
 if(!enabled||focusing||alpha<.99||!Number.isFinite(distance)||distance>(shown?6:5)||!bounds)return false;
 const x=(bounds.left+bounds.right)/2,y=(bounds.top+bounds.bottom)/2;
 return bounds.right-bounds.left>=40&&bounds.bottom-bounds.top>=40&&x>=0&&x<=width&&y>=0&&y<=height;
}
