import {useEffect,useMemo,useState} from 'react';
import {CanvasTexture,SRGBColorSpace} from 'three';
import palette from './palette.json';
import {loadGeology,routeGeology} from './data';
export const unitColors=Object.fromEntries(palette.map(p=>[p.unit,p]));
export function useGeology(map,enabled,route,grid){const[result,setResult]=useState(null),[status,setStatus]=useState('idle'),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{if(!map||!enabled)return;const c=new AbortController();setStatus('loading');setError('');loadGeology(map,c.signal).then(data=>{if(!c.signal.aborted){setResult(data);setStatus('ready')}}).catch(e=>{if(!c.signal.aborted){setStatus('error');setError(e.message)}});return()=>c.abort()},[map,enabled,attempt]);
 const data=result?.map===map?result:null;
 const texture=useMemo(()=>{if(!data)return null;const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');const point=([lon,lat])=>{const center=map.west+map.span/2;lon+=Math.round((center-lon)/360)*360;return[(lon-map.west)/map.span*1024,(map.north-lat)/map.span*1024]};const trace=paths=>{ctx.beginPath();for(const path of paths){path.forEach((p,i)=>{const[x,y]=point(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)})}};
 for(const f of data.polygons){trace(f.geometry.rings);ctx.fillStyle=`rgb(${(unitColors[f.attributes.Unit]?.color||[130,140,130]).slice(0,3).join(',')})`;ctx.fill('evenodd')}
 ctx.strokeStyle='#253129';ctx.lineWidth=2;for(const f of data.contacts){ctx.setLineDash(f.attributes.ConType==='Certain'?[]:[6,5]);trace(f.geometry.paths);ctx.stroke()}
 const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;return t},[data,map]);useEffect(()=>()=>texture?.dispose(),[texture]);
 const summary=useMemo(()=>routeGeology(data,route,grid),[data,route,grid]);return{data,texture,summary,status:data?'ready':status,error,retry:()=>setAttempt(v=>v+1)};
}
