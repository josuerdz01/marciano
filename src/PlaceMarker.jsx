import React from 'react';
import PlaceIcon from './places/PlaceIcon';
import {placeType} from './places/categories';
export default function PlaceMarker({place,onSelect,verb='Ver ficha de'}){return <button className="planet-place" title={`${place.name} · ${placeType(place).singular}`} aria-label={`${verb} ${place.name}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect?.(place)}}><PlaceIcon place={place}/>{place.name}</button>}
