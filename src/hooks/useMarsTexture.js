import {useEffect,useState} from 'react';
import {getTextureLayer} from '../data/textureLayers';
import {loadMarsTexture} from '../data/trekWmts';
export function useMarsTexture(id,enabled=true){
 const[result,setResult]=useState(null),[status,setStatus]=useState({state:'loading',progress:0}),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!enabled)return;const controller=new AbortController();setStatus({state:'loading',progress:0});
 loadMarsTexture(getTextureLayer(id),controller.signal,progress=>{if(!controller.signal.aborted)setStatus({state:'loading',progress})}).then(value=>{if(controller.signal.aborted){value.texture.dispose();return}setResult(value);setStatus({state:'ready',progress:100})}).catch(error=>{if(!controller.signal.aborted){setStatus({state:'error',message:error.name==='TimeoutError'?'Mars Trek tardó demasiado en responder.':error.message});controller.abort()}});
 return()=>controller.abort();},[id,attempt,enabled]);
 useEffect(()=>()=>result?.texture.dispose(),[result]);
 return {result,status,retry:()=>setAttempt(n=>n+1)};
}
