import {FAMILIES,heightCmap,radCmap} from './model.js';
const linear=v=>{v=Math.max(0,Math.min(255,v))/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};
const familyColors=FAMILIES.map(f=>[1,3,5].map(i=>parseInt(f.color.slice(i,i+2),16)));
// The original regional mesh uses a local elevation range. Only its colour
// stretches: geometry, slope limits and the rover retain the same metre scale.
export function nasaTerrainColors(model,data,layer){
 const fields=data?.fields3D;if(!model||!fields)return null;const colors=new Float32Array(model.elevations.length*3),span=Math.max(1,model.max-model.min);
 for(let v=0;v<model.elevations.length;v++){const x=model.positions[v*3],z=model.positions[v*3+2],geo=model.geo(x,z),c=Math.max(0,Math.min(data.width-1,Math.round((geo.lon-data.west)/data.stepLon-.5))),r=Math.max(0,Math.min(data.height-1,Math.round((data.north-geo.lat)/data.stepLat-.5))),i=r*data.width+c,gray=(.18+.78*fields.hs[i])*255;let rgb;
  if(layer==='height')rgb=heightCmap(Math.max(0,Math.min(1,(model.elevations[v]-model.min)/span)));
  else if(layer==='radiation'){const rad=radCmap((fields.rad[i]-.4)/4.2);rgb=rad.map(c=>gray*.3+c*.7)}
  else if(layer==='geology')rgb=familyColors[fields.unit[i]].map(c=>gray*.4+c*.6);
  else if(layer==='slope'){const t=Math.min(1,fields.slope[i]/30);rgb=[68+185*t,85+145*t,140*(1-t)]}
  else rgb=[gray,gray,gray];
  for(let k=0;k<3;k++)colors[v*3+k]=linear(rgb[k]);
 }return colors;
}
export function nasaFocusRings(map,data,model){if(!model||!data?.hotspots)return[];return data.hotspots.map(h=>{const cx=(h.u-.5)*24,cz=(h.v-.5)*map.height,rx=h.r*24,rz=h.r*map.height,points=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,x=cx+Math.cos(a)*rx,z=cz+Math.sin(a)*rz,y=model.heightAt(x,z);if(y==null)return null;points.push([x,y+.025,z])}return{points,center:[cx,model.heightAt(cx,cz),cz],rx,rz}}).filter(Boolean)}
