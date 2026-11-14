# Rutas en Marciano: datos recomendados y requisitos

## Qué hace falta

1. Región acotada y A/B en coordenadas de Marte. El sitio del enlace de Trek (44.3848 E, 35.9912 S) no es Jezero. No asumir que una región tiene los mismos datos que otra.
2. Elevación numérica DEM/DTM, máscara NoData y metadatos de proyección, datum y resolución; una imagen de relieve coloreada no sustituye alturas.
3. Derivados: pendientes longitudinales y laterales, rugosidad a escala del rover, bordes/escalones, obstáculos y máscara de suelo difícil. Las imágenes ayudan a interpretar rocas y dunas, pero el color no determina automáticamente capacidad portante o deslizamiento.
4. Modelo del vehículo: dimensiones y huella, radio de giro, altura libre, pendiente admisible, estabilidad, velocidad, energía y penalizaciones por terreno. Parámetros de un personaje no equivalen a límites de ingeniería.
5. Datos alineados en una proyección local métrica de Marte. Comprobar latitud planetocéntrica/planetográfica, longitudes, radios, referencia vertical, co-registro y escala. No usar sin revisión el CRS terrestre EPSG:4326 ni distancias euclídeas en grados.
6. Validación contra pendientes y obstáculos, ensanchamiento de obstáculos por huella y error de posición; revisión de artefactos del DEM. Las celdas sin datos quedan bloqueadas o explícitamente desconocidas.

## Fuentes prioritarias

| Fuente | Aporte | Uso propuesto / límite |
| --- | --- | --- |
| USGS Mars 2020 / Jezero HiRISE | Mosaico ortorrectificado de 25 cm/píxel y DTM de 1 m, citados por el Analyst's Notebook | Primera región piloto para rutas locales; confirmar cobertura de cada producto y descargar un recorte. |
| HiRISE DTM/PDS | DTM locales, generalmente 1–2 m entre muestras; ortoimágenes asociadas | Mejor fuente para pendientes locales donde haya cobertura; revisar artefactos, no sólo resolución. |
| USGS Mars 2020 Science Investigation CTX DEM | DTM regional de 20 m para Jezero | Contexto, continuidad y rutas de escala regional; no resuelve obstáculos pequeños. |
| MOLA / HRSC | Elevación global/regional | Exploración amplia y contexto; insuficiente para afirmar transitabilidad de un rover a escala de ruedas. |
| MRO CTX | Imágenes orbitales de contexto | Base visual local ya conectada en Marciano; mosaico no controlado puede tener desajustes, no aporta DEM por sí solo. |
| PDS Analyst's Notebook / Mars 2020 | Posiciones y recorridos reales, localización de muestras y productos por sitio/sol | Comparación y contexto de misión. El trayecto real no demuestra que otra ruta sea segura ni cuál es la ruta óptima. |
| CRISM MTRDR / MRDR | Composición, parámetros espectrales y mineralogía | Priorizar lugares científicos. No convierte mineralogía en riesgo mecánico ni mide radiación ionizante. |

Fuentes primarias:
- [PDS Analyst's Notebook: mapas y productos de Jezero](https://an.rsl.wustl.edu/help/Content/Using%20the%20Notebook/Main%20sections/Maps/Traverse%20map.htm). Identifica el ortomosaico `JEZ_hirise_soc_007_orthoMosaic_25cm_Ortho_blend120` y el DTM `JEZ_hirise_soc_006_DTM_MOLAtopography_DeltaGeoid_1m_Eqc_latTs0_lon0_blend40.tif`.
- [Directorio USGS de mapas Mars 2020](https://planetarymaps.usgs.gov/mosaic/mars2020_trn/).
- [Ficha USGS del DEM CTX de Jezero](https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic). El acceso al HTML devolvió 403 durante esta investigación; el resultado indexado identifica el producto de 20 m. No se descargó ni verificó el raster completo.
- [Raster CTX DEM de 20 m citado por USGS](https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif).
- [Catálogo HiRISE DTM](https://www.uahirise.org/dtm/) y [resolución, formato y artefactos](https://www.uahirise.org/dtm/about.php).
- [Inventario de productos USGS para Marte](https://fdp.astrogeology.usgs.gov/fdp/mars/).
- [PDS Mars 2020](https://pds-geosciences.wustl.edu/missions/mars2020/).
- [PDS CRISM](https://pds-geosciences.wustl.edu/missions/mro/crism.htm).
- [JPL: navegación y percepción del terreno](https://robotics.jpl.nasa.gov/what-we-do/flight-projects/mars-science-laboratory/surface-system-software-and-rover-navigation/).

## Primera implementación del cálculo

Recomiendo un recorte pequeño de Jezero donde coincidan DTM e imagen HiRISE. Procesar en Python/GDAL: recorte, reproyección local, alturas y NoData, pendientes a varias escalas, máscaras revisadas y raster de costes. Guardar como COG/teselas y una cuadrícula de navegación con versión y procedencia. No cargar un GeoTIFF regional enorme entero en el navegador.

A* sobre esa cuadrícula, en un Web Worker para un recorte pequeño o servicio para áreas grandes. Dijkstra puede servir de referencia para comprobar el coste óptimo de A*. El coste de cada arista combina distancia, desnivel, rugosidad, energía estimada y terreno. La pendiente y el consumo pueden ser direccionales. La heurística debe ser admisible para el coste definido. Evitar cortar esquinas y comprobar cada tramo suavizado; el suavizado no puede atravesar obstáculos.

Inflar obstáculos por huella + margen de localización. Bloquear trayectorias que excedan las restricciones. Entregar distancia métrica, perfil de elevación, pendiente máxima calculada, coste y cobertura; si no hay camino, indicar la causa. Comparar “menor distancia” y “menor coste modelado”, sin etiquetar una alternativa como segura sin validación. D* Lite es una posible evolución para replanificación con cambios.

La IA puede ayudar más adelante a clasificar terreno sobre imágenes si hay etiquetas y validación. No hace falta una red neuronal para empezar a buscar rutas. Para navegación física local se necesitan percepción estéreo, localización y comprobación de obstáculos; JPL describe cómo estas capacidades complementan la planificación.

## CRISM y el ejemplo de la captura

CRISM sí complementa el producto como capa científica. MTRDR es una buena entrada porque contiene observaciones dirigidas proyectadas; aún hace falta seleccionar producto, bandas/parámetros, procesar y alinear su huella y describir incertidumbre. La captura muestra una superposición visual con puntos y recorridos; sólo por la imagen no puede determinarse qué algoritmo, DEM, pesos o validación usa esa implementación.

## Estado actual de Marciano

Ya muestra imágenes reales globales WMTS y una vista local CTX con rover simbólico. El plano local aún no tiene alturas. No calcula rutas A*, pendientes, colisiones ni alertas radiológicas. La carga local es una ventana de nueve teselas, no un mapa infinito. El movimiento del personaje es ilustrativo y limitado a esa ventana. La investigación anterior prepara el siguiente trabajo de datos; no afirma que esos rasters estén integrados.
