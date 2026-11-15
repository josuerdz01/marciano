import React,{useEffect,useRef,useState} from 'react';
import {HeartPulse,Wind,Radiation,Clock3,X} from 'lucide-react';
import MissionNumber from '../rover/MissionNumber.jsx';
import {astronautStatus} from './status';
import './health.css';
export function useSuitMinutes(minutes,context){
 const [total,setTotal]=useState(0),previous=useRef({minutes:0,context});
 useEffect(()=>{const old=previous.current;previous.current={minutes,context};if(context===old.context&&minutes>old.minutes)setTotal(t=>t+minutes-old.minutes)},[minutes,context]);
 return total;
}
export default function AstronautHealth({minutes,picking,settings,onSettings,dose=0,speed=2}){
 const[open,setOpen]=useState(false),s=astronautStatus(minutes,settings.capacity,dose,settings.limit,settings.rate,speed),warning=s.radiationDanger?'Umbral de exposición alcanzado':s.empty?'Sin reserva de oxígeno':s.reserve?'Reserva baja de oxígeno':'';
 const change=(key,value)=>onSettings(old=>({...old,[key]:value}));
 return <section className={`astronaut-health ${s.reserve?'suit-reserve':''} ${s.danger?'suit-danger':''} ${picking?'is-picking':''}`} aria-label="Salud del astronauta · simulación">
 <button className="suit-dial" aria-expanded={open} aria-controls="suit-details" aria-label={`Astronauta: oxígeno simulado ${Math.floor(s.oxygen)} por ciento, dosis simulada ${dose.toFixed(3)} de ${settings.limit} mSv${s.danger?' · Peligro en el escenario':''}. Ver monitores y ajustes`} onClick={()=>setOpen(v=>!v)}>
 <svg viewBox="0 0 120 120" aria-hidden="true"><circle className="suit-track" cx="60" cy="60" r="52"/><circle className="suit-arc" cx="60" cy="60" r="52" pathLength="100" strokeDasharray={`${s.oxygen} 100`}/></svg><span className="suit-center"><HeartPulse className="suit-heart" size={20}/><strong>{Math.floor(s.oxygen)}<small>%</small></strong><span>O₂ · RESERVA</span></span></button>
 <span className="suit-caption">ASTRONAUTA <b>SIM.</b></span>
 <div className="suit-radiation" aria-label="Radiación del astronauta"><div><Radiation size={13}/><output>{dose.toFixed(3)} <small>/ {settings.limit} mSv</small></output></div><div className="suit-dose-track" role="progressbar" aria-label="Dosis humana simulada respecto al umbral" aria-valuemin={0} aria-valuemax={settings.limit} aria-valuenow={Math.min(dose,settings.limit)}><i style={{width:`${Math.min(100,dose/settings.limit*100)}%`}}/></div></div>
 {s.danger&&<span className="suit-warning" role="alert">{warning}</span>}
 {open&&<aside id="suit-details" className="suit-details" aria-label="Recursos del traje"><div className="suit-details-heading"><HeartPulse className="suit-heart" size={18}/><strong>Astronauta · escenario</strong><button onClick={()=>setOpen(false)} aria-label="Cerrar recursos del astronauta"><X size={16}/></button></div>
 <dl><div><dt><Wind size={15}/>Oxígeno disponible</dt><dd>{s.oxygen.toFixed(1)}%</dd></div><div><dt><Clock3 size={15}/>Autonomía restante</dt><dd>{Math.floor(s.remaining)} min</dd></div><div><dt><Radiation size={15}/>Dosis acumulada · SIM.</dt><dd>{dose.toFixed(3)} / {settings.limit} <small>mSv</small></dd></div></dl>
 <label className="suit-capacity">Umbral de exposición · SIM.<div><MissionNumber label="Umbral de radiación del astronauta" min={.01} max={500} step={.01} value={settings.limit} onCommit={v=>change('limit',v)}/><span>mSv</span></div></label><label className="suit-capacity">Autonomía inicial<div><MissionNumber label="Autonomía inicial del traje" min={30} max={1440} step={30} value={settings.capacity} onCommit={v=>change('capacity',v)}/><span>min</span></div></label>
 <label className="suit-capacity">Tasa de exposición · SIM.<div><MissionNumber label="Tasa simulada de exposición humana" min={0} max={500} step={.1} value={settings.rate} onCommit={v=>change('rate',v)}/><span>mSv/h</span></div></label>
 <p>Recursos consumidos durante el avance. La tasa y el umbral son ajustes del escenario, sin calibración médica ni sensores biomédicos. La dosis humana es independiente de la radiación electrónica del rover y del índice del mapa.</p><small className="suit-model-note">Aviso con oxígeno ≤20 % o al alcanzar el umbral de exposición configurado.</small></aside>}
 </section>;
}
