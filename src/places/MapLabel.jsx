import React,{useEffect,useId,useRef} from 'react';
import './map-label.css';
export default function MapLabel({avoidance,children}){const anchor=useRef(),content=useRef(),leader=useRef(),id=useId();useEffect(()=>{if(!avoidance)return;avoidance.labels.set(id,{anchor:anchor.current,content:content.current,leader:leader.current,offset:{x:0,y:0}});return()=>avoidance.labels.delete(id)},[avoidance,id]);return <div ref={anchor} className="map-label-anchor"><span ref={leader} className="map-label-leader" aria-hidden="true"/><div ref={content} className="map-label-content">{children}</div></div>}
