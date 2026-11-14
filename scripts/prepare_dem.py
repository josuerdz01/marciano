"""Extract the documented USGS DEM using HTTP range reads; never download the 11 GB globe."""
import json,hashlib,datetime,os,math
import rasterio
from rasterio.windows import Window,from_bounds
from rasterio.transform import array_bounds
import numpy as np
URL='https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif'
LON,LAT=-57.70568740014555,-20.148925405400668
os.environ['GDAL_DISABLE_READDIR_ON_OPEN']='EMPTY_DIR'
os.environ['CPL_VSIL_CURL_ALLOWED_EXTENSIONS']='.tif'
with rasterio.Env(GDAL_HTTP_TIMEOUT='60',GDAL_HTTP_MULTIRANGE='YES'):
 with rasterio.open('/vsicurl/'+URL) as src:
  print('SOURCE',src.width,src.height,src.crs,src.transform,src.nodata,src.scales,src.offsets,flush=True)
  # The source uses projected metres with a simple cylindrical Mars sphere.
  radius=src.crs.to_dict().get('R',3396190)
  if src.crs.is_geographic:
   bounds=(LON-.65,LAT-.65,LON+.65,LAT+.65)
  else:
   bounds=tuple(v*math.pi/180*radius for v in [LON-.65,LAT-.65,LON+.65,LAT+.65])
  raw=from_bounds(*bounds,transform=src.transform);window=Window(math.floor(raw.col_off),math.floor(raw.row_off),math.ceil(raw.width)+1,math.ceil(raw.height)+1)
  a=src.read(1,window=window);transform=src.window_transform(window);bounds=array_bounds(*a.shape,transform)
  if not src.crs.is_geographic:bounds=tuple(v/radius*180/math.pi for v in bounds)
  payload=a.astype('<i2').tobytes();open('public/data/region-dem.i16','wb').write(payload)
  info={'id':'hrsc-mola-v2-region','name':'USGS MOLA / HRSC DEM v2','source':URL,'catalog':'https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m','credit':'USGS · NASA/MGS/MOLA · ESA/Mars Express/HRSC · DLR','license':'MOLA CC0; HRSC CC BY-SA 3.0 IGO; cite authors','authors':'Fergason et al., 2018, HRSC and MOLA Blend, v2','sourceCrs':src.crs.to_wkt(),'radius':radius,'width':a.shape[1],'height':a.shape[0],'west':bounds[0],'south':bounds[1],'east':bounds[2],'north':bounds[3],'stepLon':(bounds[2]-bounds[0])/a.shape[1],'stepLat':(bounds[3]-bounds[1])/a.shape[0],'resolutionMeters':200,'nodata':src.nodata,'scale':src.scales[0],'offset':src.offsets[0],'units':'m','dtype':'int16-le','sha256':hashlib.sha256(payload).hexdigest(),'downloadedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceWindow':[window.col_off,window.row_off,window.width,window.height],'min':int(a[a!=src.nodata].min()),'max':int(a[a!=src.nodata].max())}
  json.dump(info,open('public/data/region-dem.json','w'),indent=2);print(json.dumps(info),flush=True)
