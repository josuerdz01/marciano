import React,{useMemo} from 'react';
import {Html} from '@react-three/drei';
import {explorerPlaces} from './data/explorerPlaces';
import PlaceMarker from './PlaceMarker';
export default function ExplorerPlaces({map,onSelect,heightAt=()=>-.1}){const {inside}=useMemo(()=>explorerPlaces(map),[map]);return <>{inside.map(place=><group key={place.id} position={[place.x,(heightAt(place.x,place.z)??-.1)+.16,place.z]}><Html center zIndexRange={[4,1]}><PlaceMarker place={place} onSelect={onSelect}/></Html></group>)}</>}
