import {CanvasTexture,SRGBColorSpace} from 'three';
import {ctxLayer} from '../data/localMap';
let cached;
export async function loadMatchedOrtho(map,signal){
 if(map.west<77.3||map.west+map.span>78.05||map.north>18.8||map.north-map.span<18.05)return null;
 if(!cached)cached=(async()=>{const a=await fetch('/data/jezero-ortho.json');if(!a.ok)throw new Error('Ortoimagen no disponible');const meta=await a.json(),b=await fetch('/data/jezero-ortho.png');if(!b.ok)throw new Error('Ortoimagen no disponible');const bytes=await b.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==meta.sha256)throw new Error('Ortoimagen sin integridad verificada');const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));try{const image=new Image();image.src=url;await image.decode();return{meta,image}}finally{URL.revokeObjectURL(url)}})().catch(e=>{cached=null;throw e});
 const{meta,image}=await cached;signal.throwIfAborted();const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;const x=(map.west-meta.west)/meta.spanLon*meta.width,y=(meta.north-map.north)/meta.spanLat*meta.height,w=map.span/meta.spanLon*meta.width,h=map.span/meta.spanLat*meta.height;canvas.getContext('2d').drawImage(image,x,y,w,h,0,0,2048,2048);const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
 return{map,texture,matched:true,metersPerPixel:Math.max(meta.displayMetersPerPixel,map.span*Math.PI/180*3396190/2048),layer:{...ctxLayer,name:meta.name,credit:'USGS · NASA/JPL · MRO/CTX · Calef, 2021 · ortoimagen compatible con DEM',metadata:meta.catalog}};
}
