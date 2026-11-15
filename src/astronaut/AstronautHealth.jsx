import React,{useEffect,useRef,useState} from 'react';
import {HeartPulse,Wind,Radiation,Clock3,X} from 'lucide-react';
import MissionNumber from '../rover/MissionNumber.jsx';
import {suitResources} from './status';
import './health.css';
export function useSuitMinutes(minutes,context){
 const [total,setTotal]=useState(0),previous=useRef({minutes:0,context});
 useEffect(()=>{const old=previous.current;previous.current={minutes,context};if(context===old.context&&minutes>old.minutes)setTotal(t=>t+minutes-old.minutes)},[minutes,context]);
 return total;
}
export default function AstronautHealth({minutes,picking}){
 const [open,setOpen]=useState(false),[capacity,setCapacity]=useState(480),s=suitResources(minutes,capacity);
 const warning=s.empty?'Sin reserva':s.reserve?'Reserva baja':'Reserva del traje';
 return <section className={`astronaut-health ${s.reserve?'suit-reserve':''} ${picking?'is-picking':''}`} aria-label="Salud del astronauta · simulación">
  <button className="suit-dial" aria-expanded={open} aria-controls="suit-details" aria-label={`Astronauta: oxígeno simulado ${Math.floor(s.oxygen)} por ciento, autonomía ${Math.floor(s.remaining)} minutos. Ver detalles`} onClick={()=>setOpen(v=>!v)}>
   <svg viewBox="0 0 120 120" aria-hidden="true"><circle className="suit-track" cx="60" cy="60" r="52"/><circle className="suit-arc" cx="60" cy="60" r="52" pathLength="100" strokeDasharray={`${s.oxygen} 100`}/></svg>
   <span className="suit-center"><HeartPulse size={20}/><strong>{Math.floor(s.oxygen)}<small>%</small></strong><span>O₂ · RESERVA</span></span>
  </button>
  <span className="suit-caption">ASTRONAUTA <b>SIM.</b></span>
  <div className="suit-readings"><span><Clock3 size={12}/><strong>{Math.floor(s.remaining)}</strong> min</span><span title="No hay dosímetro humano conectado"><Radiation size={12}/>Sin sensor</span></div>
  {s.reserve&&<span className="suit-warning" role="status">{warning}</span>}
  {open&&<aside id="suit-details" className="suit-details" aria-label="Recursos del traje"><div className="suit-details-heading"><HeartPulse size={18}/><strong>Astronauta · recursos</strong><button onClick={()=>setOpen(false)} aria-label="Cerrar recursos del astronauta"><X size={16}/></button></div>
   <dl><div><dt><Wind size={15}/>Oxígeno disponible</dt><dd>{s.oxygen.toFixed(1)}% <small>simulado</small></dd></div><div><dt><Clock3 size={15}/>Autonomía restante</dt><dd>{Math.floor(s.remaining)} min</dd></div><div><dt><Radiation size={15}/>Dosis humana</dt><dd>Sin sensor <small>mSv</small></dd></div></dl>
   <label className="suit-capacity">Autonomía inicial del traje<div><MissionNumber label="Autonomía inicial del traje" min={30} max={1440} step={30} value={capacity} onCommit={setCapacity}/><span>min</span></div></label>
   <p>Escenario de prueba: {capacity} min con consumo uniforme al avanzar. La reserva se conserva entre rutas. No es saturación de oxígeno ni diagnóstico.</p><p>Dosis humana no disponible: requiere un modelo de exposición y blindaje. No se utiliza la dosis electrónica del rover.</p>
   <small className="suit-model-note">{warning} · aviso visual al 20% de reserva.</small>
  </aside>}
 </section>;
}
