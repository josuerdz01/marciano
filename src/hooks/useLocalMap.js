import {useEffect,useRef,useState} from 'react';
import {loadLocalMap} from '../data/localMap';
import {sameSite} from '../navigation/intent';
export function useLocalMap(site,enabled){const[result,setResult]=useState(null),[status,setStatus]=useState('idle'),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),loaded=useRef(null),loadedAttempt=useRef(-1);
 useEffect(()=>{if(!enabled)return;if(sameSite(loaded.current?.site,site)&&loadedAttempt.current===attempt){setStatus('ready');setError('');return}const c=new AbortController();setStatus('loading');setError('');loadLocalMap(site,c.signal).then(map=>{if(c.signal.aborted){map.texture.dispose();return}loaded.current=map;loadedAttempt.current=attempt;setResult(map);setStatus('ready')}).catch(e=>{if(!c.signal.aborted){setError(e.message);setStatus('error');c.abort()}});return()=>c.abort()},[site.lon,site.lat,site.detail,enabled,attempt]);
 useEffect(()=>()=>result?.texture.dispose(),[result]);return{result,status,error,retry:()=>setAttempt(x=>x+1)}}
