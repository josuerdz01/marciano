export const radians=d=>d*Math.PI/180;
export function cellIndex(dem,point){const c=Math.floor((point.lon-dem.west)/dem.stepLon),r=Math.floor((dem.north-point.lat)/dem.stepLat);return c<0||r<0||c>=dem.width||r>=dem.height?-1:r*dem.width+c;}
export function cellCoordinates(dem,index){return{lon:dem.west+(index%dem.width+.5)*dem.stepLon,lat:dem.north-(Math.floor(index/dem.width)+.5)*dem.stepLat};}
export function worldCoordinates(map,geo){return[(geo.lon-map.west)/map.span*24-12,(map.north-geo.lat)/map.span*map.height-map.height/2];}
export function metricDistance(a,b,radius=3396190){const lat1=radians(a.lat),lat2=radians(b.lat),dlat=lat2-lat1,dlon=radians(b.lon-a.lon);return 2*radius*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2)));}
export function makeRouteGrid(dem,map){
 const values=dem.values,mask=new Uint8Array(values.length),slopes=new Float32Array(values.length);slopes.fill(Infinity);
 for(let r=1;r<dem.height-1;r++)for(let c=1;c<dem.width-1;c++){const i=r*dem.width+c,z=values[i];if(!Number.isFinite(z))continue;const geo=cellCoordinates(dem,i),[x,y]=worldCoordinates(map,geo);if(x<=-11.8||x>=11.8||y<=-map.height/2+.2||y>=map.height/2-.2||!map.isCovered(x,y))continue;
 const halfX=dem.stepLon/map.span*12,halfY=dem.stepLat/map.span*map.height/2;if([[-halfX,-halfY],[halfX,-halfY],[-halfX,halfY],[halfX,halfY]].some(([ox,oy])=>!map.isCovered(x+ox,y+oy)))continue;
 const neighbors=[values[i-1],values[i+1],values[i-dem.width],values[i+dem.width]];if(neighbors.some(z=>!Number.isFinite(z)))continue;
 const dx=radians(dem.stepLon)*dem.radius*Math.cos(radians(geo.lat)),dy=radians(dem.stepLat)*dem.radius;const gx=(neighbors[1]-neighbors[0])/(2*dx),gy=(neighbors[3]-neighbors[2])/(2*dy);slopes[i]=Math.atan(Math.hypot(gx,gy))*180/Math.PI;mask[i]=1;
 }
 return {...dem,mask,slopes};
}
