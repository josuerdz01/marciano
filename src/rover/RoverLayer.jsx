import Headlamp from './Headlamp';
import React,{useEffect,useRef,useState} from 'react';
import {createPortal,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import Rover from '../Rover';
import {roverScreenBounds,layoutMapLabels} from './labelAvoidance';
// A transparent render layer above map labels. It shares the main camera and
// leaves pointer events to the map; panels and controls retain their own layer.
export default function RoverLayer({parent,avoidance,controls,followEnabled,...props}){const{gl,scene,camera,size}=useThree(),[roverScene]=useState(()=>new THREE.Scene()),renderer=useRef(),layoutTick=useRef(0),followTail=useRef(0),followDelta=useRef(new THREE.Vector3());
 useEffect(()=>{const r=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});r.setClearColor(0,0);r.outputColorSpace=gl.outputColorSpace;r.toneMapping=gl.toneMapping;r.toneMappingExposure=gl.toneMappingExposure;r.setPixelRatio(Math.min(gl.getPixelRatio(),1.5));r.domElement.dataset.roverOverlay='true';r.domElement.setAttribute('aria-hidden','true');Object.assign(r.domElement.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'5',pointerEvents:'none'});gl.domElement.parentElement.appendChild(r.domElement);renderer.current=r;return()=>{renderer.current=null;r.domElement.remove();r.dispose();r.forceContextLoss()}},[gl]);
 useEffect(()=>{renderer.current?.setSize(size.width,size.height,false)},[size.width,size.height]);
 useFrame((_,dt)=>{const root=roverScene.children.find(child=>child.isGroup),orbit=controls?.current;const local=followEnabled&&root?.visible&&orbit&&camera.position.distanceTo(orbit.target)<35;
 if(local){if(root.userData.moving)followTail.current=1.5;else followTail.current=Math.max(0,followTail.current-dt);if(followTail.current>0){const amount=matchMedia('(prefers-reduced-motion: reduce)').matches?1:1-Math.exp(-9*Math.min(dt,.05));followDelta.current.copy(root.position).add(new THREE.Vector3(0,.12,0)).sub(orbit.target).multiplyScalar(amount);camera.position.add(followDelta.current);orbit.target.add(followDelta.current);orbit.update();gl.domElement.dataset.followingRover='true'}else gl.domElement.dataset.followingRover='false'}else{followTail.current=0;gl.domElement.dataset.followingRover='false'}
 gl.render(scene,camera);const r=renderer.current;if(!r)return;const alpha=parent.current?.userData.alpha??0;r.domElement.style.opacity=String(alpha);r.domElement.style.visibility=alpha>.001?'visible':'hidden';if(alpha>.001){r.render(roverScene,camera);layoutTick.current+=dt;if(layoutTick.current>.075){layoutTick.current=0;const root=roverScene.children.find(child=>child.isGroup),bounds=roverScreenBounds(root,camera,size);layoutMapLabels(avoidance,bounds,gl.domElement,size);gl.domElement.dataset.roverScreenBounds=bounds?JSON.stringify(Object.fromEntries(Object.entries(bounds).map(([k,v])=>[k,Math.round(v*10)/10]))):''}}},1);
 return <>{createPortal(<><ambientLight intensity={1.3}/><directionalLight position={[-4,3,5]} intensity={2.5}/><Rover {...props}/></>,roverScene)}{createPortal(<Headlamp roverScene={roverScene} parent={parent} model={props.terrainModel}/>,scene)}</>;
}
