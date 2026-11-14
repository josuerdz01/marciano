import {calculateRoutes} from './mission.js';
self.onmessage=({data})=>{try{self.postMessage({routes:calculateRoutes(data)})}catch(error){self.postMessage({error:error.message})}};
