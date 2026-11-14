import {loadMatchedOrtho} from '../terrain/ortho';
import {useEffect,useState} from 'react';
import {getMarsLayer} from '../data/marsLayers';
import {ctxLayer} from '../data/localMap';
import {loadLocalLayer} from '../data/localLayers';
export function useLocalLayer(map,id,enabled){const[result,setResult]=useState(null),[status,setStatus]=useState('idle'),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!map||!enabled)return;const c=new AbortController();setStatus('loading');setError('');(id==='ctx'?loadMatchedOrtho(map,c.signal):loadLocalLayer(map,getMarsLayer(id),c.signal)).then(value=>{if(!value){setResult(null);setStatus('ready');return}if(c.signal.aborted){value.texture.dispose();return}setResult(value);setStatus('ready')}).catch(e=>{if(!c.signal.aborted){setError(e.message);setStatus('error');c.abort()}});return()=>c.abort()},[map,id,enabled,attempt]);
 useEffect(()=>()=>result?.texture.dispose(),[result]);
 const current=result?.map===map&&result?.layer.id===id?result:null;
 return {texture:current?.texture||map?.texture,layer:current?.layer||ctxLayer,metersPerPixel:current?.metersPerPixel||map?.metersPerPixel,matched:current?.matched||false,status,error,retry:()=>setAttempt(v=>v+1)};
}
