import {useEffect,useMemo,useRef,useState} from 'react';
import {calculateRoutes} from '../routing/mission.js';
import {cellIndex,cellCoordinates,worldCoordinates,makeRouteGrid} from '../routing/geometry.js';
export function useRoutePlanner(map,dem,loadError='',enabled=true){const[points,setPoints]=useState({a:null,b:null,c:null}),[pick,setPick]=useState(null),[maxSlope,setMaxSlope]=useState(15),[routes,setRoutes]=useState([]),[selected,setSelected]=useState('gentle'),[status,setStatus]=useState('idle'),[error,setError]=useState(''),[running,setRunning]=useState(false),[arrived,setArrived]=useState(false);const[scenario,setScenario]=useState({speed:2,budget:240,reserve:25,stopMinutes:20,objective:'Observar el relieve'});const worker=useRef(),fallbackTimer=useRef(),generation=useRef(0);
 const gridCache=useRef(null);const grid=useMemo(()=>{if(!dem||!map)return null;if(gridCache.current?.dem===dem&&gridCache.current?.map===map)return gridCache.current.grid;if(!enabled)return null;const grid=makeRouteGrid(dem,map);gridCache.current={dem,map,grid};return grid},[dem,map,enabled]);
 useEffect(()=>{generation.current++;worker.current?.terminate();clearTimeout(fallbackTimer.current);setRoutes([]);setPoints({a:null,b:null,c:null});setPick(null);setStatus('idle');setError('');setRunning(false);setArrived(false)},[map,dem]);
 useEffect(()=>()=>{generation.current++;worker.current?.terminate();clearTimeout(fallbackTimer.current)},[]);
 const invalidate=()=>{generation.current++;worker.current?.terminate();clearTimeout(fallbackTimer.current);setRoutes([]);setStatus('idle');setError('');setRunning(false);setArrived(false)};
 function choose(which,geo){invalidate();if(!grid){setError('La elevación todavía no está lista.');return}const i=cellIndex(grid,geo);if(i<0||!grid.mask[i]){setError('Ese punto no tiene elevación y cobertura utilizables en esta región.');return}setPoints(old=>({...old,[which]:{index:i,...cellCoordinates(grid,i)}}));setPick(null)}
 function removeScience(){invalidate();setPoints(old=>({...old,c:null}));setPick(null)}
 function calculate(){if(!grid||!points.a||!points.b)return;invalidate();setStatus('calculating');const id=generation.current,input={grid,a:points.a.index,b:points.b.index,maxSlope,science:points.c?.index};let done=false;
 const finish=data=>{if(done||id!==generation.current)return;done=true;clearTimeout(fallbackTimer.current);worker.current?.terminate();if(data.error){setError(data.error);setStatus('error')}else{setRoutes(data.routes);setSelected('gentle');setStatus('ready')}};
 // Some embedded browsers defer module workers indefinitely. Keep the same
 // numerical solver as a bounded-area fallback, never leave the UI locked.
 const fallback=()=>{if(done||id!==generation.current)return;worker.current?.terminate();if(grid.width*grid.height>300000){finish({error:'El cálculo no respondió. Prueba un área menor o vuelve a intentarlo.'});return}try{finish({routes:calculateRoutes(input)})}catch(error){finish({error:error.message})}};
 try{const w=new Worker(new URL('../routing/route.worker.js',import.meta.url),{type:'module'});worker.current=w;w.onmessage=({data})=>finish(data);w.onerror=fallback;fallbackTimer.current=setTimeout(fallback,grid.width*grid.height>300000?20000:2500);w.postMessage(input)}catch{fallback()}
 }

 const route=routes.find(r=>r.id===selected),path=useMemo(()=>route&&map?route.path.map(i=>worldCoordinates(map,cellCoordinates(grid,i))):null,[route,map,grid]);
 return{scenario,setScenario,removeScience,dem,grid,loadError,points,pick,setPick,choose,maxSlope,setMaxSlope:v=>{invalidate();setMaxSlope(v)},routes,selected,setSelected:v=>{setRunning(false);setArrived(false);setSelected(v)},route,path,status,error,calculate,running,setRunning:value=>{setRunning(value);if(value)setArrived(false)},arrived,onArrive:()=>{setRunning(false);setArrived(true)},clear:()=>{invalidate();setPoints({a:null,b:null,c:null});setPick(null)},inRegion:Boolean(grid?.mask.some(Boolean))};
}
