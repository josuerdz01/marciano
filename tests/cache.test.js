import test from 'node:test';import assert from 'node:assert/strict';import {createSourceCache} from '../src/data/sourceCache.js';
function fixture(fetcher){const values=new Map();let time=100,resolve;const saved=new Promise(r=>resolve=r),storage={open:async()=>({match:async k=>values.get(k)?.clone(),put:async(k,r)=>{values.set(k,r);resolve()},keys:async()=>[...values.keys()],delete:async k=>values.delete(k)})};return{storage,saved,values,cache:createSourceCache({fetcher,storage,now:()=>time}),advance:()=>{time+=2000}}}
test('verified complete responses are reused and expiry fetches fresh data',async()=>{let calls=0;const f=fixture(async()=>{calls++;return new Response('source '+calls)});assert.equal(await(await f.cache.request('https://data.test/tile',{ttl:1000})).text(),'source 1');await f.saved;assert.equal(await(await f.cache.request('https://data.test/tile',{ttl:1000})).text(),'source 1');assert.equal(calls,1);f.advance();assert.equal(await(await f.cache.request('https://data.test/tile',{ttl:1000})).text(),'source 2')});
test('partial DEM ranges and failed source responses never enter the public cache',async()=>{for(const status of[206,404,500]){let calls=0;const f=fixture(async()=>{calls++;return new Response('bytes',{status})});await f.cache.request('https://data.test/a');await f.cache.request('https://data.test/a');assert.equal(calls,2);assert.equal(f.values.size,0)}});
test('aborted requests cannot use cached data; invalid source entries can be evicted',async()=>{let calls=0;const f=fixture(async()=>{calls++;return new Response('tile')});await f.cache.request('https://data.test/a');await f.saved;await assert.rejects(f.cache.request('https://data.test/a',{signal:AbortSignal.abort()}));await f.cache.remove('https://data.test/a');await f.cache.request('https://data.test/a');assert.equal(calls,2)});

test('simultaneous consumers share transport and one cancellation does not cancel the other',async()=>{
 let calls=0,release;const gate=new Promise(r=>release=r);
 const cache=createSourceCache({storage:null,fetcher:async()=>{calls++;await gate;return new Response('shared')}});
 const abort=new AbortController();const first=cache.request('https://data.test/shared',{signal:abort.signal});
 const second=cache.request('https://data.test/shared');abort.abort();await assert.rejects(first);release();
 assert.equal(await(await second).text(),'shared');assert.equal(calls,1);
});
test('failed shared requests can be retried and ranges remain independent',async()=>{
 let calls=0;const cache=createSourceCache({storage:null,fetcher:async()=>{calls++;throw Error('offline')}});
 await assert.rejects(cache.request('https://data.test/a'));await assert.rejects(cache.request('https://data.test/a'));assert.equal(calls,2);
 let ranges=0;const ranged=createSourceCache({storage:null,fetcher:async()=>{ranges++;return new Response('part',{status:206})}});
 await Promise.all([ranged.request('https://data.test/dem',{headers:{range:'bytes=0-9'}}),ranged.request('https://data.test/dem',{headers:{range:'bytes=0-9'}})]);assert.equal(ranges,2);
});

test('a cached full response cannot satisfy a byte-range request',async()=>{
 let calls=0;const f=fixture(async(_url,options)=>{calls++;return options.headers?new Response('range',{status:206}):new Response('full')});
 await f.cache.request('https://data.test/dem');await f.saved;
 const response=await f.cache.request('https://data.test/dem',{headers:{Range:'bytes=0-2'}});
 assert.equal(response.status,206);assert.equal(await response.text(),'range');assert.equal(calls,2);
});
