import {sourceFetch} from './sourceCache.js';
// Retry transient transport failures once, with a fresh per-attempt deadline.
export async function sourceRequest(url,signal,{fetcher=sourceFetch,timeout=8000,retries=1}={}){
 let last;
 for(let attempt=0;attempt<=retries;attempt++){
  signal.throwIfAborted();
  try{const r=await fetcher(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(timeout)])});if(r.status>=500||r.status===429){const e=new Error('El servicio de imágenes no respondió.');e.retryable=true;throw e}return r}
  catch(error){signal.throwIfAborted();last=error;if(!(error instanceof TypeError||error.name==='TimeoutError'||error.retryable))throw error;}
 }
 last.levelFailed=true;throw last;
}
export function regionLoadMessage(){return 'No se pudo cargar la cartografía de esta zona. Puedes reintentar o conservar la región anterior.'}
