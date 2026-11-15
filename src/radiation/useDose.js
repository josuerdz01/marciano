import {useEffect,useRef,useState} from 'react';
import {scenarioDose} from './model';
export function useDose(minutes,rate,tripKey){const[value,setValue]=useState(0),previous=useRef({minutes:0,tripKey});useEffect(()=>{const old=previous.current;previous.current={minutes,tripKey};if(tripKey!==old.tripKey||minutes<old.minutes){return}const delta=minutes-old.minutes;if(delta>0)setValue(v=>v+scenarioDose(delta,rate))},[minutes,rate,tripKey]);return value}
