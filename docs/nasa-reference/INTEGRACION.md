# Integración del proyecto aportado

Las cinco paletas y el generador procedimental de `main.js` se trasladaron a `src/nasa`. El cálculo se ejecuta en un worker; el navegador conserva la UI, el rover, el astronauta y el planificador de Marsiano. Las rutas y el relieve comparten el campo de alturas sintético, sin combinarlo con el DEM medido anterior. No se inicia ninguna ruta automáticamente.

El explorador comienza en el mapa global 2D; una selección de sitio abre el detalle 3D. Las capas y superposiciones mantienen la región, el zoom y la ruta. El globo conserva sus imágenes NASA Mars Trek y sus sitios históricos.

## Fuentes pendientes

`Mapa mars_ver1.qgz` contiene 37 referencias, no los archivos cartográficos. El único raster referenciado es `MARS_NAV_V2_DEMO_Variacion_SINTETICA_mSv_dia.tif`. También faltan `sim3292_database` y sus capas SIM3292. El inventario completo está en `public/data/nasa-qgis-sources.json`.

Por eso las cinco vistas se identifican como escenario demostrativo. No son mediciones de elevación, geología o dosis de radiación de NASA. Los focos y estructuras del original se conservan como escenarios. No se trasladaron las afirmaciones clínicas ni el umbral de supervivencia del original.

El cálculo de pendiente local usa las distancias físicas de la cuadrícula, sin el multiplicador arbitrario ×16 del original. La altura se dibuja a escala vertical 1:1; los colores reproducen la paleta aportada. Estas correcciones se mantienen explícitas para no atribuir exactitud científica al escenario.

## Nitidez y coste de carga

Las cinco texturas globales se preparan desde el generador a 1440×720 y se codifican como PNG reproducibles durante la compilación. Son texturas de datos, no capturas de pantalla. El cliente descarga esas texturas y no repite el cálculo global en cada visita. El detalle regional se calcula en un worker, con 256 muestras por eje más halo. Los sitios se dibujan mediante badges HTML/SVG de Marsiano, nunca como letras dentro de las imágenes.

El zoom 2D entra en detalle 3D únicamente al llegar a la escala regional (dos veces el ancho del área local) mediante un gesto manual. Pulsar Explorar restaura el mapa global cenital. Las muestras más densas mejoran el renderizado del generador; no equivalen a nueva información científica.

## Representación regional 3D

La malla usa las posiciones numéricas compartidas con rutas y ruedas. Se trasladaron del original los colores por vértice, el sombreado facetado y la cuadrícula al 5 % de opacidad. La capa de altura utiliza el rango de la región para hacer legibles los accidentes locales; esto cambia la escala de color, no la elevación ni las pendientes. Geología, radiación, sombreado y pendiente tienen representaciones regionales sincronizadas con el selector existente. Los focos se delinean siguiendo la superficie, sin aportar nuevas zonas medidas.

Se conserva la cámara suave de Marsiano, la secuencia de enfoque, saludo y abordaje, y el seguimiento durante el viaje. La cámara cercana respeta una separación mínima del mismo relieve. No se copia la exageración vertical arbitraria del original ni su salto entre celdas redondeadas.

## Relieve realzado opcional

El panel permite activar «Relieve realzado» únicamente en Terreno 3D. Está desactivado de inicio y multiplica visualmente las diferencias de altura por tres alrededor del datum local. El cambio se interpola sin reconstruir la malla: una transformación del grupo mantiene unidos el terreno, sus superposiciones, las rutas y sus etiquetas. El vehículo y el astronauta conservan sus proporciones y se apoyan en un adaptador de altura de la superficie dibujada.

El DEM, las pendientes del planificador, las distancias, la velocidad y el tiempo se calculan sobre el modelo físico sin exageración. El indicador de inclinación del tablero conserva esa referencia. La leyenda y el pie del mapa identifican el modo ×3; volver a 2D usa la escala 1:1 sin olvidar la preferencia para el siguiente detalle 3D.
