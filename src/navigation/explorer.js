export const wrapLongitude=lon=>((lon+180)%360+360)%360-180;
export function mapPoint(map,{lon,lat}){return[wrapLongitude(lon-(map.west+map.span/2))/map.span*24,(map.north-lat)/map.span*map.height-map.height/2]}
export function pointLocation(map,x,z){return{lon:wrapLongitude(map.west+(x/24+.5)*map.span),lat:Math.max(-89.999,Math.min(89.999,map.north-(z/map.height+.5)*map.span))}}
export function explorerBounds(map){return{width:360/map.span*24,height:180/map.span*map.height,z:(map.north-90)/map.span*map.height-map.height/2+90/map.span*map.height}}
export function visiblePlaces(candidates,camera,width,height,project){const bins=[],result=[];for(const p of candidates){const q=project(p);if(q.z< -1||q.z>1||Math.abs(q.x)>1||Math.abs(q.y)>1)continue;const x=(q.x+1)*width/2,y=(q.y+1)*height/2;if(bins.some(([X,Y])=>Math.abs(X-x)<120&&Math.abs(Y-y)<36))continue;bins.push([x,y]);result.push(p);if(result.length>=70)break}return result}
