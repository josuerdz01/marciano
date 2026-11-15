import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceRequest} from '../src/data/sourceRequest.js';
import {contextWindow,recoverRegionalMap,loadContextMap} from '../src/data/contextMap.js';
test('transient CTX transport and 503 failures retry once; 404 remains missing coverage',async()=>{
 const signal=new AbortController().signal;let calls=0;
 const r=await sourceRequest('tile',signal,{fetcher:async()=>{if(!calls++)throw new TypeError('Failed to fetch');return new Response('image')}});assert.equal(await r.text(),'image');assert.equal(calls,2);
 calls=0;await sourceRequest('tile',signal,{fetcher:async()=>new Response('',{status:++calls===1?503:200})});assert.equal(calls,2);
 calls=0;assert.equal((await sourceRequest('tile',signal,{fetcher:async()=>{calls++;return new Response('',{status:404})}})).status,404);assert.equal(calls,1);
});
test('cancellation cannot load a fallback or replace a newer selected site',async()=>{
 const c=new AbortController();let fallback=false;
 await assert.rejects(recoverRegionalMap({},c.signal,async()=>{c.abort();throw new TypeError('Failed to fetch')},async()=>{fallback=true}),{name:'AbortError'});assert.equal(fallback,false);
});
test('failed CTX uses real context imagery with its attribution, bounds and coverage',async()=>{
 const site={lon:179.99,lat:24},signal=new AbortController().signal,calls=[];
 const map=await recoverRegionalMap(site,signal,async()=>{throw new TypeError('Failed to fetch')},(s,sig)=>loadContextMap(s,sig,async(window,layer,_,options)=>{calls.push(layer.id);assert.equal(options.coverage,true);return{layer,texture:{},map:window,isCovered:x=>x<0}}));
 assert.deepEqual(calls,['mola-color']);assert.equal(map.basemapFallback,true);assert.equal(map.layer.id,'mola-color');assert.equal(map.isCovered(1),false);assert.equal(map.site,site);assert.ok(map.qualityWarning.includes('CTX no disponible'));assert.ok(Number.isFinite(map.height));
 assert.throws(()=>contextWindow({lon:0,lat:90}),/polar/);
});

import {scopedRoutes} from '../src/routing/routeContext.js';
test('switching regions hides all route metrics before effects reset the old solver state',()=>{
 const map={},dem={},grid={},routes=[{id:'gentle',distance:12}],context={map,dem,grid};
 assert.equal(scopedRoutes(routes,context,map,dem,grid),routes);
 assert.deepEqual(scopedRoutes(routes,context,map,null,null),[]);
 assert.deepEqual(scopedRoutes(routes,context,{},dem,grid),[]);
 assert.deepEqual(scopedRoutes(routes,context,map,{},{}),[]);
});
