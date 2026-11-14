import test from 'node:test';
import assert from 'node:assert/strict';
import {localCoordinates} from '../src/data/localMap.js';
const map={west:40,north:-30,span:2,height:30};
test('local image corners preserve east and south directions',()=>{assert.deepEqual(localCoordinates(map,-12,-15),{lon:40,lat:-30});assert.deepEqual(localCoordinates(map,12,15),{lon:42,lat:-32});});
test('rover at image center receives center coordinates',()=>{assert.deepEqual(localCoordinates(map,0,0),{lon:41,lat:-31});});
test('window crossing the antimeridian keeps longitude in -180..180',()=>{assert.deepEqual(localCoordinates({...map,west:179},12,0),{lon:-179,lat:-31});});
