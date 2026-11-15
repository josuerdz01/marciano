import {useEffect,useState} from 'react';
const empty={global:null,local:null};
// Keep the WebGL dependency out of the application shell. Only create GPU
// textures when this overlay is requested, and dispose abandoned requests.
export function useThoriumTextures(data,map,visible,threshold){
 const [result,setResult]=useState(null);
 useEffect(()=>{
  if(!data||!visible)return;
  let cancelled=false,textures;
  import('./thoriumTextures').then(({buildThoriumTextures})=>{
   if(cancelled)return;
   textures=buildThoriumTextures(data,map,threshold);
   setResult({data,map,threshold,textures});
  });
  return()=>{cancelled=true;textures?.global?.dispose();textures?.local?.dispose()};
 },[data,map,visible,threshold]);
 return visible&&result?.data===data&&result.map===map&&result.threshold===threshold?result.textures:empty;
}
