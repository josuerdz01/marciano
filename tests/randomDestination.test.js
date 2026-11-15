import test from 'node:test';
import assert from 'node:assert/strict';
import {randomDestination} from '../src/routing/randomDestination.js';
import {cellIndex,cellCoordinates,metricDistance} from '../src/routing/geometry.js';
import {findRoute} from '../src/routing/astar.js';
function grid(){return{width:21,height:21,west:0,north:.021,stepLon:.001,stepLat:.001,radius:3396190,values:new Float32Array(441),mask:new Uint8Array(441).fill(1),slopes:new Float32Array(441)}}
test('random destination differs from rover and remains connected on valid measured terrain',()=>{const g=grid(),a=10*21+10,p=cellCoordinates(g,a),b=randomDestination(g,p,()=>.3);assert.ok(b);assert.notEqual(cellIndex(g,b),a);assert.ok(findRoute(g,a,cellIndex(g,b),{maxSlope:30}).distance>0)});
test('random sampling cannot cross excluded gaps, steep walls or diagonal corners',()=>{const g=grid(),a=10*21+8;for(let row=0;row<21;row++)g.mask[row*21+10]=0;for(const random of [()=>0,()=>.8]){const b=randomDestination(g,cellCoordinates(g,a),random);assert.ok(cellIndex(g,b)%21<10);assert.ok(findRoute(g,a,cellIndex(g,b),{maxSlope:30}).path.every(i=>g.mask[i]))}g.slopes.fill(35);assert.equal(randomDestination(g,cellCoordinates(g,a)),null)});
test('isolated or unknown rover position produces no fabricated trip',()=>{const g=grid(),a=220;g.mask.fill(0);g.mask[a]=1;assert.equal(randomDestination(g,cellCoordinates(g,a)),null);g.mask[a]=0;assert.equal(randomDestination(g,cellCoordinates(g,a)),null)});

test('initial destination produces an approximately two kilometre route when coverage allows',()=>{const n=81,g={width:n,height:n,west:0,north:.2754,stepLon:.0034,stepLat:.0034,radius:3396190,values:new Float32Array(n*n),mask:new Uint8Array(n*n).fill(1),slopes:new Float32Array(n*n)},a=40*n+40,p=cellCoordinates(g,a),b=randomDestination(g,p,()=>.37),distance=metricDistance(p,b,g.radius),route=findRoute(g,a,cellIndex(g,b),{maxSlope:30});assert.ok(distance>=1800&&distance<=2000);assert.ok(route.distance>=1800&&route.distance<2200)});
