import React,{useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei';
import * as THREE from 'three';

// Original open cockpit and suited pilot, built from project-owned geometry.
export default function ExplorerCabin(){
 const pilot=useRef(),arm=useRef(),hand=useRef(),started=useRef(null);
 useFrame(({clock})=>{
  started.current??=clock.elapsedTime;
  const elapsed=clock.elapsedTime-started.current;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phase=elapsed%12;
  const greeting=reduced?0:THREE.MathUtils.smoothstep(phase,.4,1.5)*(1-THREE.MathUtils.smoothstep(phase,5,6.2));
  pilot.current.position.y=.04*greeting;
  arm.current.rotation.z=.25+greeting*2.35;
  hand.current.rotation.z=greeting*Math.sin(elapsed*8)*.5;
 });
 return <group>
  <RoundedBox args={[.88,.22,.68]} radius={.1} position={[0,.3,-.04]}><meshStandardMaterial color="#e8e4d3" roughness={.65}/></RoundedBox>
  <RoundedBox args={[.66,.05,.47]} radius={.08} position={[0,.425,-.04]}><meshStandardMaterial color="#28392f" roughness={.8}/></RoundedBox>
  <RoundedBox args={[.4,.25,.12]} radius={.05} position={[0,.5,-.2]}><meshStandardMaterial color="#59694b"/></RoundedBox>
  <group ref={pilot}>
   <RoundedBox args={[.3,.3,.23]} radius={.08} position={[0,.57,-.04]}><meshStandardMaterial color="#e8e4d3" roughness={.8}/></RoundedBox>
   <RoundedBox args={[.23,.19,.08]} radius={.04} position={[0,.58,-.18]}><meshStandardMaterial color="#c6d1ae"/></RoundedBox>
   <mesh position={[0,.78,0]}><sphereGeometry args={[.195,24,20]}/><meshStandardMaterial color="#f1eddd" roughness={.55}/></mesh>
   <mesh position={[0,.79,.137]} scale={[1,.78,.45]}><sphereGeometry args={[.157,24,20]}/><meshStandardMaterial color="#243b36" roughness={.25} metalness={.25}/></mesh>
   <mesh position={[-.065,.835,.2]} rotation={[0,0,-.3]}><capsuleGeometry args={[.012,.055,4,8]}/><meshBasicMaterial color="#b6cabb"/></mesh>
   <mesh position={[0,.665,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.13,.025,8,24]}/><meshStandardMaterial color="#8d9f71"/></mesh>
   <group position={[-.19,.65,-.02]} rotation={[0,0,-.3]}><mesh position={[0,-.1,0]}><capsuleGeometry args={[.063,.1,4,10]}/><meshStandardMaterial color="#e8e4d3"/></mesh><mesh position={[0,-.18,.025]}><sphereGeometry args={[.065,12,12]}/><meshStandardMaterial color="#f1eddd"/></mesh></group>
   <group ref={arm} position={[.19,.65,-.02]}>
    <mesh position={[0,-.15,0]}><capsuleGeometry args={[.063,.22,4,10]}/><meshStandardMaterial color="#e8e4d3"/></mesh>
    <group ref={hand} position={[0,-.32,0]}><RoundedBox args={[.13,.15,.08]} radius={.035}><meshStandardMaterial color="#f1eddd"/></RoundedBox>{[-.04,0,.04].map(x=><mesh key={x} position={[x,-.09,0]}><capsuleGeometry args={[.019,.035,3,8]}/><meshStandardMaterial color="#f1eddd"/></mesh>)}<mesh position={[-.06,.015,.015]}><sphereGeometry args={[.038,10,10]}/><meshStandardMaterial color="#f1eddd"/></mesh></group>
   </group>
  </group>
  {/* Single navigation light and low bumper replace the former character face. */}
  <RoundedBox args={[.7,.1,.1]} radius={.04} position={[0,.04,.43]}><meshStandardMaterial color="#d8ddbf"/></RoundedBox>
  <group position={[0,.1,.46]} rotation={[Math.PI/2,0,0]}><mesh><cylinderGeometry args={[.12,.12,.07,24]}/><meshStandardMaterial color="#344638" roughness={.5}/></mesh><mesh position={[0,.043,0]}><cylinderGeometry args={[.088,.088,.025,24]}/><meshStandardMaterial color="#fff3cd" emissive="#fff1bc" emissiveIntensity={1.5} toneMapped={false}/></mesh></group>
 </group>
}
