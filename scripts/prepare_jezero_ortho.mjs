// Create a georeferenced display overview; original pixels are never described
// as native at the reduced overview's sampling resolution.
import {fromFile} from 'geotiff';import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('sharp');
const path=process.argv[2],t=await fromFile(path),im=await t.getImage(),keys=im.getGeoKeys(),[ox,oy]=im.getOrigin(),[sx,sy]=im.getResolution();
console.log({width:im.getWidth(),height:im.getHeight(),ox,oy,sx,sy,keys});
if(keys.ProjCoordTransGeoKey!==17||keys.GeogSemiMajorAxisGeoKey!==3396190||keys.ProjStdParallel1GeoKey!==18.4663)throw new Error('Unexpected ortho projection');
const d=JSON.parse(await readFile('public/data/jezero-dem.json')),rad=Math.PI/180*3396190,xscale=rad*Math.cos(18.4663*Math.PI/180),west=ox/xscale,north=oy/rad,dx=sx/xscale,dy=-sy/rad,c0=Math.max(0,Math.floor((d.west-west)/dx)),r0=Math.max(0,Math.floor((north-d.north)/dy)),c1=Math.min(im.getWidth(),Math.ceil((d.east-west)/dx)),r1=Math.min(im.getHeight(),Math.ceil((north-d.south)/dy));
const width=3072,height=Math.round((r1-r0)/(c1-c0)*width),r=await im.readRasters({window:[c0,r0,c1,r1],width,height,interleave:true,resampleMethod:'bilinear'});
const bytes=await sharp(Buffer.from(r),{raw:{width,height,channels:1}}).png().toBuffer();await writeFile('public/data/jezero-ortho.png',bytes);
await writeFile('public/data/jezero-ortho.json',JSON.stringify({name:'Jezero · CTX ortorrectificado',source:'https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXortho_mosaic_5m.tif',catalog:d.catalog,west:west+c0*dx,north:north-r0*dy,spanLon:(c1-c0)*dx,spanLat:(r1-r0)*dy,width,height,nativeMetersPerPixel:5,displayMetersPerPixel:(c1-c0)*sx/width,sha256:createHash('sha256').update(bytes).digest('hex'),processing:'Bilinear display overview from matching CTX orthomosaic; same source Mars projection as DEM. No invented content.'},null,2)+'\n');await t.close();
