import test from 'node:test';
import assert from 'node:assert/strict';
import {installMapOnlyZoom} from '../src/ui/mapOnlyZoom.js';

test('browser zoom is blocked while canvas wheel propagation and panel scrolling remain available',()=>{
 const listeners=new Map();
 const target={addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
 const dispose=installMapOnlyZoom(target);
 const event=(props={})=>({prevented:false,stopped:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true},...props});
 let e=event({ctrlKey:true,target:{tagName:'CANVAS'}});listeners.get('wheel')(e);
 assert.equal(e.prevented,true);assert.equal(e.stopped,false);
 e=event({ctrlKey:true,target:{tagName:'INPUT'}});listeners.get('wheel')(e);
 assert.equal(e.prevented,true);assert.equal(e.stopped,true);
 e=event({target:{tagName:'DIV'}});listeners.get('wheel')(e);
 assert.equal(e.prevented,false);assert.equal(e.stopped,false);
 for(const key of ['+','=','-','0']){e=event({metaKey:true,key});listeners.get('keydown')(e);assert.equal(e.prevented,true)}
 e=event({ctrlKey:true,key:'f'});listeners.get('keydown')(e);assert.equal(e.prevented,false);
 dispose();assert.equal(listeners.size,0);
});
