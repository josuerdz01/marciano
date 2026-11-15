import {useEffect,useRef,useState} from 'react';
export default function useEnergy(meters,consumption,context){const[value,setValue]=useState(0),previous=useRef({meters:0,context});useEffect(()=>{const old=previous.current;previous.current={meters,context};if(context===old.context&&meters>old.meters)setValue(v=>v+(meters-old.meters)/1000*consumption)},[meters,consumption,context]);return value}
