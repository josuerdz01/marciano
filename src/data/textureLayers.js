import {marsLayers} from './marsLayers';
import {ctxLayer} from './localMap';
export const textureLayers=[{...ctxLayer,native:'5 m/píxel fuente',coverage:'Mosaico global con huecos',description:'Imágenes históricas CTX de MRO. Mosaico no controlado geométricamente; puede presentar huecos y desplazamientos respecto al DEM. La resolución mostrada depende del nivel de tesela.',metadata:ctxLayer.capabilities},...marsLayers];
export const getTextureLayer=id=>textureLayers.find(layer=>layer.id===id)||textureLayers[0];
