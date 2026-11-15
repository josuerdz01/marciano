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

## Perseverance HiRISE pilot

Fergason et al. (2020), Mars 2020 Terrain Relative Navigation HiRISE products, USGS Astrogeology. DOI: https://doi.org/10.5066/P9REJ9JN . Instruments: NASA/MRO/HiRISE; NASA/JPL/University of Arizona; USGS processing.

Source directory: https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/mars2020_trn/HiRISE/

- DEM: JEZ_hirise_soc_006_DTM_MOLAtopography_DeltaGeoid_1m_Eqc_latTs0_lon0_blend40.tif
- Paired orthoimage: JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first.tif

`perseverance-hirise-dem.f32.gz` is a 1201 × 1201 window, native 1 m float32 elevations, no smoothing or gap filling. Source vertical reference is retained; no vertical blending with another DEM is performed. `perseverance-hirise-ortho.png` covers the same approximately 1.2 km square, downsampled by area average from 25 cm to 50 cm. Invalid source pixels remain transparent. The explorer uses a smaller interior area with a sampling halo. Both JSON files preserve source URL, ETag, raster window, bounds, resolution and SHA-256; hashes are checked before use. Pixel spacing must not be interpreted as measured absolute accuracy. This local coverage does not imply a global 1 m Mars dataset.

Preparation: scripts/prepare_hirise.mjs. No uploaded synthetic NPZ data is redistributed.

## Odyssey GRS thorium

TH_5X5, product version 2.0, ODY-M-GRS-5-ELEMENTS-V1.0, NASA 2001 Mars Odyssey Gamma Ray Spectrometer / GRS Science Team, University of Arizona. Archived by NASA PDS Geosciences Node. Observations 2002-06-04–2005-04-03; product creation 2006-03-09.

Source and metadata URLs, original SHA-256 and column order appear in thorium-grs.json; the unmodified label is thorium-grs.lbl. Original data: https://pds-geosciences.wustl.edu/ody/ody-m-grs-5-elements-v1/odgm_xxxx/data/unsmoothed/5x5/th_5x5.tab . Catalog: https://pds-geosciences.wustl.edu/missions/odyssey/grs_elements.html . Science reference: Boynton et al. (2007), https://doi.org/10.1029/2007JE002887 .

Adaptation: reordered north-up, longitudes −180 to 180, weight percent multiplied by 10000 to ppm. All 2592 unsmoothed bins retained, including negative background-subtracted estimates; invalid sentinel values become null. Sigma and sigma-with-CFS remain separate. No smoothing, no local hazard interpolation, no conversion of thorium to dose or radiation safety. Reproduce with scripts/prepare_thorium.py.
