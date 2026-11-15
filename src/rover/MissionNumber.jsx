import React,{useEffect,useRef,useState} from 'react';
import {parseMissionNumber} from './missionNumberValue.js';
// Keep a text draft independent from live telemetry and solver responses.
export default function MissionNumber({value,onCommit,label,min,max,step=1}){
 const [draft,setDraft]=useState(String(value)),[invalid,setInvalid]=useState(false),dirty=useRef(false),latest=useRef(value);
 latest.current=value;
 useEffect(()=>{if(!dirty.current)setDraft(String(value))},[value]);
 const commit=()=>{if(!dirty.current)return;const parsed=parseMissionNumber(draft,min,max);if(parsed==null){setInvalid(true);return}dirty.current=false;setInvalid(false);setDraft(String(parsed));if(parsed!==latest.current)onCommit(parsed)};
 return <input aria-label={label} type="number" min={min} max={max} step={step} value={draft} aria-invalid={invalid||undefined} title={invalid?`Escribe un número entre ${min} y ${max}. Enter aplica; Escape cancela.`:undefined} onChange={e=>{dirty.current=true;setInvalid(false);setDraft(e.target.value)}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur()}else if(e.key==='Escape'){e.preventDefault();dirty.current=false;setDraft(String(latest.current));setInvalid(false);e.currentTarget.blur()}}}/>;
}
