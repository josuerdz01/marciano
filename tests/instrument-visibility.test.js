import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldShowInstruments} from '../src/rover/instrumentVisibility.js';
const close={enabled:true,alpha:1,distance:3.8,bounds:{left:400,right:550,top:250,bottom:410},width:1080,height:759,focusing:false};
test('instruments wait for the completed rover close-up',()=>{assert.equal(shouldShowInstruments(close),true);assert.equal(shouldShowInstruments({...close,focusing:true}),false);assert.equal(shouldShowInstruments({...close,distance:15}),false);assert.equal(shouldShowInstruments({...close,distance:26000}),false);assert.equal(shouldShowInstruments({...close,enabled:false}),false);assert.equal(shouldShowInstruments({...close,alpha:.5}),false)});
test('instruments hide when the rover leaves the viewport or is too small',()=>{assert.equal(shouldShowInstruments({...close,bounds:null}),false);assert.equal(shouldShowInstruments({...close,bounds:{left:-200,right:-50,top:250,bottom:400}}),false);assert.equal(shouldShowInstruments({...close,bounds:{left:0,right:20,top:0,bottom:20}}),false)});
test('zoom hysteresis avoids instrument flickering at the close-up boundary',()=>{assert.equal(shouldShowInstruments({...close,distance:5.5}),false);assert.equal(shouldShowInstruments({...close,distance:5.5,shown:true}),true);assert.equal(shouldShowInstruments({...close,distance:6.1,shown:true}),false)});
