import React from 'react';
export default function PlaceMarker({place,onSelect,verb='Ver ficha de'}){return <button className="planet-place" aria-label={`${verb} ${place.name}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect?.(place)}}><span aria-hidden="true"/>{place.name}</button>}
