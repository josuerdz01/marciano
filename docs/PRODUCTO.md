# Marciano · dirección inicial

## Identidad e interacción

Marfil #EEEEE6, grafito #30382E, liquen #A7B575 y acento #D4DFA8. Una tipografía sans, controles sobrios, sin degradados decorativos ni paneles innecesarios. La superficie del planeta conserva el color de su fuente: la interfaz y el rover aportan la identidad alternativa al naranja habitual.

Rover original: carrocería liquen, módulo crema, ruedas grafito, dos ojos luminosos y antena. La referencia nav-mochi aporta lectura del vehículo en cámara inclinada, proporciones juguetonas y rutas comparables; no se copian sus activos ni código. Futuro: animar ruedas, giro de cabeza, suspensión y reacciones discretas. El personaje acompaña; no tapa datos ni lanza diálogos constantes.

Globo global → elegir lugar → acercamiento continuo → terreno local y rover. No llevar el carrito a escala arbitraria sobre todo el planeta. Introducción opcional y omisible, una vez por sesión, respetando movimiento reducido. Una galaxia y un sistema solar son escalas distintas: si se desarrolla esa entrada, comunicar la transición sin aparentar distancias astronómicas exactas.

## Capas recomendadas y fuentes

1. **Superficie**: mosaico global de contexto; CTX/HiRISE sólo donde exista cobertura y licencia apropiada. [Mars Trek WMTS](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars), [ASU Mars datasets](https://mars.asu.edu/data/).
2. **Relieve / elevación**: MOLA y HRSC. Primera integración científica recomendada. [USGS inventario](https://fdp.astrogeology.usgs.gov/fdp/mars/), [USGS mapa MOLA](https://pubs.usgs.gov/imap/i2782/).
3. **Pendiente y transitabilidad**: derivadas del DEM, escala y resolución visibles. Un mapa global no resuelve piedras ni riesgos locales. DEM local de mayor resolución para planificar el rover.
4. **Temperatura superficial**: integrar observaciones o modelos con fecha, hora local, estación, resolución y unidades; no presentar una imagen térmica histórica como clima actual. Investigar THEMIS en [ASU](https://themis.asu.edu/).
5. **Atmósfera**: temperatura del aire, presión, viento y polvo. [MEDA](https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/) en Jezero y REMS en Gale son mediciones locales. Consultar archivos [PDS](https://pds.nasa.gov/) y [PDS Atmospheres](https://pds-atmospheres.nmsu.edu/). Una capa global requiere un modelo atmosférico validado, separado de las estaciones.
6. **Radiación / exposición estimada**: [RAD en Curiosity](https://science.nasa.gov/mission/msl-curiosity/science-instruments/), [registro PDS RAD](https://pds.nasa.gov/ds-view/pds/viewContext.jsp?identifier=urn%3Anasa%3Apds%3Acontext%3Ainstrument%3Arad.msl&version=1.2). MEDA mide radiación ambiental óptica/UV/IR, no sustituye a RAD para radiación ionizante. No hay aquí una fuente validada para un mapa global de alertas locales en tiempo real.

Cada capa debe aportar: instrumento/modelo, licencia, fecha de observación y publicación, cobertura, resolución, sistema de coordenadas, unidades, incertidumbre y estado de ausencia de datos. Definir latitud planetocéntrica y longitud este 0–360, radios y datum antes de cruzar capas. Verificar CORS, formatos, límites y estabilidad del servicio antes de integrarlo; no asumir una API meteorológica global lista para consumir.

## Rutas: recomendación técnica

Empezar con **A*** determinista en una región acotada con DEM real. Crear una malla de transitabilidad; bloquear celdas sin datos, obstáculos y pendientes incompatibles con el rover. Evitar diagonales que atraviesen obstáculos. El coste combina distancia, inclinación, rugosidad, suelo, energía estimada y exposición cuando haya un modelo defendible. Definir los límites con las características físicas del vehículo, no con un umbral universal.

Mostrar dos alternativas: menor distancia y menor coste/riesgo modelado, con desglose y limitaciones. Una heurística admisible permite optimizar el coste definido; no garantiza seguridad física. El resultado depende de resolución, cobertura, supuestos y pesos. No empezar por una red neuronal para “predecir la mejor ruta”.

Después: D* Lite para replantear con cambios y percepción local para detectar rocas/arena. Un modelo de aprendizaje podría estimar transitabilidad del suelo si contamos con etiquetas y validación; mantener la planificación y las restricciones explícitas. [JPL risk-aware planner](https://robotics.jpl.nasa.gov/what-we-do/research-tasks/next-gen-autonav-concept/), [AutoNav en acción](https://science.nasa.gov/resource/perseverances-sol-200-auto-nav-drive/).

## Radiación: diseño de alertas

Separar riesgo mecánico de exposición radiológica. La radiación depende también del tiempo y de eventos solares; no dibujar círculos permanentes como si fueran sitios contaminados. Mostrar medición local con su antigüedad o escenario modelado con incertidumbre. Alertas de evento, presupuesto de exposición acumulada y recomendación simulada sólo tras definir modelo, sujeto (persona/electrónica), unidades y validación. Dato ausente debe decir “sin datos”, nunca “seguro”.

## Siguiente secuencia

- Integrar relieve global con leyenda y fuente, selección de coordenadas y lugares de interés.
- Elegir una región piloto con DEM local y desarrollar aterrizaje de cámara y terreno por tiles.
- Sustituir paseo por navegación A–B validada, perfil de elevación y costes comparables.
- Añadir estaciones históricas con selector temporal y cobertura explícita.
- Guardar lugares y recorridos en el navegador; captura compartible, control por teclado y calidad gráfica adaptable.
- Introducir radiación únicamente tras seleccionar y validar datos/modelo.

Fuentes futuras deben entrar mediante adaptadores, separados del estado y los componentes. El frontend no almacenará credenciales. Datos grandes: tiles y procesamiento previo, no GeoTIFF global completo en el navegador.

## Integración realizada: Mars Trek WMTS

Ya están conectados Viking VIS color, MOLA/HRSC color y sombreado, THEMIS diurno y nocturno. El selector lee las capacidades de cada servicio y compone teselas reales en la matriz global 2. La visualización de 2048 × 1024 px no equivale a la resolución nativa indicada en el producto. THEMIS tiene cobertura aproximada ±65° y no aporta aquí temperaturas numéricas ni datos actuales. El detalle adaptativo al hacer zoom y el DEM geométrico quedan pendientes.
