// Cache only public, complete source responses. DEM byte ranges (206) bypass it.
export function createSourceCache({fetcher=(...args)=>fetch(...args),storage=globalThis.caches,now=()=>Date.now(),limit=80}={}){
 const memory=new Map(),epochs=new Map(),name='marciano-public-sources-v1';
 async function remove(url){epochs.set(url,(epochs.get(url)||0)+1);memory.delete(url);try{await(await storage?.open(name))?.delete(url)}catch{}}
 async function request(url,options={}){const{ttl=86400000,...init}=options;init.signal?.throwIfAborted();const hit=memory.get(url);if(hit&&now()-hit.at<ttl)return new Response(hit.bytes.slice(0),{headers:hit.headers});
 try{const cache=await storage?.open(name),stored=await cache?.match(url);if(stored&&now()-Number(stored.headers.get('x-marciano-cached-at'))<ttl){init.signal?.throwIfAborted();return stored}}catch(error){init.signal?.throwIfAborted()}
 const epoch=epochs.get(url)||0,response=await fetcher(url,init);if(response.status!==200)return response;
 // Saving happens independently of rendering; quota failures never block data.
 response.clone().arrayBuffer().then(async bytes=>{if((epochs.get(url)||0)!==epoch)return;const at=now(),headers=new Headers(response.headers);headers.delete('content-encoding');headers.delete('content-length');headers.set('x-marciano-cached-at',String(at));memory.delete(url);memory.set(url,{bytes,headers,at});while(memory.size>limit)memory.delete(memory.keys().next().value);try{const cache=await storage?.open(name);if(!cache)return;await cache.put(url,new Response(bytes.slice(0),{headers}));if((epochs.get(url)||0)!==epoch){await cache.delete(url);return}const keys=await cache.keys();for(const key of keys.slice(0,Math.max(0,keys.length-limit)))await cache.delete(key)}catch{}}).catch(()=>{});
 return response;
 }
 const pending=new Map();
 function sharedRequest(url,options={}){
  const headers=new Headers(options.headers);
  // Byte ranges and non-GET requests must retain their own transport semantics.
  if((options.method||'GET').toUpperCase()!=='GET'||headers.has('range')){const {ttl,...init}=options;init.signal?.throwIfAborted();return fetcher(url,init)}
  const signal=options.signal;
  if(signal?.aborted)return Promise.reject(signal.reason);
  const key=JSON.stringify([String(url),[...headers],options.ttl,options.credentials,options.cache]);
  let entry=pending.get(key);
  if(!entry){
   const controller=new AbortController();
   entry={controller,users:0};
   entry.promise=request(url,{...options,signal:controller.signal}).finally(()=>{if(pending.get(key)===entry)pending.delete(key)});
   pending.set(key,entry);
  }
  entry.users++;
  return new Promise((resolve,reject)=>{
   let finished=false;
   const finish=(callback,value)=>{if(finished)return;finished=true;signal?.removeEventListener('abort',abort);entry.users--;callback(value)};
   const abort=()=>{finish(reject,signal.reason);if(!entry.users){pending.delete(key);entry.controller.abort()}};
   signal?.addEventListener('abort',abort,{once:true});
   entry.promise.then(response=>{if(!finished)finish(resolve,response.clone())},error=>finish(reject,error));
  });
 }
 return{request:sharedRequest,remove};
}
const sourceCache=createSourceCache();export const sourceFetch=sourceCache.request;export const removeCachedSource=sourceCache.remove;
