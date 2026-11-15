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

## Imagen orbital regional

En Terreno 3D se carga una base fotográfica georreferenciada a la misma ventana: el mosaico Viking VIS en color de Mars Trek, enriquecido con luminancia de CTX cuando está disponible. La composición se identifica como «Viking VIS + MRO CTX»; no se presenta como una captura en color nativo de CTX. Las zonas sin CTX conservan Viking. El cliente verifica el sistema marciano 104971 de CTX, limita la resolución y concurrencia y reutiliza la caché de fuentes públicas.

Primero se publica la imagen de color y después el detalle. Un fallo remoto conserva la vista y no cambia ni reinicia la misión. El control «Intensidad de capas» mezcla la capa analítica seleccionada encima de la fotografía (28 % inicial). Las estructuras, focos y sitios permanecen sobre el terreno. Las imágenes son observaciones orbitales reales; el relieve de este modo sigue siendo el escenario aportado, de modo que sus cráteres fotográficos no deben interpretarse como geometría medida.

La composición cercana se prepara a 3072×3072, seleccionando un nivel CTX acorde a ese tamaño (aproximadamente 5 m/píxel en las latitudes de aterrizaje). Se acota a 64 teselas como máximo por ventana y cuatro descargas concurrentes por capa. Viking aporta el color regional, no detalle cromático a resolución CTX.

## Tablero y recursos de misión

El tablero conserva la silueta trapezoidal de Marsiano y su vidrio, ampliado para integrar seis lecturas locales: posición X/Y en km desde la esquina SO, altitud del campo numérico, pendiente física, temperatura estimada del escenario, índice relativo de radiación y código geológico demostrativo. No se etiqueta la altitud sintética como MOLA ni el índice del mapa como mSv/km.

Los controles de consumo por distancia y capacidad de batería alimentan un acumulador de kWh: cambiar el consumo no reescribe lo ya gastado. La proyección incluye camino restante y retorno. Al agotarse la batería, el escenario pausa el avance; se puede ajustar la capacidad y continuar. El objetivo de tiempo restante A→B modifica la velocidad dentro del rango soportado y usa el recálculo existente. El factor de simulación cambia la velocidad del reloj de avance, conservando la relación entre distancia, energía y minutos simulados. La simulación inicia con los parámetros anteriores (2 km/h y ×120); batería, consumo y exposición son presupuestos configurables sin calibración del vehículo o del traje.

El astronauta conserva el círculo de O₂ e incorpora autonomía, dosis simulada humana en mSv, margen del umbral y alcance teórico a velocidad/tasa constantes, sin garantía de retorno. El corazón es rojo y parpadea por O₂ ≤20 % o dosis ≥umbral configurado; se respeta movimiento reducido. Tasa y umbral de exposición son un escenario independiente, sin diagnóstico ni tolerancia médica. No se convierten la concentración de torio, el índice sintético del mapa ni la dosis electrónica en exposición humana.

### Consola compacta y presentación frontal

La consola compacta conserva la silueta original, el tacómetro y todas las lecturas locales. Consumo, velocidad y tiempo A→B se ajustan con barras y un punto interactivo; el cambio se aplica al soltar el control o terminar una acción de teclado, evitando recalcular durante cada movimiento del puntero. Los presupuestos de misión y capacidad de batería permanecen como pequeños campos en una fila.

El medidor con icono de radiación se concentra en el astronauta, con barra verde–amarillo–naranja–rojo–magenta respecto al umbral del escenario. El umbral se edita junto a su tasa en los ajustes del astronauta. La lectura local del rover sigue siendo un índice relativo sin icono dosimétrico.

El enfoque de salida interpola distancia, elevación y orientación hacia el frente del vehículo por el arco más corto. Solo cuando termina se libera la secuencia de saludo, abordaje y avance. El encuadre reserva espacio para la consola sin alterar la posición geográfica del rover.

### Detalle orbital y riesgos de recorrido
- La vista orbital limpia desactiva el color analítico y sus superposiciones, conservando la foto CTX/Viking real. CTX entrega aproximadamente 5–6 m/píxel según nivel y cobertura; no inventa detalle subpíxel ni geometría de cráteres. La malla sintética permanece identificada.
- A* intenta primero excluir intensidad relativa ≥3 en ida y retorno, luego usa coste cuadrático por intensidad si no hay conexión. La advertencia cuantifica metros de tramos expuestos en ambos sentidos y pico relativo. No representa mSv, predicción de dosis humana ni medición local. GRS y obstáculos siguen siendo exclusiones duras, incluso en fallback.
- Doble clic sobre suelo regional añade/retira círculos de bloqueo de 50–500 m. Deshacer y limpiar están en Capas. Se conservan solo en la zona/sesión actual. La ruta activa se pausa y recalcula desde la posición del rover, manteniendo la base de regreso y los parámetros.
- Se reutilizan geometría/normales al cambiar color, se omite wireframe sobre fotografía y se cachea el campo de riesgos por cuadrícula/política. No se afirma un porcentaje de FPS sin medición.

### Velocidad sin reiniciar el viaje
La velocidad y el objetivo de duración actualizan el recorrido activo sin invocar A*, cambiar su identidad ni alternar `running`. Conservan distancia, tiempo consumido, posición, base y fase del astronauta. Si el nuevo ritmo requiere más presupuesto, se amplía solo el tiempo disponible hasta 720 min, sin sobrescribir la velocidad elegida. Un recorrido que aun así no cabe se pausa con un mensaje explícito. Los recálculos geométricos siguen reservados a pendiente, obstáculos y política de riesgo, conservando la intención de reanudar ante ediciones sucesivas.
