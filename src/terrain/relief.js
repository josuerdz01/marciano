export const RELIEF_FACTOR=3;
export const reliefHeight=(height,factor)=>height==null?null:(height+.1)*factor-.1;
// A view adapter: never rewrite the elevations or the mesh used by routing.
export function displayTerrain(model,factor=1){if(!model)return null;return{...model,physicalModel:model,visualFactor:factor,heightAt(x,z){return reliefHeight(model.heightAt(x,z),this.visualFactor)}}}
export function reliefStep(current,target,dt,reduced=false){const next=reduced?target:current+(target-current)*(1-Math.exp(-10*Math.min(dt,.05)));return Math.abs(next-target)<.001?target:next}
