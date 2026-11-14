import {useEffect,useState} from 'react';
import {getMarsLayer} from '../data/marsLayers';
import {ctxLayer} from '../data/localMap';
import {loadLocalLayer} from '../data/localLayers';
export function useLocalLayer(map,id,enabled){const[result,setResult]=useState(null),[status,setStatus]=useState('idle'),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!map||!enabled||id==='ctx')return;const c=new AbortController();setStatus('loading');setError('');loadLocalLayer(map,getMarsLayer(id),c.signal).then(value=>{if(c.signal.aborted){value.texture.dispose();return}setResult(value);setStatus('ready')}).catch(e=>{if(!c.signal.aborted){setError(e.message);setStatus('error');c.abort()}});return()=>c.abort()},[map,id,enabled,attempt]);
 useEffect(()=>()=>result?.texture.dispose(),[result]);
 const current=id==='ctx'||result?.map!==map?null:result;
 return {texture:current?.texture||map?.texture,layer:current?.layer||ctxLayer,metersPerPixel:current?.metersPerPixel||map?.metersPerPixel,status:id==='ctx'?'ready':status,error:id==='ctx'?'':error,retry:()=>setAttempt(v=>v+1)};
}
