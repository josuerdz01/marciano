import test from 'node:test';
import assert from 'node:assert/strict';
import {suitResources} from '../src/astronaut/status.js';
test('oxygen represents a bounded resource budget and warns at reserve',()=>{
 assert.deepEqual(suitResources(0),{remaining:480,oxygen:100,reserve:false,empty:false});
 assert.equal(suitResources(240).oxygen,50);assert.equal(suitResources(384).reserve,true);
 assert.deepEqual(suitResources(600),{remaining:0,oxygen:0,reserve:true,empty:true});
 assert.equal(suitResources(-10).oxygen,100);assert.equal(suitResources(240,600).remaining,360);
});
