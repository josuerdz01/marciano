# Integración del proyecto aportado

Las cinco paletas y el generador procedimental de `main.js` se trasladaron a `src/nasa`. El cálculo se ejecuta en un worker; el navegador conserva la UI, el rover, el astronauta y el planificador de Marsiano. Las rutas y el relieve comparten el campo de alturas sintético, sin combinarlo con el DEM medido anterior. No se inicia ninguna ruta automáticamente.

El explorador comienza en el mapa global 2D; una selección de sitio abre el detalle 3D. Las capas y superposiciones mantienen la región, el zoom y la ruta. El globo conserva sus imágenes NASA Mars Trek y sus sitios históricos.

## Fuentes pendientes

`Mapa mars_ver1.qgz` contiene 37 referencias, no los archivos cartográficos. El único raster referenciado es `MARS_NAV_V2_DEMO_Variacion_SINTETICA_mSv_dia.tif`. También faltan `sim3292_database` y sus capas SIM3292. El inventario completo está en `public/data/nasa-qgis-sources.json`.

Por eso las cinco vistas se identifican como escenario demostrativo. No son mediciones de elevación, geología o dosis de radiación de NASA. Los focos y estructuras del original se conservan como escenarios. No se trasladaron las afirmaciones clínicas ni el umbral de supervivencia del original.

El cálculo de pendiente local usa las distancias físicas de la cuadrícula, sin el multiplicador arbitrario ×16 del original. La altura se dibuja a escala vertical 1:1; los colores reproducen la paleta aportada. Estas correcciones se mantienen explícitas para no atribuir exactitud científica al escenario.

## Nitidez y coste de carga

Las cinco texturas globales se preparan desde el generador a 1440×720 y se codifican como PNG reproducibles durante la compilación. Son texturas de datos, no capturas de pantalla. El cliente descarga esas texturas y no repite el cálculo global en cada visita. El detalle regional se calcula en un worker, con 256 muestras por eje más halo. Los sitios se dibujan mediante badges HTML/SVG de Marsiano, nunca como letras dentro de las imágenes.

El zoom 2D entra en detalle 3D cuando el ancho visible baja de 28°, siguiendo el comportamiento del original. Las muestras más densas mejoran el renderizado del generador; no equivalen a nueva información científica.
