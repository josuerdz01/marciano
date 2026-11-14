// Reproducible lossless crop: no resampling, smoothing, or filling of NoData.
import {fromFile} from 'geotiff';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const file=process.argv[2];if(!file)throw new Error('Supply the official M20_JezeroCrater_CTXDEM_20m.tif');
const t=await fromFile(file),im=await t.getImage(),k=im.getGeoKeys(),[ox,oy]=im.getOrigin(),[sx,sy]=im.getResolution();
if(k.ProjCoordTransGeoKey!==17||k.ProjStdParallel1GeoKey!==18.4663||k.GeogSemiMajorAxisGeoKey!==3396190||sx!==20||sy!==-20)throw new Error('Unexpected source projection');
const rad=Math.PI/180*3396190,dx=sx/(rad*Math.cos(k.ProjStdParallel1GeoKey*Math.PI/180)),dy=-sy/rad,west=ox/(rad*Math.cos(k.ProjStdParallel1GeoKey*Math.PI/180)),north=oy/rad;
const c0=Math.max(0,Math.floor((77.3-west)/dx)),c1=Math.min(im.getWidth(),Math.ceil((78.05-west)/dx)),r0=Math.max(0,Math.floor((north-18.8)/dy)),r1=Math.min(im.getHeight(),Math.ceil((north-18.05)/dy));
const values=await im.readRasters({window:[c0,r0,c1,r1],interleave:true}),bytes=Buffer.alloc(values.length*4),nd=im.getGDALNoData();let valid=0;
for(let i=0;i<values.length;i++){const z=values[i]===nd?NaN:values[i];if(Number.isFinite(z))valid++;bytes.writeFloatLE(z,i*4)}
const meta={id:'jezero-ctx-20m',name:'Jezero · CTX estéreo 20 m',source:'https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif',catalog:'https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic',credit:'USGS · NASA/JPL · MRO/CTX · Calef, 2021',width:c1-c0,height:r1-r0,west:west+c0*dx,north:north-r0*dy,east:west+c1*dx,south:north-r1*dy,stepLon:dx,stepLat:dy,radius:3396190,resolutionMeters:20,units:'m',nodata:null,sha256:createHash('sha256').update(bytes).digest('hex'),sourceSha256:createHash('sha256').update(await readFile(file)).digest('hex'),validFraction:valid/values.length,projection:'Equidistant cylindrical, standard parallel 18.4663°, Mars 2000 sphere',processing:'Lossless native-pixel crop; Float32 little endian; gzip; no interpolation or NoData filling',verticalReference:'Source CTX stereo mosaic localized vertically to MOLA. Pixel spacing is not vertical accuracy.'};
await writeFile('public/data/jezero-dem.f32.gz',gzipSync(bytes));await writeFile('public/data/jezero-dem.json',JSON.stringify(meta,null,2)+'\n');await t.close();console.log(meta);
