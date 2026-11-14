import {cellCoordinates,metricDistance} from './geometry.js';
class Heap{constructor(){this.a=[]}push(v){let i=this.a.length;this.a.push(v);while(i){const p=(i-1)>>1;if(this.a[p].f<=v.f)break;this.a[i]=this.a[p];i=p}this.a[i]=v}pop(){const head=this.a[0],last=this.a.pop();if(this.a.length){let i=0;while(true){let c=i*2+1;if(c>=this.a.length)break;if(c+1<this.a.length&&this.a[c+1].f<this.a[c].f)c++;if(this.a[c].f>=last.f)break;this.a[i]=this.a[c];i=c}this.a[i]=last}return head}get size(){return this.a.length}}
export function findRoute(grid,start,end,{maxSlope=15,weight=6}={}){
 const {width,height,values,mask,slopes}=grid,N=width*height;const valid=i=>Number.isInteger(i)&&i>=0&&i<N&&mask[i]&&Number.isFinite(values[i])&&slopes[i]<=maxSlope;
 if(!valid(start)||!valid(end))throw new Error('A o B está fuera del área con datos, o supera la pendiente permitida. Elige otro punto.');if(start===end)throw new Error('A y B caen en la misma celda de elevación. Sepáralos al menos una celda.');
 const target=cellCoordinates(grid,end),scores=new Float64Array(N);scores.fill(Infinity);const parent=new Int32Array(N);parent.fill(-1);const closed=new Uint8Array(N),heap=new Heap();scores[start]=0;heap.push({i:start,f:metricDistance(cellCoordinates(grid,start),target,grid.radius)});
 const offsets=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];let visited=0;
 while(heap.size){const {i}=heap.pop();if(closed[i])continue;closed[i]=1;visited++;if(i===end){const path=[];for(let p=end;p!==-1;p=parent[p])path.push(p);path.reverse();let distance=0,ascent=0,descent=0,steepest=0;const profile=[];for(let p=0;p<path.length;p++){const index=path[p];if(p){const prev=path[p-1],d=metricDistance(cellCoordinates(grid,prev),cellCoordinates(grid,index),grid.radius),dz=values[index]-values[prev];distance+=Math.hypot(d,dz);ascent+=Math.max(0,dz);descent+=Math.max(0,-dz);steepest=Math.max(steepest,Math.atan(Math.abs(dz)/d)*180/Math.PI)}steepest=Math.max(steepest,slopes[index]);profile.push({distance,elevation:values[index]})}return{path,distance,ascent,descent,maxSlope:steepest,cost:scores[end],visited,profile};}
 const col=i%width,row=Math.floor(i/width),a=cellCoordinates(grid,i);
 for(const[dc,dr]of offsets){const nc=col+dc,nr=row+dr;if(nc<0||nr<0||nc>=width||nr>=height)continue;const j=nr*width+nc;if(!valid(j)||closed[j])continue;if(dc&&dr&&(!valid(row*width+nc)||!valid(nr*width+col)))continue;
 const d=metricDistance(a,cellCoordinates(grid,j),grid.radius),grade=Math.atan(Math.abs(values[j]-values[i])/d)*180/Math.PI;if(grade>maxSlope)continue;
 const steep=Math.max(slopes[i],slopes[j],grade);const tentative=scores[i]+Math.hypot(d,values[j]-values[i])*(1+weight*(steep/maxSlope)**2);
 if(tentative<scores[j]){scores[j]=tentative;parent[j]=i;heap.push({i:j,f:tentative+metricDistance(cellCoordinates(grid,j),target,grid.radius)})}
 }
 }
 throw new Error('No hay una ruta conectada con ese límite de pendiente y cobertura. Prueba otros puntos o revisa el límite del modelo.');
}
