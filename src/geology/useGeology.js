import {contactStyle} from './contactStyles';
import {useEffect,useMemo,useState,useRef} from 'react';
import palette from './palette.json';
import {loadGeology,routeGeology} from './data';
export const unitColors=Object.fromEntries(palette.map(p=>[p.unit,p]));
export function useGeology(map,enabled,route,grid,showTexture=true){const[result,setResult]=useState(null),[status,setStatus]=useState('idle'),[error,setError]=useState(''),[attempt,setAttempt]=useState(0),cache=useRef(null);
 useEffect(()=>{if(!map||!enabled)return;if(cache.current?.map===map&&cache.current?.attempt===attempt){setStatus('ready');return}const c=new AbortController();setStatus('loading');setError('');loadGeology(map,c.signal).then(data=>{if(!c.signal.aborted){cache.current={map,attempt};setResult(data);setStatus('ready')}}).catch(e=>{if(!c.signal.aborted){setStatus('error');setError(e.message)}});return()=>c.abort()},[map,enabled,attempt]);
 const data=result?.map===map?result:null;
 const[texture,setTexture]=useState(null);useEffect(()=>{setTexture(null);if(!data||!showTexture)return;let disposed=false,created;import('three').then(({CanvasTexture,SRGBColorSpace})=>{if(disposed)return;const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');const point=([lon,lat])=>{const center=map.west+map.span/2;lon+=Math.round((center-lon)/360)*360;return[(lon-map.west)/map.span*1024,(map.north-lat)/map.span*1024]};const trace=paths=>{ctx.beginPath();for(const path of paths){path.forEach((p,i)=>{const[x,y]=point(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)})}};
 for(const f of data.polygons){trace(f.geometry.rings);ctx.fillStyle=`rgb(${(unitColors[f.attributes.Unit]?.color||[130,140,130]).slice(0,3).join(',')})`;ctx.fill('evenodd')}
 ctx.strokeStyle='#253129';ctx.lineWidth=2;for(const f of data.contacts){const style=contactStyle(f.attributes.ConType);ctx.setLineDash(style.dash);ctx.strokeStyle=style.color;ctx.globalAlpha=style.alpha;trace(f.geometry.paths);ctx.stroke()}
 const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;created=t;setTexture(t)});return()=>{disposed=true;created?.dispose()}},[data,map,showTexture]);
 const summary=useMemo(()=>routeGeology(data,route,grid),[data,route,grid]);return{data,texture,summary,status:data?'ready':status,error,retry:()=>setAttempt(v=>v+1)};
}
