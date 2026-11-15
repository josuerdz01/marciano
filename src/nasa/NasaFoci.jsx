import React,{useMemo} from 'react';
import {Line} from '@react-three/drei';
import {nasaFocusRings} from './terrain3D';
export default function NasaFoci({map,model}){const rings=useMemo(()=>nasaFocusRings(map,map.data,model),[map,model]);return rings.map((ring,i)=><group key={i}><Line points={ring.points} color="#d946ef" lineWidth={1.3} transparent opacity={.5} raycast={()=>null}/></group>)}
