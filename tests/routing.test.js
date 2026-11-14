import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {findRoute} from '../src/routing/astar.js';
import {cellCoordinates,cellIndex,makeRouteGrid} from '../src/routing/geometry.js';
function flat(w,h){return{width:w,height:h,west:0,north:0,stepLon:.00337412,stepLat:.00337412,radius:3396190,values:new Float32Array(w*h),mask:new Uint8Array(w*h).fill(1),slopes:new Float32Array(w*h)}}
test('flat terrain finds a diagonal route with correct endpoints',()=>{const g=flat(5,5),r=findRoute(g,0,24,{weight:0});assert.equal(r.path[0],0);assert.equal(r.path.at(-1),24);assert.equal(r.path.length,5);assert.ok(r.distance>1100&&r.distance<1140);assert.equal(r.ascent,0)});
test('blocked corners cannot be cut diagonally',()=>{const g=flat(2,2);g.mask[1]=0;g.mask[2]=0;assert.throws(()=>findRoute(g,0,3),/No hay una ruta/)});
test('grid edges do not wrap to a different row',()=>{const g=flat(3,2);g.mask.fill(0);g.mask[2]=1;g.mask[3]=1;assert.throws(()=>findRoute(g,2,3),/No hay una ruta/)});
test('a cliff edge is rejected even if cell gradient estimates are zero',()=>{const g=flat(2,1);g.values[1]=2000;assert.throws(()=>findRoute(g,0,1,{maxSlope:15}),/No hay una ruta/)});
test('NoData and out-of-bounds endpoints are rejected',()=>{const g=flat(3,3);g.values[0]=NaN;assert.throws(()=>findRoute(g,0,8),/A o B/);assert.throws(()=>findRoute(g,-1,8),/A o B/)});
test('same-cell endpoints are not presented as a journey',()=>{assert.throws(()=>findRoute(flat(3,3),4,4),/misma celda/)});
test('weighting terrain chooses a longer path around a hill',()=>{const g=flat(9,9);for(let r=2;r<=6;r++)for(let c=3;c<=5;c++){const i=r*9+c;g.values[i]=80;g.slopes[i]=20}const short=findRoute(g,4*9+1,4*9+7,{maxSlope:30,weight:0}),gentle=findRoute(g,4*9+1,4*9+7,{maxSlope:30,weight:8});assert.ok(gentle.distance>short.distance);assert.ok(gentle.ascent<short.ascent)});
test('bundled USGS DEM integrity, coordinates and real-data path',()=>{const meta=JSON.parse(readFileSync(new URL('../public/data/region-dem.json',import.meta.url))),bytes=readFileSync(new URL('../public/data/region-dem.i16',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.sha256);assert.equal(bytes.length,meta.width*meta.height*2);const values=Float32Array.from({length:meta.width*meta.height},(_,i)=>{const z=bytes.readInt16LE(i*2);return z===meta.nodata?NaN:z});const site={lon:-57.70568740014555,lat:-20.148925405400668},map={west:site.lon-.13,north:site.lat+.13,span:.26,height:24/Math.cos(site.lat*Math.PI/180),isCovered:()=>true};const grid=makeRouteGrid({...meta,values},map),a=cellIndex(grid,site),b=a+8;assert.equal(cellIndex(grid,cellCoordinates(grid,a)),a);const path=findRoute(grid,a,b);assert.ok(path.distance>1000);assert.ok(path.maxSlope<=15);assert.ok(path.path.every(i=>grid.mask[i]&&Number.isFinite(values[i])))});
