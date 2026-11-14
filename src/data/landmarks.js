// Gazetteer of Planetary Nomenclature, IAU / USGS. MDIM 2.1 control network;
// planetocentric latitude and east-positive longitude, normalized to -180..180.
export const landmarks=[
 {id:'olympus',name:'Olympus Mons',category:'Volcán',lat:18.65,lon:-133.8,featureId:4453},
 {id:'valles',name:'Valles Marineris',category:'Sistema de cañones',lat:-14.01,lon:-58.59,featureId:6288},
 {id:'jezero',name:'Jezero',category:'Cráter',lat:18.41,lon:77.69,featureId:14300},
 {id:'gale',name:'Gale',category:'Cráter',lat:-5.37,lon:137.81,featureId:2071},
 {id:'hellas',name:'Hellas Planitia',category:'Planicie',lat:-42.43,lon:70.5,featureId:2432},
].map(p=>({...p,source:`https://planetarynames.wr.usgs.gov/Feature/${p.featureId}`,network:'MDIM 2.1',positionType:'Centro cartográfico'}));
export function globePoint({lat,lon},radius=2){const a=lat*Math.PI/180,b=lon*Math.PI/180;return[radius*Math.cos(a)*Math.cos(b),radius*Math.sin(a),-radius*Math.cos(a)*Math.sin(b)];}
