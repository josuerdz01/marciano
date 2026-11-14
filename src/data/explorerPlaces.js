import catalog from './gazetteer.json' with {type:'json'};
import {metricDistance} from '../routing/geometry.js';
export const knownPlaces=catalog.map(p=>({...p,id:'iau-'+p.featureId,source:`https://planetarynames.wr.usgs.gov/Feature/${p.featureId}`,network:'MDIM 2.1',positionType:'Centro cartográfico'}));
export function localPlacePosition(map,place){const delta=((place.lon-map.west)%360+360)%360;return [delta/map.span*24-12,(map.north-place.lat)/map.span*map.height-map.height/2]}
export function explorerPlaces(map,origin=map.site){const places=knownPlaces.map(place=>{const[x,z]=localPlacePosition(map,place);return {...place,x,z,distance:metricDistance(origin,place),inWindow:Math.abs(x)<=12&&Math.abs(z)<=map.height/2}});return{inside:places.filter(p=>p.inWindow),nearby:places.filter(p=>!p.inWindow).sort((a,b)=>a.distance-b.distance).slice(0,3)}}
export function bearing(a,b){const rad=Math.PI/180,dl=(b.lon-a.lon)*rad,la=a.lat*rad,lb=b.lat*rad;return (Math.atan2(Math.sin(dl)*Math.cos(lb),Math.cos(la)*Math.sin(lb)-Math.sin(la)*Math.cos(lb)*Math.cos(dl))/rad+360)%360;}
