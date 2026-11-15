import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {buildNasaGlobal,nasaLayers,nasaPixels} from '../src/nasa/model.js';
const folder=new URL('../public/nasa-layers/',import.meta.url),source=await readFile(new URL('../src/nasa/model.js',import.meta.url)),hash=createHash('sha256').update(source).digest('hex');
try{const old=JSON.parse(await readFile(new URL('manifest.json',folder),'utf8'));if(old.sourceHash===hash){console.log('NASA demonstration textures already prepared.');process.exit(0)}}catch{}
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(type,data){const name=Buffer.from(type),b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);name.copy(b,4);data.copy(b,8);b.writeUInt32BE(crc32(Buffer.concat([name,data])),data.length+8);return b}
function png(pixels,width,height){const row=width*4,scan=Buffer.alloc((row+1)*height),header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;for(let y=0;y<height;y++){const offset=y*(row+1);scan[offset]=1;for(let x=0;x<row;x++)scan[offset+1+x]=(pixels[y*row+x]-(x>=4?pixels[y*row+x-4]:0)+256)%256}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scan)),chunk('IEND',Buffer.alloc(0))])}
await mkdir(folder,{recursive:true});const fields=buildNasaGlobal(1440),layers={};for(const layer of nasaLayers){const filename=layer.id+'.png',bytes=png(nasaPixels(fields,layer.id),fields.width,fields.height);await writeFile(new URL(filename,folder),bytes);layers[layer.id]=filename;console.log(filename+': '+bytes.length+' bytes')}
await writeFile(new URL('manifest.json',folder),JSON.stringify({sourceHash:hash,sourceType:'procedural-demonstration',width:fields.width,height:fields.height,layers,lines:fields.lines}));
