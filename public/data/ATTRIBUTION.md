# Regional numerical elevation data

Dataset: Mars MGS MOLA – MEX HRSC Blended DEM Global 200m, v2.
Authors: USGS Astrogeology Science Center; Fergason et al. (2018), HRSC and MOLA Blend.
Sources/instruments: NASA Mars Global Surveyor MOLA; ESA Mars Express HRSC; DLR.
Catalog: https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m
Source file: https://planetarymaps.usgs.gov/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif

USGS states the access constraints as MOLA (CC0) and HRSC (CC BY-SA 3.0 IGO).
CC0: https://creativecommons.org/publicdomain/zero/1.0/
HRSC license: https://creativecommons.org/licenses/by-sa/3.0/igo/
The cropped combined data in region-dem.i16 is redistributed under CC BY-SA 3.0 IGO with the above source attribution. No change to source elevations is made: this is a window extraction into little-endian signed 16-bit cells. NoData = -32768. Product source grid is 200 m nominally; the effective detail varies because this is a blend, including resampled MOLA.

region-dem.json records geographic extent, source CRS/datum, original raster window, units, scale/offset, extraction date and SHA-256 of the binary. scripts/prepare_dem.py reproduces the extraction using HTTP range reads. The full global source is not bundled. Rendering images from CTX are separately attributed in the app.
