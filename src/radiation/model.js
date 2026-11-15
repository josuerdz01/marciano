import {cellCoordinates} from '../routing/geometry.js';
export const thoriumSource='https://pds-geosciences.wustl.edu/missions/odyssey/grs_elements.html';
export const radSource='https://www.nasa.gov/news-release/nasa-rover-results-include-first-age-measurement-on-mars-and-help-for-human-exploration/';
export function thoriumAt(data,{lon,lat}){if(!data||!Number.isFinite(lon)||!Number.isFinite(lat)||lat< -90||lat>90)return null;const c=Math.floor((((lon+180)%360+360)%360)/5),r=Math.min(35,Math.floor((90-lat)/5)),cell=data.cells[r*72+c];return cell&&Number.isFinite(cell[0])?{ppm:cell[0],sigma:cell[1],sigmaWithCfs:cell[2],row:r,col:c}:null}
export function excludeThorium(grid,{data,avoid,threshold}){if(!avoid)return grid;if(!data)throw new Error('No se puede aplicar la exclusión: espera a que cargue torio GRS.');if(!Number.isFinite(threshold)||threshold<0)throw new Error('Límite de torio no válido.');const mask=new Uint8Array(grid.mask);for(let i=0;i<mask.length;i++){if(!mask[i])continue;const cell=thoriumAt(data,cellCoordinates(grid,i));if(!cell||cell.ppm>threshold)mask[i]=0}return{...grid,mask}}
// Scenario estimate only: historical RAD reference does not depend on thorium.
export function scenarioDose(minutes,rate=.67){return Math.max(0,minutes)*Math.max(0,rate)/1440}
export function thoriumColor(ppm){const t=Math.max(0,Math.min(1,ppm/2.17));return[Math.round(121+93*t),Math.round(145-39*t),Math.round(102-17*t)]}
