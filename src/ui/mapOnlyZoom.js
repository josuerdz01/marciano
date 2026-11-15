// Keep browser magnification separate from the camera's OrbitControls zoom.
// A capture listener cancels the browser default without swallowing canvas events.
export function installMapOnlyZoom(target=window){
 const wheel=event=>{
  if(!event.ctrlKey&&!event.metaKey)return;
  event.preventDefault();
  if(event.target?.tagName!=='CANVAS')event.stopPropagation();
 };
 const keyboard=event=>{
  if((event.ctrlKey||event.metaKey)&&['+','=','-','_','0','Add','Subtract'].includes(event.key))event.preventDefault();
 };
 const gesture=event=>event.preventDefault();
 const options={capture:true,passive:false};
 target.addEventListener('wheel',wheel,options);
 target.addEventListener('keydown',keyboard,true);
 for(const name of ['gesturestart','gesturechange','gestureend'])target.addEventListener(name,gesture,options);
 return()=>{
  target.removeEventListener('wheel',wheel,true);
  target.removeEventListener('keydown',keyboard,true);
  for(const name of ['gesturestart','gesturechange','gestureend'])target.removeEventListener(name,gesture,true);
 };
}
