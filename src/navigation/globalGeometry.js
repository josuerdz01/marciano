import * as THREE from 'three';
import {explorerBounds,mapPoint} from './explorer.js';
export function globalGeometry(map){const b=explorerBounds(map),zero=mapPoint(map,{lon:0,lat:0})[0],positions=[],uv=[];
 for(const copy of [-1,0,1]){const left=zero+copy*b.width-b.width/2,right=left+b.width,top=b.z-b.height/2,bottom=top+b.height,X=[left,...[-12,12].filter(x=>x>left&&x<right),right],Z=[top,...[-map.height/2,map.height/2].filter(z=>z>top&&z<bottom),bottom];
 for(let i=1;i<X.length;i++)for(let j=1;j<Z.length;j++){const x0=X[i-1],x1=X[i],z0=Z[j-1],z1=Z[j];if((x0+x1)/2> -12&&(x0+x1)/2<12&&(z0+z1)/2> -map.height/2&&(z0+z1)/2<map.height/2)continue;for(const[x,z]of[[x0,z0],[x0,z1],[x1,z0],[x1,z0],[x0,z1],[x1,z1]]){positions.push(x,-.35,z);uv.push((x-left)/b.width,1-(z-top)/b.height)}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;
}
