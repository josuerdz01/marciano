import {headlampYaw} from './headlampMotion';
import React,{useMemo,useRef,useEffect} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';

// The rover has a separate overlay renderer. Place illumination in the terrain
// scene so the spotlight can actually reach the map, rather than only the car.
export default function Headlamp({roverScene,parent,model}){
 const group=useRef(),light=useRef(),beam=useRef();
 const target=useMemo(()=>new THREE.Object3D(),[]),source=useMemo(()=>new THREE.Vector3(),[]),end=useMemo(()=>new THREE.Vector3(),[]),axis=useMemo(()=>new THREE.Vector3(0,1,0),[]);
 const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(1,1,8,16);return g},[]);
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d');x.scale(1,2);const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,245,195,.65)');g.addColorStop(.45,'rgba(255,245,195,.25)');g.addColorStop(1,'rgba(255,245,195,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)},[]);
 useEffect(()=>()=>{geometry.dispose();texture.dispose()},[geometry,texture]);
 useFrame(({clock})=>{
  const root=roverScene.children.find(c=>c.isGroup),chassis=root?.getObjectByName('rover-chassis'),alpha=parent.current?.userData.alpha??0;
  group.current.visible=Boolean(root?.visible&&chassis&&alpha>.01);if(!group.current.visible)return;
  const scan=headlampYaw(clock.elapsedTime,matchMedia('(prefers-reduced-motion: reduce)').matches);root.updateWorldMatrix(true,true);source.set(Math.sin(scan)*.06,.1,.46+Math.cos(scan)*.06);chassis.localToWorld(source);end.set(Math.sin(scan)*3.5,-.65,.46+Math.cos(scan)*3.5);chassis.localToWorld(end);
  light.current.position.copy(source);target.position.copy(end);target.updateMatrixWorld();light.current.intensity=2.4*alpha;
  const distance=source.distanceTo(end);beam.current.position.copy(source).lerp(end,.5);beam.current.quaternion.setFromUnitVectors(axis,source.clone().sub(end).normalize());beam.current.scale.set(.23,distance,.23);
  const a=geometry.attributes.position,uv=geometry.attributes.uv,yaw=root.rotation.y+scan,scale=root.scale.x;
  for(let i=0;i<a.count;i++){const across=(uv.getX(i)-.5)*1.65,forward=.6+uv.getY(i)*3.8,x=root.position.x+Math.sin(root.rotation.y)*.46*scale+(Math.cos(yaw)*across+Math.sin(yaw)*forward)*scale,z=root.position.z+Math.cos(root.rotation.y)*.46*scale+(-Math.sin(yaw)*across+Math.cos(yaw)*forward)*scale,h=model?model.heightAt(x,z):-.1;a.setXYZ(i,x,(h??root.position.y-.45*scale)+.006,z)}
  a.needsUpdate=true;geometry.computeBoundingSphere();
 });
 return <group ref={group} visible={false}>
  <primitive object={target}/><spotLight ref={light} color="#fff2c6" target={target} angle={.25} penumbra={.8} distance={3} decay={2}/>
  <mesh ref={beam} raycast={()=>null}><coneGeometry args={[1,1,24,1,true]}/><meshBasicMaterial color="#fff1bd" transparent opacity={.018} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>
  <mesh geometry={geometry} raycast={()=>null}><meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={.42} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending}/></mesh>
 </group>
}
