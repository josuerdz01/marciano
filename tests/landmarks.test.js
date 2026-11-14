import test from 'node:test';
import assert from 'node:assert/strict';
import {Mesh,SphereGeometry,Raycaster,Vector3} from 'three';
import {landmarks,globePoint} from '../src/data/landmarks.js';
test('official points have normalized coordinates and individual gazetteer sources',()=>{assert.equal(new Set(landmarks.map(p=>p.id)).size,landmarks.length);for(const p of landmarks){assert.ok(p.lat>=-90&&p.lat<=90);assert.ok(p.lon>=-180&&p.lon<=180);assert.equal(p.source,`https://planetarynames.wr.usgs.gov/Feature/${p.featureId}`);assert.equal(p.network,'MDIM 2.1');assert.ok(Math.abs(new Vector3(...globePoint(p,2)).length()-2)<1e-10)}});
test('marker positions agree with the actual sphere UV coordinates',()=>{const mesh=new Mesh(new SphereGeometry(2,256,128));mesh.updateMatrixWorld();for(const p of landmarks){const normal=new Vector3(...globePoint(p,1));const hit=new Raycaster(normal.clone().multiplyScalar(5),normal.clone().negate()).intersectObject(mesh)[0];assert.ok(hit);const lon=hit.uv.x*360-180,lat=hit.uv.y*180-90;assert.ok(Math.abs(lon-p.lon)<.03,p.name+' longitude');assert.ok(Math.abs(lat-p.lat)<.03,p.name+' latitude')}mesh.geometry.dispose();mesh.material.dispose()});
