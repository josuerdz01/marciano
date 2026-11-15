import {cellIndex,cellCoordinates,metricDistance} from './geometry.js';
// Sample only a connected patch; never use a straight random lon/lat through unknown terrain.
export function randomDestination(grid,position,random=Math.random){if(!grid)return null;const start=cellIndex(grid,position),valid=i=>i>=0&&i<grid.mask.length&&grid.mask[i]&&Number.isFinite(grid.values[i])&&grid.slopes[i]<=30;if(!valid(start))return null;
 const origin=cellCoordinates(grid,start),cellMeters=grid.stepLat*Math.PI/180*grid.radius,radius=Math.max(cellMeters*3,Math.min(1500,grid.height*cellMeters*.15)),minDistance=Math.max(cellMeters*1.5,radius*.3),seen=new Uint8Array(grid.mask.length),queue=new Int32Array(Math.min(grid.mask.length,60000));let head=0,tail=1,candidate=null,count=0,farthest=null,farDistance=0;queue[0]=start;seen[start]=1;
 while(head<tail){const i=queue[head++],a=cellCoordinates(grid,i),d=metricDistance(origin,a,grid.radius);if(i!==start&&d>farDistance){farthest=a;farDistance=d}if(d>=minDistance){count++;if(random()<1/count)candidate=a}const c=i%grid.width,r=Math.floor(i/grid.width);
 for(const[dc,dr]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]){const C=c+dc,R=r+dr,j=R*grid.width+C;if(C<0||R<0||C>=grid.width||R>=grid.height||seen[j]||!valid(j))continue;if(dc&&dr&&(!valid(r*grid.width+C)||!valid(R*grid.width+c)))continue;const b=cellCoordinates(grid,j);if(metricDistance(origin,b,grid.radius)>radius||Math.atan2(Math.abs(grid.values[j]-grid.values[i]),metricDistance(a,b,grid.radius))*180/Math.PI>30)continue;seen[j]=1;if(tail<queue.length)queue[tail++]=j;}
 }
 return candidate||farthest;
}
