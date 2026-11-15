import {useEffect,useMemo,useRef,useState} from 'react';
import {calculateAdaptiveRoutes,fitMissionScenario} from '../routing/autofit.js';
import {excludeThorium} from '../radiation/model.js';
import {assessMission} from '../routing/mission.js';
import {validScenario,chooseFeasibleRoute,remainingAssessment} from '../routing/cockpit.js';
import {cellIndex,cellCoordinates,worldCoordinates,makeRouteGrid} from '../routing/geometry.js';
export function useRoutePlanner(map,dem,loadError='',enabled=true,thorium=null){
 const[adjustments,setAdjustments]=useState('');
 const[points,setPoints]=useState({a:null,b:null,c:null}),[pick,setPick]=useState(null),[maxSlope,setSlope]=useState(15),[routes,setRoutes]=useState([]),[selected,setSelected]=useState('gentle'),[status,setStatus]=useState('idle'),[error,setError]=useState(''),[running,setRunning]=useState(false),[arrived,setArrived]=useState(false),[scenario,setScenarioState]=useState({speed:2,budget:240,reserve:25,stopMinutes:20,objective:'Observar el relieve'}),[telemetry,setTelemetry]=useState({speed:0,pitch:0,roll:0}),[spent,setSpent]=useState({meters:0,minutes:0});
 const worker=useRef(),fallbackTimer=useRef(),generation=useRef(0),gridCache=useRef(null),routeStartMeters=useRef(0),base=useRef(null),origin=useRef(null),latestPosition=useRef(null),totals=useRef({meters:0,minutes:0}),scienceVisited=useRef(false),pending=useRef(null),latest=useRef(null);
 const grid=useMemo(()=>{if(!dem||!map)return null;if(gridCache.current?.dem===dem&&gridCache.current?.map===map)return gridCache.current.grid;if(!enabled)return null;const grid=makeRouteGrid(dem,map);gridCache.current={dem,map,grid};return grid},[dem,map,enabled]);
 function stopWorker(){generation.current++;worker.current?.terminate();clearTimeout(fallbackTimer.current)}
 function resetTrip(){base.current=null;origin.current=null;totals.current={meters:0,minutes:0};scienceVisited.current=false;setSpent(totals.current)}
 function invalidate(){stopWorker();pending.current=null;setRoutes([]);setStatus('idle');setError('');setAdjustments('');setRunning(false);setArrived(false)}
 useEffect(()=>{invalidate();resetTrip();latestPosition.current=null;setPoints({a:null,b:null,c:null});setPick(null)},[map,dem]);
 useEffect(()=>()=>{stopWorker()},[]);
 function cancelCalculation(){stopWorker();pending.current=null;if(latest.current?.status==='calculating')setRoutes([]);setStatus(s=>s==='calculating'?'idle':s);setRunning(false)}
 function startPicking(which){invalidate();resetTrip();setPick(which)}
 function snap(geo,source=grid){if(!source)throw new Error('La elevación todavía no está lista.');const i=cellIndex(source,geo);if(i<0||!source.mask[i])throw new Error('Ese punto no tiene elevación y cobertura utilizables. Elige otro punto del terreno.');return{index:i,...cellCoordinates(source,i)}}
 function choose(which,geo,{advance=false}={}){invalidate();resetTrip();try{const point=snap(geo);setPoints(old=>({...old,[which]:point,...(advance&&which==='a'?{b:null}:{})}));setPick(advance&&which==='a'?'b':null);return point}catch(error){setError(error.message);return null}}
 function beginRoute(geo,destination=null){invalidate();resetTrip();setPick(null);try{if(!dem||!map)throw new Error('Espera a que termine de cargar el relieve.');const source=gridCache.current?.dem===dem&&gridCache.current?.map===map?gridCache.current.grid:makeRouteGrid(dem,map);gridCache.current={dem,map,grid:source};const a=snap(latestPosition.current||geo,source),b=destination?snap(destination,source):null;setPoints({a,b,c:null});setPick(b?null:'b');return true}catch(error){setError(error.message);return false}}
 function removeScience(){invalidate();setPoints(old=>({...old,c:null}));setPick(null)}
 function calculate({autoRun=false,replan=false,settings=scenario,slope=maxSlope}={}){
  if(!grid||!points.a||!points.b)return;
  stopWorker();setRunning(false);setArrived(false);setError('');setStatus('calculating');
  if(!replan){resetTrip();base.current=points.a;origin.current=null}else if(!base.current)base.current=points.a;
  let a=points.a;try{if(replan&&latestPosition.current){a=snap(latestPosition.current);origin.current={...latestPosition.current};}}catch(e){setError(e.message);setStatus('error');return}
  let routeGrid;try{routeGrid=excludeThorium(grid,thorium||{});if(thorium?.avoid&&(!routeGrid.mask[a.index]||!routeGrid.mask[points.b.index]||(points.c&&!routeGrid.mask[points.c.index])||(base.current&&!routeGrid.mask[base.current.index])))throw new Error('La exclusión de torio bloquea A, B, la parada o la base de retorno. Cambia el límite o el sitio; GRS no distingue zonas locales dentro de sus celdas.')}catch(e){setRoutes([]);setError(e.message);setStatus('error');return}
  const id=generation.current,input={grid:routeGrid,a:a.index,b:points.b.index,base:base.current.index,maxSlope:slope,science:scienceVisited.current?null:points.c?.index};let done=false;
  const finish=data=>{if(done||id!==generation.current)return;done=true;clearTimeout(fallbackTimer.current);worker.current?.terminate();if(data.error){setRoutes([]);setError(data.error+(thorium?.avoid?' También se excluyeron las celdas sobre el límite de torio y sin datos GRS.':''));setStatus('error')}else{routeStartMeters.current=totals.current.meters;const fitted=fitMissionScenario(data.routes,settings,totals.current.minutes),changes=fitted?[...fitted.changes]:[];if(data.slope!=null&&data.slope!==slope){setSlope(data.slope);changes.unshift(`Pendiente ${slope} → ${data.slope}°`)}if(fitted)setScenarioState(fitted.settings);setAdjustments(changes.length?changes.join(' · '):'');setRoutes(data.routes);setSelected(fitted?.route.id||'gentle');setStatus('ready');setRunning(autoRun&&Boolean(fitted));if(!fitted)setError('No se puede completar ida y regreso dentro de los límites del simulador (5 km/h y 720 min). El tiempo ya consumido se conserva; elige un destino más cercano.')}};
  const fallback=()=>{if(done||id!==generation.current)return;worker.current?.terminate();if(grid.width*grid.height>300000){finish({error:'El cálculo no respondió. Prueba un área menor o vuelve a intentarlo.'});return}try{finish(calculateAdaptiveRoutes(input))}catch(error){finish({error:error.message})}};
  try{const w=new Worker(new URL('../routing/route.worker.js',import.meta.url),{type:'module'});worker.current=w;w.onmessage=({data})=>finish(data);w.onerror=fallback;fallbackTimer.current=setTimeout(fallback,grid.width*grid.height>300000?20000:2500);w.postMessage(input)}catch{fallback()}
 }
 const route=routes.find(r=>r.id===selected),path=useMemo(()=>{if(!route||!map)return null;const points=route.path.map(i=>worldCoordinates(map,cellCoordinates(grid,i)));return origin.current?[worldCoordinates(map,origin.current),...points]:points},[route,map,grid]);
 const assessment=route?remainingAssessment(route,scenario,spent,routeStartMeters.current,assessMission):null;
 latest.current={running,route,points,scenario,maxSlope,status};
 const previousThorium=useRef(thorium);
 useEffect(()=>{if(previousThorium.current===thorium)return;previousThorium.current=thorium;updateSettings(scenario,maxSlope)},[thorium]);
 // Stop immediately, debounce only the solver. A cancelled or superseded edit
 // cannot resume a trip through an old worker response.
 function updateSettings(nextScenario,nextSlope){const current=latest.current;stopWorker();setRunning(false);setArrived(false);if(current.points.a&&current.points.b&&(current.route||current.status==='calculating')){pending.current={autoRun:pending.current?.autoRun??current.running,settings:nextScenario,slope:nextSlope};setStatus('calculating')}}
 function setScenario(value){const next=typeof value==='function'?value(latest.current.scenario):value;if(!validScenario(next))return;updateSettings(next,maxSlope);setScenarioState(next)}
 function setMaxSlope(value){updateSettings(scenario,value);setSlope(value)}
 useEffect(()=>{if(!pending.current)return;const job=pending.current;const timer=setTimeout(()=>{if(pending.current!==job)return;pending.current=null;calculate({...job,replan:true})},350);return()=>clearTimeout(timer)},[scenario,maxSlope,thorium]);
 function onMotion(t){latestPosition.current=t.position;if(t.routeMeters>0){totals.current={meters:totals.current.meters+t.routeMeters,minutes:totals.current.minutes+t.routeMinutes};const current=latest.current;if(current.points.c&&current.route?.path.slice(0,Math.max(0,t.routeIndex-(origin.current?1:0))).includes(current.points.c.index))scienceVisited.current=true}}
 function onTelemetry(t){setTelemetry(old=>old.speed===t.speed&&Math.abs(old.pitch-t.pitch)<.01&&Math.abs(old.roll-t.roll)<.01?old:{speed:t.speed,pitch:t.pitch,roll:t.roll});setSpent(old=>old.meters===totals.current.meters?old:{...totals.current})}
 function resume(value){if(value&&(!assessment?.withinBudget||status!=='ready'))return;if(value&&arrived){calculate({autoRun:true});return}setRunning(value);if(value)setArrived(false)}
 return{adjustments,cancelCalculation,startPicking,beginRoute,scenario,setScenario,removeScience,dem,grid,loadError,points,pick,setPick,choose,maxSlope,setMaxSlope,routes,selected,setSelected:v=>{setRunning(false);setArrived(false);setSelected(v)},route,path,status,error,calculate,running,setRunning:resume,arrived,onArrive:()=>{setRunning(false);setArrived(true)},clear:()=>{invalidate();resetTrip();setPoints({a:null,b:null,c:null});setPick(null)},inRegion:Boolean(grid?.mask.some(Boolean)),replanned:Boolean(origin.current),onMotion,onTelemetry,telemetry,spent,assessment,base:base.current};
}
