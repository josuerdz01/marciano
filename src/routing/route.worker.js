import {findRoute} from './astar.js';
self.onmessage=({data})=>{try{const{grid,a,b,maxSlope}=data;const short=findRoute(grid,a,b,{maxSlope,weight:0}),gentle=findRoute(grid,a,b,{maxSlope,weight:8});self.postMessage({routes:[{...short,id:'short',name:'Menor distancia'},{...gentle,id:'gentle',name:'Menor coste por pendiente'}]})}catch(error){self.postMessage({error:error.message})}};
