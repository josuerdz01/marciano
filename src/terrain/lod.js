// Hysteresis avoids rebuilding the mesh around a zoom boundary. This controls
// display sampling only; route grids always retain native DEM cells.
export function terrainSegments(distance,previous=512){if(!Number.isFinite(distance))return previous;if(previous===128)return distance<30?512:distance<75?256:128;if(previous===256)return distance<30?512:distance>100?128:256;return distance>100?128:distance>45?256:512}
