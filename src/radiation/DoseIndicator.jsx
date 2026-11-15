import React,{useState,useEffect} from 'react';
import {Radiation,X} from 'lucide-react';
export default function DoseIndicator({radiation}){
 const exceeded=radiation.limit>0&&radiation.dose>=radiation.limit;
 const [warningOpen,setWarningOpen]=useState(false);
 useEffect(()=>setWarningOpen(exceeded),[exceeded]);
 return <div className={`header-radiation ${exceeded?'radiation-exceeded':''}`}>
 <button className="header-dose" aria-expanded={warningOpen} aria-label={`Radiación electrónica simulada: ${(radiation.dose/1000).toFixed(3)} de ${(radiation.limit/1000).toFixed(0)} krad de silicio${exceeded?' · Umbral alcanzado':''}`} onClick={()=>setWarningOpen(v=>!v)}>
 <Radiation size={20}/><span><small>RADIACIÓN · SIM.</small><strong>{(radiation.dose/1000).toFixed(3)} <span>/ {(radiation.limit/1000).toFixed(0)}</span></strong><small>krad(Si){exceeded?' · UMBRAL ALCANZADO':''}</small></span>
 </button>{warningOpen&&radiation&&<aside className="radiation-warning" role={exceeded?'alert':'status'} aria-label="Aviso de radiación del robot"><div><Radiation size={19}/><strong>{exceeded?'Presupuesto de radiación alcanzado':'Radiación electrónica · simulación'}</strong><button aria-label="Cerrar aviso de radiación" onClick={()=>setWarningOpen(false)}><X size={15}/></button></div><p>{exceeded?'Se alcanzó el umbral configurado. La radiación puede degradar componentes y causar errores de memoria, lecturas incorrectas o fallos electrónicos. No significa que el robot haya fallado; también pueden ocurrir fallos antes del umbral.':'La dosis se estima con una tasa supuesta y tiempo de avance. El presupuesto de referencia no certifica la tolerancia de todo el robot.'}</p><small>{(radiation.dose/1000).toFixed(3)} / {(radiation.limit/1000).toFixed(3)} krad(Si) · escenario sin calibración</small></aside>}</div>
}
