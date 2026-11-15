import test from 'node:test';
import assert from 'node:assert/strict';
import {stepBoarding,mayDrive,pilotPhase} from '../src/rover/boarding.js';
test('a route cannot advance until pilot boarding and canopy closure finish',()=>{let p=1;for(let i=0;i<50;i++){p=stepBoarding(p,true,.05);assert.equal(mayDrive(p),false);assert.equal(pilotPhase(p,true),'boarding')}for(let i=0;i<12;i++)p=stepBoarding(p,true,.05);assert.equal(p,0);assert.equal(mayDrive(p),true);assert.equal(pilotPhase(p,true),'seated')});
test('pause exits, quick resume reverses smoothly, reduced motion seats immediately',()=>{let p=stepBoarding(0,false,1);assert.ok(p>0&&p<1);assert.equal(pilotPhase(p,false),'exiting');const q=stepBoarding(p,true,.1);assert.ok(q<p&&q>0);assert.equal(mayDrive(q),false);assert.equal(stepBoarding(q,true,.1,true),0);assert.equal(stepBoarding(0,false,4),1);assert.equal(pilotPhase(1,false),'outside')});
