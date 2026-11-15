import test from 'node:test';import assert from 'node:assert/strict';
import {journeyCameraDistance,journeyCameraElevation} from '../src/rover/followCamera.js';
test('journey camera eases from current distance to a close view without zooming out',()=>{
 assert.equal(journeyCameraDistance(16,0),16);assert.equal(journeyCameraDistance(16,2.2),5.5);
 let last=16;for(let t=0;t<=3;t+=.01){const d=journeyCameraDistance(16,t);assert.ok(d<=last+1e-10&&d>=5.5);last=d}
 assert.equal(journeyCameraDistance(3,1),3);assert.ok(Math.abs(journeyCameraDistance(16,.001)-16)<.00001);
});

test('driving view smoothly settles at the reference elevation',()=>{assert.equal(journeyCameraElevation(Math.PI/2,0),Math.PI/2);assert.ok(Math.abs(journeyCameraElevation(Math.PI/2,2.2)-24*Math.PI/180)<1e-10);assert.ok(journeyCameraElevation(.2,1)>.2)});
