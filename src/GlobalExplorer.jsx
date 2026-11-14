import React,{useMemo,useEffect} from 'react';
import {pointLocation} from './navigation/explorer';
import {globalGeometry} from './navigation/globalGeometry';
export default function GlobalExplorer({map,texture,onEnter,pickPoint}){const geometry=useMemo(()=>globalGeometry(map),[map]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry} onClick={e=>{if(e.delta>5)return;e.stopPropagation();if(pickPoint){pickPoint([e.point.x,e.point.z],{x:(e.nativeEvent||e).clientX,y:(e.nativeEvent||e).clientY});return}onEnter(pointLocation(map,e.point.x,e.point.z))}}><meshBasicMaterial map={texture} color={texture?'#ffffff':'#586057'} toneMapped={false}/></mesh>}
