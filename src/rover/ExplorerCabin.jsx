import {ladderDeployment} from './boarding';
import {pilotPath,waveEnvelope,departureWave,greetingArm} from './pilotMotion';
import React,{useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei';
import * as THREE from 'three';

// Original open cockpit and suited pilot, built from project-owned geometry.
export default function ExplorerCabin({boarding,chassis}){
 const pilot=useRef(),arm=useRef(),hand=useRef(),started=useRef(null),canopy=useRef(),headlight=useRef(),legs=useRef([]),knees=useRef([]),leftArm=useRef(),elbow=useRef(),body=useRef(),head=useRef(),wave=useRef(0),ladder=useRef(),turn=useRef(new THREE.Quaternion()),vertical=useRef(new THREE.Vector3(0,1,0)),identity=useRef(new THREE.Quaternion());
 useFrame(({clock},delta)=>{
  started.current??=clock.elapsedTime;
  const elapsed=clock.elapsedTime-started.current;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=boarding.current.progress,outside=boarding.current.outside,pose=pilotPath(progress,outside);
  const target=reduced?0:boarding.current.wantsMotion?(boarding.current.greeting!==null?departureWave(boarding.current.greeting):0):progress>.98?waveEnvelope(elapsed):0;
  wave.current=THREE.MathUtils.damp(wave.current,target,14,Math.min(delta,.05));
  const greeting=wave.current,climb=pose.climb,step=progress*Math.PI*8;
  pilot.current.position.set(pose.x,pose.y+(reduced?0:Math.sin(elapsed*1.7)*.004*pose.stand*(1-climb)),pose.z);
  pilot.current.quaternion.copy(chassis.current.quaternion).invert().slerp(identity.current,1-pose.stand);
  turn.current.setFromAxisAngle(vertical.current,-Math.PI/2*climb);pilot.current.quaternion.multiply(turn.current);
  body.current.rotation.z=-.09*climb+.025*greeting;
  head.current.rotation.z=.035*greeting;
  const salute=greetingArm(greeting,elapsed,climb);arm.current.rotation.set(-.25*climb,0,salute.shoulder);
  elbow.current.rotation.z=salute.elbow;
  hand.current.rotation.z=salute.wrist;
  leftArm.current.rotation.set(-.25*climb,0,-.18-.65*climb);
  legs.current.forEach((leg,i)=>{const stride=Math.sin(step+i*Math.PI);if(leg)leg.rotation.x=-1.1*(1-pose.stand)+stride*.28*climb;if(knees.current[i])knees.current[i].rotation.x=Math.max(0,-stride)*.55*climb});
  const deployment=ladderDeployment(progress);ladder.current.visible=deployment>.001;ladder.current.scale.set(.15+.85*deployment,(.36-outside.y)/.82*(.08+.92*deployment),1);ladder.current.position.y=.28+.08*deployment;
  headlight.current.rotation.y=chassis.current.parent?.userData.headlampYaw??0;
  canopy.current.rotation.x=-THREE.MathUtils.smoothstep(progress,.02,.22)*1.45;
 });
 return <group>
  <RoundedBox args={[.88,.22,.68]} radius={.1} position={[0,.3,-.04]}><meshStandardMaterial color="#e8e4d3" roughness={.65}/></RoundedBox>
  <RoundedBox args={[.66,.05,.47]} radius={.08} position={[0,.425,-.04]}><meshStandardMaterial color="#28392f" roughness={.8}/></RoundedBox>
  <RoundedBox args={[.4,.25,.12]} radius={.05} position={[0,.5,-.2]}><meshStandardMaterial color="#59694b"/></RoundedBox>
  <group ref={canopy} position={[0,.43,-.32]}>
   <mesh position={[0,0,.28]} scale={[.48,.65,.43]}><sphereGeometry args={[1,32,20,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#d7eee2" transparent opacity={.19} roughness={.16} metalness={.15} side={THREE.DoubleSide} depthWrite={false}/></mesh>
   <mesh position={[0,0,.28]} rotation={[Math.PI/2,0,0]} scale={[.48,.43,1]}><torusGeometry args={[1,.035,8,32]}/><meshStandardMaterial color="#c6d1ae"/></mesh>
  </group>
  <group ref={ladder} position={[.53,.36,-.04]}>
   {[-.19,.19].map(z=><mesh key={z} position={[.235,-.40,z]} rotation={[0,0,.531]}><cylinderGeometry args={[.023,.023,.93,10]}/><meshStandardMaterial color="#879776" metalness={.35} roughness={.55}/></mesh>)}
   {[0,1,2,3].map(i=><RoundedBox key={i} args={[.16,.045,.38]} radius={.015} position={[.06+i*.12,-.10-i*.20,0]}><meshStandardMaterial color="#d4dbbd" metalness={.2} roughness={.65}/></RoundedBox>)}
  </group>
  <group ref={pilot}><group ref={body}>
   {[-.085,.085].map((x,i)=><group key={i} ref={el=>legs.current[i]=el} position={[x,.42,-.02]}>
    <mesh position={[0,-.08,0]}><capsuleGeometry args={[.06,.07,4,10]}/><meshStandardMaterial color="#e8e4d3"/></mesh>
    <group ref={el=>knees.current[i]=el} position={[0,-.17,0]}><mesh position={[0,-.075,0]}><capsuleGeometry args={[.055,.07,4,10]}/><meshStandardMaterial color="#e8e4d3"/></mesh><RoundedBox args={[.14,.09,.2]} radius={.035} position={[0,-.19,.04]}><meshStandardMaterial color="#53664c"/></RoundedBox></group>
   </group>)}
   <RoundedBox args={[.3,.3,.23]} radius={.08} position={[0,.57,-.04]}><meshStandardMaterial color="#e8e4d3" roughness={.8}/></RoundedBox>
   <RoundedBox args={[.23,.19,.08]} radius={.04} position={[0,.58,-.18]}><meshStandardMaterial color="#c6d1ae"/></RoundedBox>
   <group ref={head} position={[0,.665,0]}><mesh position={[0,.115,0]}><sphereGeometry args={[.195,24,20]}/><meshStandardMaterial color="#f1eddd" roughness={.55}/></mesh>
   <mesh position={[0,.125,.137]} scale={[1,.78,.45]}><sphereGeometry args={[.157,24,20]}/><meshStandardMaterial color="#243b36" roughness={.25} metalness={.25}/></mesh>
   <mesh position={[-.065,.17,.2]} rotation={[0,0,-.3]}><capsuleGeometry args={[.012,.055,4,8]}/><meshBasicMaterial color="#b6cabb"/></mesh>
   </group><mesh position={[0,.665,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.13,.025,8,24]}/><meshStandardMaterial color="#8d9f71"/></mesh>
   <group ref={leftArm} position={[-.19,.65,-.02]} rotation={[0,0,-.3]}><mesh position={[0,-.1,0]}><capsuleGeometry args={[.063,.1,4,10]}/><meshStandardMaterial color="#e8e4d3"/></mesh><mesh position={[0,-.18,.025]}><sphereGeometry args={[.065,12,12]}/><meshStandardMaterial color="#f1eddd"/></mesh></group>
   <group ref={arm} position={[.19,.65,-.02]}>
    <mesh position={[0,-.08,0]}><capsuleGeometry args={[.06,.08,4,10]}/><meshStandardMaterial color="#e8e4d3"/></mesh><group ref={elbow} position={[0,-.17,0]}><mesh position={[0,-.075,0]}><capsuleGeometry args={[.055,.08,4,10]}/><meshStandardMaterial color="#e8e4d3"/></mesh>
    <group ref={hand} position={[0,-.16,0]}><RoundedBox args={[.13,.15,.08]} radius={.035}><meshStandardMaterial color="#f1eddd"/></RoundedBox>{[-.04,0,.04].map(x=><mesh key={x} position={[x,-.09,0]}><capsuleGeometry args={[.019,.035,3,8]}/><meshStandardMaterial color="#f1eddd"/></mesh>)}<mesh position={[-.06,.015,.015]}><sphereGeometry args={[.038,10,10]}/><meshStandardMaterial color="#f1eddd"/></mesh></group>
   </group></group>
  </group></group>
  {/* Single navigation light and low bumper replace the former character face. */}
  <RoundedBox args={[.7,.1,.1]} radius={.04} position={[0,.04,.43]}><meshStandardMaterial color="#d8ddbf"/></RoundedBox>
  <group ref={headlight} position={[0,.1,.46]}><group rotation={[Math.PI/2,0,0]}><mesh><cylinderGeometry args={[.12,.12,.07,24]}/><meshStandardMaterial color="#344638" roughness={.5}/></mesh><mesh position={[0,.043,0]}><cylinderGeometry args={[.088,.088,.025,24]}/><meshStandardMaterial color="#fff3cd" emissive="#fff1bc" emissiveIntensity={1.5} toneMapped={false}/></mesh></group></group>
 </group>
}
