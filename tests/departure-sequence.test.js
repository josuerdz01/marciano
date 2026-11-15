import test from 'node:test';import assert from 'node:assert/strict';
import {stepDeparture,mayDrive,ladderDeployment} from '../src/rover/boarding.js';
test('camera completion gates greeting, greeting gates boarding, stowed ladder gates driving',()=>{
 let state,progress=1;const phases=[];
 function step(focused){state=stepDeparture(state,true,progress,focused,.05);progress=state.progress;if(phases.at(-1)!==state.phase)phases.push(state.phase)}
 for(let i=0;i<100;i++)step(false);
 assert.equal(state.phase,'focus');assert.equal(progress,1);assert.equal(state.greeting,null);
 step(true);assert.equal(state.phase,'greeting');
 for(let i=0;i<20;i++)step(true);assert.equal(progress,1);assert.equal(mayDrive(progress),false);
 for(let i=0;i<160;i++){step(true);if(mayDrive(progress))assert.equal(ladderDeployment(progress),0)}
 assert.deepEqual(phases,['focus','greeting','boarding','ready']);assert.equal(progress,0);
});
test('pause cancels departure and resuming waits for focus again',()=>{
 const paused=stepDeparture({phase:'greeting',greeting:.5},false,1,false,.05);
 assert.equal(paused.phase,'idle');assert.equal(stepDeparture(paused,true,1,false,.05).phase,'focus');
});
