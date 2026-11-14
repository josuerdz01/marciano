import React from 'react';
import {Flame,CircleDot,Mountain,Route,Split,Layers,Waves,Layers2,CircleDashed,Network,Map} from 'lucide-react';
import {placeType} from './categories';
const icons={Flame,CircleDot,Mountain,Route,Split,Layers,Waves,Layers2,CircleDashed,Network,Map};
export default function PlaceIcon({place,type,size=15,...props}){const kind=(type||placeType(place)).icon;if(kind==='Volcano')return <span className="place-volcano-icon" style={{width:size,height:size}} aria-hidden="true"><Mountain size={size} strokeWidth={1.7}/><Flame size={Math.round(size*.55)} strokeWidth={1.7} className="volcano-plume"/></span>;const Icon=icons[kind]||Map;return <Icon size={size} strokeWidth={1.7} aria-hidden="true" {...props}/>}
