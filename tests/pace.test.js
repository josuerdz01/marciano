import test from 'node:test';
import assert from 'node:assert/strict';
import {paceChange} from '../src/routing/pace.js';
const settings={speed:2,budget:240,reserve:25,stopMinutes:20,objective:'Relieve'},route={distance:2000,returnDistance:2000,path:[1,2,3]};
test('speed changes retain route identity and already travelled time',()=>{const original=structuredClone(route),r=paceChange(route,{...settings,speed:3},{meters:500,minutes:18},0);assert.equal(r.settings.speed,3);assert.equal(r.feasible,true);assert.equal(r.changes,'');assert.deepEqual(route,original)});
test('slowing down extends budget without overriding speed, reserve or science',()=>{const r=paceChange(route,{...settings,speed:.5},{meters:500,minutes:30},0);assert.equal(r.settings.speed,.5);assert.equal(r.settings.budget,630);assert.equal(r.settings.reserve,25);assert.equal(r.settings.stopMinutes,20);assert.equal(r.feasible,true)});
test('unsupported timing pauses explicitly rather than silently replacing speed',()=>{const r=paceChange({...route,distance:10000},{...settings,speed:.5},{meters:0,minutes:0},0);assert.equal(r.feasible,false);assert.equal(r.settings.speed,.5);assert.equal(r.settings.budget,240)});
test('editing pace after arrival never asks solver to route within the same cell',()=>{const r=paceChange(route,{...settings,speed:2.1},{meters:2000,minutes:60},0);assert.equal(r.feasible,true);assert.deepEqual(route.path,[1,2,3])});
test('replanned path only subtracts distance since its own start',()=>{const r=paceChange(route,{...settings,speed:.5},{meters:1500,minutes:70},1000);assert.equal(r.settings.budget,680);assert.equal(r.feasible,true)});
