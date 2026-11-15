import test from 'node:test';
import assert from 'node:assert/strict';
import {stepBoarding,mayDrive,pilotPhase} from '../src/rover/boarding.js';
test('a route cannot advance until pilot boarding and canopy closure finish',()=>{let p=1;for(let i=0;i<70;i++){p=stepBoarding(p,true,.05);assert.equal(mayDrive(p),false);assert.equal(pilotPhase(p,true),'boarding')}for(let i=0;i<22;i++)p=stepBoarding(p,true,.05);assert.equal(p,0);assert.equal(mayDrive(p),true);assert.equal(pilotPhase(p,true),'seated')});
test('pause exits, quick resume reverses smoothly, reduced motion seats immediately',()=>{let p=stepBoarding(0,false,1);assert.ok(p>0&&p<1);assert.equal(pilotPhase(p,false),'exiting');const q=stepBoarding(p,true,.1);assert.ok(q<p&&q>0);assert.equal(mayDrive(q),false);assert.equal(stepBoarding(q,true,.1,true),0);assert.equal(stepBoarding(0,false,5),1);assert.equal(pilotPhase(1,false),'outside')});

import {pilotPath,waveEnvelope} from '../src/rover/pilotMotion.js';
test('ladder path has exact seat and ground endpoints, continuous steps and a smooth wave',()=>{
 const outside={x:1.35,y:-.51,z:.02},start=pilotPath(0,outside),end=pilotPath(1,outside);
 assert.equal(start.x,0);assert.equal(start.y,0);assert.equal(end.x,outside.x);assert.equal(end.y,outside.y);assert.equal(end.z,outside.z);
 let previous=start;for(let i=1;i<=1000;i++){const next=pilotPath(i/1000,outside);assert.ok(Math.hypot(next.x-previous.x,next.y-previous.y,next.z-previous.z)<.02);previous=next;assert.ok(waveEnvelope(i/100)>=0&&waveEnvelope(i/100)<=1)}
 for(const t of [0,.8,3.5,4.5,8])assert.ok(Math.abs(waveEnvelope(t+.0001)-waveEnvelope(t-.0001))<.001);
});
