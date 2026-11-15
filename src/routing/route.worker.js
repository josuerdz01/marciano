import {calculateAdaptiveRoutes} from './autofit.js';
self.onmessage=({data})=>{try{self.postMessage(calculateAdaptiveRoutes(data))}catch(error){self.postMessage({error:error.message})}};
