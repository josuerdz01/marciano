import React,{useMemo,useRef,useState} from 'react';
import {Html} from '@react-three/drei';
import {useFrame,useThree} from '@react-three/fiber';
import {BufferGeometry,Float32BufferAttribute,Vector3} from 'three';
import {knownPlaces} from './data/explorerPlaces';
import {mapPoint,visiblePlaces} from './navigation/explorer';
import PlaceMarker from './PlaceMarker';
import MapLabel from './places/MapLabel';
import {matchesCategory} from './places/categories';
import {landmarks} from './data/landmarks';
const featured=new Set(landmarks.map(p=>p.featureId));
export default function ExplorerPlaces({map,onSelect,category='all',avoidance,heightAt=()=>-.1}){const{camera,size}=useThree(),[labels,setLabels]=useState([]),tick=useRef(0),last=useRef(''),projection=useRef(new Vector3()),view=useRef(null);const places=useMemo(()=>knownPlaces.filter(p=>matchesCategory(p,category)).map(place=>{const[x,z]=mapPoint(map,place);return{...place,x,z,y:(Math.abs(x)<=12&&Math.abs(z)<=map.height/2?heightAt(x,z)??-.1:-.25)+.16}}).sort((a,b)=>(Number(featured.has(b.featureId))-Number(featured.has(a.featureId)))||((b.diameterKm||0)-(a.diameterKm||0))),[map,heightAt,category]);const geometry=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(places.flatMap(p=>[p.x,p.y,p.z]),3));return g},[places]);React.useEffect(()=>()=>geometry.dispose(),[geometry]);useFrame((_,dt)=>{tick.current+=dt;if(tick.current<.18)return;tick.current=0;const signature=[...camera.matrixWorld.elements,...camera.projectionMatrix.elements,size.width,size.height];if(view.current?.places===places&&signature.every((v,i)=>v===view.current.signature[i]))return;view.current={places,signature};const visible=visiblePlaces(places,camera,size.width,size.height,p=>projection.current.set(p.x,p.y,p.z).project(camera)),ids=visible.map(p=>p.id).join();if(ids!==last.current){last.current=ids;setLabels(visible)}});return <><points geometry={geometry} raycast={()=>null}><pointsMaterial color="#b8cc97" size={4} sizeAttenuation={false} transparent opacity={.8} depthTest={false}/></points>{labels.map(place=><group key={place.id} position={[place.x,place.y,place.z]}><Html center zIndexRange={[4,1]}><MapLabel avoidance={avoidance}><PlaceMarker place={place} onSelect={onSelect} verb="Ir a"/></MapLabel></Html></group>)}</>}
