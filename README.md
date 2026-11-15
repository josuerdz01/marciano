# marciano

Atlas exploratorio de Marte. React, React Router, Three.js / React Three Fiber, Lucide y Morphicons.

## Desarrollo

Node.js 22.12+ y pnpm 11.

```sh
pnpm install
pnpm dev
pnpm build
```

Rutas: `/` planeta, `/explorar` vista local CTX, rover y rutas, `/fuentes` bibliografía inicial. Para hosting estático, configurar fallback de rutas a `index.html`.

## Estado de esta versión

Prototipo visual: mapa a viewport completo con controles flotantes, globo con textura, control orbital, vista sin distracciones, tema oscuro oficial, recorrido guiado, rover modelado con primitivas y paseo ilustrativo. La entrada de unos once segundos recorre una galaxia de partículas, sistema solar y acercamiento a Marte; puede omitirse y repetirse. Las posiciones y escalas son ilustrativas, no efemérides. La entrada automática respeta movimiento reducido.

Incluye relieve 3D y rutas A* con el DEM del área cargada. No incorpora datos meteorológicos, alertas de radiación ni navegación física. La vista CTX local sí calcula coordenadas geográficas aproximadas del personaje. La retícula es una referencia gráfica sin etiquetas geográficas. El paseo no evita obstáculos físicos. La malla y las rutas comparten alturas MOLA/HRSC reales.

El globo utiliza las capas reales NASA Mars Trek. Los colores de las imágenes orbitales se conservan; las vistas de elevación y pendiente tienen escalas cartográficas explícitas.

Ver [propuesta y fuentes](docs/PRODUCTO.md).

## Mapas reales de NASA Mars Trek

El selector carga cinco productos WMTS desde `trek.nasa.gov`: Viking color, MOLA/HRSC color y sombreado, THEMIS IR día y noche. Los identificadores, procedencia y cobertura están centralizados en `src/data/marsLayers.js`. El adaptador lee `WMTSCapabilities.xml` para obtener el estilo, plantilla y matriz, verifica la cuadrícula equirectangular y compone la matriz 2 (2048 × 1024 px). Las teselas se solicitan directamente por CORS, con seis solicitudes concurrentes, cancelación al cambiar de capa y tiempos límite. La fuente es real, pero esta vista global está reducida respecto de la resolución nativa del producto; **no implementa aún detalle adaptativo por zoom**.

La capa anterior permanece visible mientras carga la siguiente y su atribución continúa al pie. Un error ofrece reintento; no sustituye datos por texturas ficticias. Las teselas 404 y la región fuera de cobertura se muestran con rayado. THEMIS cubre aproximadamente ±65° y sus mosaicos v2 son de octubre de 2018: no son clima en vivo ni un termómetro en °C. Las capas WMTS MOLA/HRSC son imágenes cartográficas; el relieve local procede por separado del GeoTIFF numérico. El material del mapa no añade iluminación artificial a los colores del producto.

El rover tiene escala simbólica y se apoya en el terreno. Introducción, planeta y explorador comparten una escena continua.

## Vista local y rover

El zoom orbital activa el descenso cuando la cámara se acerca al globo. La región se obtiene de la intersección del centro de la cámara con la esfera; el botón de exploración usa el sitio inicial del enlace de Mars Trek (57.7056874 O, 20.1489254 S). El panel permite cambiar a Jezero.

La vista local carga una ventana de 3 × 3 teselas CTX del servicio Esri indicado en las capacidades NASA. Lee además `tileInfo` del servicio para respetar sus teselas de 512 px, origen, datum marciano y resolución. No presupone que las dimensiones anunciadas por WMTS coincidan con las imágenes del distribuidor. Si una imagen resulta incompleta, intenta niveles 10 y 9, informa de la reducción de detalle y calcula de nuevo extensión y resolución. No hay terreno ficticio como sustitución.

El rover usa coordenadas locales sobre una malla georreferenciada, puede moverse con WASD, flechas o controles táctiles y se limita a la ventana y cobertura cargadas. Tiene escala y velocidad simbólicas. El movimiento no evita cráteres ni valida seguridad; el DEM numérico se usa tanto para el cálculo como para la geometría. No existe aún carga infinita al desplazar la cámara. El panel ocupa todo el alto y separa Lugares, Capas, Misión, Rover y Datos.

Ver [requisitos y fuentes para calcular rutas](docs/RUTAS-Y-FUENTES.md). CRISM se ha registrado como fuente de mineralogía candidata; sus datos espectrales todavía no se renderizan.

Verificación geométrica: `node --test`.

## Rutas A–B con datos reales

La pestaña **Misión** permite elegir A/B sobre el área cargada, calcular alternativas de distancia y pendiente, consultar métricas/perfil y animar el rover hasta B. Usa elevación numérica USGS MOLA/HRSC v2 de cuadrícula nominal 200 m, leída por recortes del producto global y con un recorte inicial verificado por hash; no usa colores de una textura para inferir alturas. El cálculo está limitado al recorte y cobertura local disponible y no valida peligros pequeños.

[Implementación, APIs y tecnologías](docs/IMPLEMENTACION-RUTAS.md) · [Atribución del DEM](public/data/ATTRIBUTION.md).

## Lugares oficiales y capas locales

Planeta muestra Olympus Mons, Valles Marineris, Jezero, Gale y Hellas Planitia, con nombres y centros cartográficos del Gazetteer IAU/USGS (red MDIM 2.1, latitud planetocéntrica y longitud este normalizada). Cada lugar enlaza su ficha. Son centros de accidentes geográficos, no coordenadas de aterrizaje de misiones. Los marcadores del hemisferio oculto se esconden y todos los lugares están disponibles en Mapa → Lugares conocidos. Se pueden ocultar desde el panel.

Al seleccionar un punto, la cámara orbita hacia él y se acerca; al terminar el vuelo y la carga CTX abre la vista local. Respeta movimiento reducido. La lista oficial se concentra en `src/data/landmarks.js` y su correspondencia con las UV de la esfera tiene pruebas geométricas.

Explorar sigue siendo una ventana local, no un mapa infinito de todo Marte. Ahora permite alternar CTX, Viking, relieve MOLA/HRSC en color/grises y THEMIS día/noche: recorta teselas WMTS a la misma extensión local y muestra su fuente y resolución. Los datos de pendiente/rutas y la máscara de cobertura CTX no cambian al cambiar la textura. La elevación para A–B se solicita al abrir cada sitio. El cálculo requiere alturas y cobertura válidas; una caída del servicio no se sustituye por datos inventados.

### Exploración de escritorio y lugares

La vista cenital mantiene el mapa a viewport completo. El panel se superpone con vidrio verde (desenfoque, saturación, reflejo interior y sombra adaptados del material de Sobre). La búsqueda reúne 2,054 centros cartográficos oficiales IAU/USGS; las fichas muestran coordenadas, procedencia, distancia a Jezero y disponibilidad del DEM integrado. Los mismos puntos se proyectan sobre el explorador cuando están dentro de la ventana cargada. Seleccionar una etiqueta abre su ficha; no cambia la ruta ni representa la posición de una misión.

La introducción, el planeta y el mapa comparten un único Canvas. El recorrido inicial usa una curva continua de cámara y objetivo, y el cambio al mapa interpola cámara y opacidad sin una cortina opaca. Se respeta movimiento reducido. Las pruebas de movimiento verifican continuidad y coincidencia de encuadres finales; la comprobación visual principal se realizó en escritorio a 1440 × 900.

La cobertura del explorador sigue siendo una ventana local de 3 × 3 teselas; no es todavía un mapa global con carga continua. Los lugares oficiales están disponibles desde búsqueda aunque queden fuera de esa ventana.

### Caminata científica · Space Apps

El panel Misión permite situar una base A, un destino B y una parada científica C opcional. Cada alternativa A* debe pasar por C; una parada inaccesible produce un error, no se omite. El objetivo científico es una intención del usuario, no un descubrimiento confirmado. El rover continúa como acompañante ilustrativo.

El resumen calcula ida y regreso por las mismas celdas, trabajo científico y margen tras una reserva de tiempo. Ritmo (2 km/h), disponibilidad (240 min), reserva (25 %) y trabajo (20 min) son valores iniciales de demostración editables, sin procedencia fisiológica ni certificación NASA. Fórmula: minutos de viaje = 2 × distancia de ida / ritmo × 60; total = viaje + trabajo; disponible = presupuesto × (1 − reserva/100). No modela esfuerzo ni recursos del traje. El coste A* por pendiente es simétrico; ascenso y descenso se intercambian al volver.

CTX y MOLA/HRSC son observaciones históricas; pendientes y recorridos son derivados. Clima, radiación, suelo y obstáculos siguen sin integrar y se indican explícitamente. No se generan mediciones actuales ni alertas radiológicas ficticias. CRISM permanece como fuente candidata, pendiente de cobertura y procesamiento. El objetivo es un prototipo explicable de planificación, no navegación operacional.

### Catálogo de puntos en el explorador

El explorador integra 2,054 accidentes geográficos aprobados por IAU, derivados del KML oficial de centros cartográficos USGS (MDIM 2.1). Se filtran registros adoptados y se elimina un duplicado de Feature ID del archivo original. La procedencia, fecha y SHA-256 del KMZ se conservan en `public/data/gazetteer-source.json`.

Los centros dentro de la ventana local se dibujan como pins seleccionables en coordenadas reales. Los centros fuera de la ventana se encuentran desde la búsqueda; no se desplazan artificialmente al terreno visible. La búsqueda consulta todo el catálogo y limita a 30 resultados por consulta. Un centro representa una referencia de nomenclatura, no una posición de misión ni la geometría completa del accidente.

### Geología USGS · Tanaka et al. (2014)

En Capas, «Unidades y contactos · USGS» superpone los polígonos de SIM 3292 con colores del renderer oficial y opacidad ajustable. «Consultar un punto del terreno» devuelve la unidad, características e interpretación originales en inglés. Misión incorpora las unidades a lo largo de la ida y contactos cartográficos intersectados, aunque la superposición esté apagada. No altera A*, ni infiere seguridad o composición mineral confirmada.

Fuente: https://doi.org/10.3133/sim3292. Servicio público: `https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/Tanaka_et_al_2014_Mars_Global_Map_Features/FeatureServer`, capas 3 (unidades) y 1 (contactos). La paleta de 44 unidades se obtuvo del renderer de la capa 3 el 2026-11-14. Los recortes se consultan al entrar al explorador y muestran su fecha de recuperación; la publicación científica es de 2014.

Se solicita explícitamente `inSR` y `outSR` como GEOGCS Mars 2000 Sphere, radio 3,396,190 m. ArcGIS transforma su Robinson de Marte al sistema geográfico marciano; no se usa EPSG:4326 terrestre. Se divide la consulta en el antimeridiano, se deduplican OBJECTID y se rechaza una respuesta truncada o con proyección incompatible. Se solicita generalización de 0.0001°; no implica precisión de campo.

Las unidades de ruta se estiman en el punto medio de cada tramo del DEM. Tramos sin clasificación o con superposición/límite se informan aparte. La intersección con contactos cuenta entidades cartografiadas únicas, no eventos de cruce ni obstáculos. Escala fuente 1:20 millones: contexto regional, sin detección de rocas o grietas pequeñas. Si USGS falla, se muestra el error y la planificación con DEM sigue disponible.

### Navegación y continuidad

Cambiar de lugar dentro del explorador conserva `/explorar` y mantiene el mapa anterior utilizable mientras se carga el nuevo. No obliga a subir al planeta. La entrada animada desde el globo se completa sólo si su intención sigue activa, la ruta sigue siendo `/`, terminó el vuelo y la respuesta corresponde al sitio solicitado. Navegar explícitamente o cancelar invalida esa intención.

El descenso por proximidad requiere un nuevo gesto de acercamiento con la rueda; un vuelo de cámara o volver a Planeta no lo activa. Volver al mismo sitio reutiliza el mapa cargado y conserva la misión. Cambiar realmente de región reemplaza el mapa y reinicia sus puntos de ruta, porque pertenecen al DEM y a la cobertura anteriores.

Regresión de escritorio comprobada: cambiar del explorador a Jezero sin pasar por `/`; abrir la región con DEM desde Misión; interrumpir una carga entrando a Fuentes; volver de Fuentes con A, B y las dos alternativas conservadas; volver a Planeta sin descenso automático.

### Terreno 3D y vectores topográficos

Explorar usa ahora una malla de alturas, no un plano con sombreado. La malla, curvas de nivel, vistas derivadas y rutas comparten MOLA/HRSC v2 de USGS (Fergason et al., 2018). La escala vertical es 1:1 respecto a la escala horizontal local; sólo se resta una cota de origen para mantener la cámara cerca de cero. Las imágenes orbitales, incluidas CTX, Viking y THEMIS, se proyectan sobre esa misma geometría. El rover y los puntos se apoyan en la malla; la ruta se dibuja sobre el relieve.

La elevación se carga para el área actual desde el GeoTIFF global, conservando su cuadrícula nativa de 200 m nominales. En el área inicial se reutiliza el recorte con SHA-256 ya incluido. Otros sitios, como Jezero, solicitan únicamente rangos del archivo remoto, sin descargar sus 11 GB. Se validan esfera y coordenadas de Marte, PixelIsArea y NoData. Se incluye un halo para interpolación y se divide la lectura en el antimeridiano. Si la fuente no entrega rangos parciales íntegros o alturas utilizables, se informa del error y no se calculan rutas sobre alturas inventadas.

La fuente S3 permite CORS pero no expone Content-Range. El cliente comprueba HEAD Content-Length, exige HTTP 206 y valida el tamaño de cada rango antes de facilitar los metadatos de rango a GeoTIFF.js. El plazo y cancelación se propagan también a las lecturas de metadatos.

En Capas → Topografía real: vista cenital o inclinada, imagen orbital, elevación, pendiente y sombreado derivado. Elevación usa una escala local con cotas; pendiente usa grados (0–30° o más); el sombreado tiene iluminación cartográfica sintética, no luz solar actual. Curvas vectoriales con equidistancia de 25/50/100/250 m, interpoladas en los triángulos de la malla sin cruzar NoData. Los contactos geológicos y la retícula se recortan al área visible y se apoyan en el terreno. Los vectores describen datos, no carreteras marcianas ficticias.

A* sigue evitando NoData, cobertura ausente, saltos diagonales bloqueados y pendientes excesivas. El coste y distancia incluyen ahora longitud 3D de cada tramo (hipotenusa de distancia horizontal geodésica y cambio de altura). El límite de pendiente se calcula con cambio vertical sobre recorrido horizontal. La cuadrícula del área actual permite rutas fuera de la antigua región fija cuando la fuente responde y hay datos válidos.

Límites: 200 m es espaciado nominal, no garantía de detalle o precisión absoluta; el detalle efectivo es distinto en zonas MOLA/HRSC. CTX es un mosaico no controlado y puede desplazarse respecto al DEM. Las texturas infrarrojas son históricas y no se convierten a temperatura en vivo. No hay exageración del relieve ni detección de rocas pequeñas, suelo transitable o seguridad de una caminata real. El explorador mantiene ventanas locales de imágenes, no streaming global continuo.

Optimización del producto global: se verificó que el GeoTIFF oficial utiliza Int16 sin compresión y tiras de una fila del ancho completo del planeta. El lector usa sus offsets y tamaños originales para solicitar sólo las columnas del área por fila, con concurrencia acotada. Valida tipo, organización, endianidad y longitud; no cambia ni interpola los valores durante la descarga. Otras organizaciones pasan por el lector estándar GeoTIFF. Así se evita descargar decenas de MB de filas completas para una ventana de pocos cientos de píxeles.

Verificación adicional: 729 muestras del lector remoto optimizado coincidieron exactamente con el recorte regional con SHA-256. La cuadrícula enviada al worker contiene sólo coordenadas y arrays numéricos; las texturas y funciones de representación permanecen fuera del mensaje transferido.

El cálculo utiliza un worker y, si un navegador integrado demora su ejecución, recurre al mismo solver para áreas acotadas después de 2.5 s. Cambiar de mapa o parámetros invalida la generación de cálculo y cancela el trabajo anterior; una respuesta tardía no puede reemplazar una misión nueva.

### Marcadores y textura compartidos

Planeta y Explorar reutilizan el mismo componente de marcador: cápsula oscura, punto verde y nombre. Los puntos del explorador se superponen en sus coordenadas sobre el terreno, sin ficha secundaria ni línea vertical. El clic abre la ficha del lugar. Se retiró la tarjeta flotante de lugares fuera del área.

Un único estado de textura y catálogo gobierna ambas vistas y persiste en el navegador. Incluye CTX en el globo (mosaico global de menor resolución verificado contra tileInfo Esri) y CTX detallado en el explorador, junto con Viking, MOLA/HRSC y THEMIS. Cambiar desde cualquiera de las vistas conserva la selección al pasar a la otra. Las vistas derivadas del DEM permanecen como herramientas locales; seleccionar una textura orbital activa de nuevo Imagen orbital.

### Jezero: elevación estéreo y ortoimagen compatible

Dentro de la cobertura empaquetada (77.3–78.05° E, 18.05–18.8° N), se prioriza el DEM CTX estéreo de **20 m** de Mars 2020 Science Investigation, USGS/Calef (2021). El producto se ajustó verticalmente a MOLA; no se mezcla con el DEM global en una misma ventana. Si la ventana completa no cabe o falla la verificación, se usa el respaldo global MOLA/HRSC de 200 m. La interfaz indica fuente, resolución y fallo regional si corresponde.

`scripts/prepare_jezero.mjs` extrae píxeles nativos sin remuestrear, rellenar huecos ni suavizar. Valida la proyección equirectangular de Marte (radio 3396190 m, paralelo estándar 18.4663°), convierte su georreferencia lineal a coordenadas geográficas y guarda Float32 little endian comprimido sin pérdida. El manifiesto conserva el SHA-256 del TIFF original y del recorte. En el navegador se verifica el hash antes de usarlo y se recorta con halo a la ventana visible. A* conserva las muestras nativas y NoData.

Al elegir CTX dentro de esa cobertura, se utiliza la ortoimagen **del mismo conjunto científico**, no el mosaico CTX global no controlado. La imagen original es de ~5 m/píxel; el overview empaquetado tiene ~13.7 m/píxel y el lienzo local puede reducirlo más. La interfaz muestra la resolución efectiva de visualización. Su proyección se verifica por separado: los orígenes y tamaños de píxel de imagen y DEM difieren, y se transforman usando sus propios metadatos. Se preserva la selección CTX común entre globo y explorador. Fallos de imagen no bloquean el DEM ni la navegación.

La malla visible se limita a 512×512 celdas; las rutas usan la cuadrícula nativa independiente. Las curvas de nivel se derivan de esa malla visible, con curvas maestras y etiquetas cada cinco intervalos. El sombreado es sintético. La densidad de curvas no aumenta la resolución del producto. Los contactos USGS distinguen certeza, aproximación, inferencia, enterramiento y transición gradual, sin reinterpretarlos como barreras físicas.

Fuentes originales y límites: [DEM y ortoimagen Science Investigation](https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic). Resolución no equivale a precisión horizontal o vertical: este conjunto no permite certificar obstáculos pequeños ni seguridad de tránsito. No se presupone precisión HiRISE de 1 m fuera de productos y coberturas validados.

Reproducir: descargar los TIFF `source` de ambos manifiestos; ejecutar `node scripts/prepare_jezero.mjs <dem.tif>` y `node scripts/prepare_jezero_ortho.mjs <ortho.tif>` (este último requiere `sharp` disponible en Node). Los TIFF originales de 90/360 MB no se incluyen en Git.

### Explorador global y continuidad del zoom

Explorar mantiene un mapa orbital global equirectangular con la textura seleccionada; el recorte de mayor detalle y su DEM se superponen en la región cargada. Se puede alejar y desplazar el mapa completo, seleccionar cualquiera de los 2,054 lugares IAU/USGS desde el mapa o el buscador, y cargar el detalle de otra región al pulsar fuera del recorte. La cobertura faltante o limitada por latitud de una capa conserva su patrón de ausencia. El contexto global es una imagen orbital: el terreno 3D y los cálculos numéricos continúan limitados a la región con DEM cargado.

Todos los centros del catálogo se representan como puntos. Las etiquetas se seleccionan según el encuadre, con prioridad para sitios destacados y accidentes mayores, evitando colisiones; el catálogo completo sigue accesible por búsqueda. La repetición longitudinal del mapa evita cortes visuales en el antimeridiano. La geometría de contexto tiene un hueco en el recorte local para no tapar depresiones del DEM.

Se retiró el botón «Ocultar controles». Los controles de vista permiten encuadrar el mapa completo, volver al área con relieve y alternar cenital/3D. Esta alternancia rota la cámara alrededor del mismo centro y conserva su distancia durante toda la transición. Llegadas tardías del DEM ajustan la altura final sin cancelar el desplazamiento en curso. Cambiar la textura no altera la cámara. Al volver de Planeta se recupera el encuadre de exploración anterior si sigue siendo la misma región. Cambiar de región transforma las coordenadas de cámara al nuevo marco antes de acercarse; el zoom y desplazamiento no se bloquean en los bordes del recorte local.

Validación: pruebas de ida/vuelta geográfica en el antimeridiano, cobertura global, exclusión del recorte en la malla de contexto, distribución de etiquetas, conservación de distancia/centro entre modos y conservación de escala al cambiar de cuadrícula. El canvas expone `data-view`, `data-camera-distance`, `data-center-lon`, `data-center-lat` y `data-transitioning` para contrastar el estado renderizado durante QA sin depender de posiciones de píxel.

QA en navegador: cenital ↔ 3D conservó la distancia 15.16575 y el mismo centro (-20.148925°, -57.705687°). Zoom in/out equivalente recuperó esa distancia. Tras desplazar el mapa, Planeta → Explorar recuperó centro y escala, con sólo el residuo del amortiguamiento de OrbitControls (<0.2 m en la comprobación). Desde el mapa global se abrió la ficha de Jezero y se cargó el detalle CTX/DEM de 20 m en sus coordenadas oficiales. La interpolación de acercamientos largos usa distancia logarítmica y orientación esférica para conservar continuidad visual y simetría entre acercar y alejar.

### Tipos de lugares y rendimiento

El catálogo se agrupa en 11 categorías: volcanes, cráteres/cadenas, montañas/colinas, valles/canales, cañones, planicies/mesetas, dunas, escarpes/crestas, depresiones, terrenos fracturados y regiones/otras formas. El descriptor IAU original se conserva. Los iconos Lucide se comparten entre Planeta, Explorar, resultados y ficha; el filtro de categoría se sincroniza entre mapa y buscador. Lucide 0.468 no incluye un icono `Volcano`: la señal de volcán combina `Mountain` y `Flame` de Lucide, sin una dependencia adicional.

La clasificación de origen volcánico se limita a ocho sitios documentados (Olympus, Arsia, Pavonis, Ascraeus, Alba, Elysium, Hecates y Albor). No se convierten todos los Mons/Tholus/Patera en volcanes. Fuentes: [descriptores IAU/USGS](https://planetarynames.wr.usgs.gov/DescriptorTerms), [Tharsis y topografía NASA](https://science.nasa.gov/photojournal/maps-of-mars-global-topography/), [Elysium NASA](https://science.nasa.gov/resource/elysium/). Las fichas enlazan la fuente de la categoría.

Se encontraron y corrigieron cargas evitables: consultas geológicas con la capa oculta, metadatos CTX repetidos en cada intento de nivel, preparación de la cuadrícula A* antes de abrir Misión, y actualizaciones globales de React emitidas por el rover inmóvil cada 200 ms. El cálculo de posiciones de marcadores mantiene referencias estables. Las curvas de nivel conservan la interpolación original eliminando asignaciones de arrays por triángulo.

Jezero, dentro del recorte científico compatible, construye el mapa directamente desde la ortoimagen georreferenciada verificada: ya no espera a las nueve teselas CTX remotas ni a sus intentos de nivel. La vista conserva sus metadatos y resolución efectiva; usa una ventana de 0.5° centrada en el punto. El DEM nativo y su integridad SHA-256 no cambian. La textura de base se comparte con la capa local sin duplicar la textura ni transferir su propiedad de liberación.

Se añadió caché acotada de 80 respuestas públicas completas, en memoria y Cache Storage cuando está disponible, con vencimiento de 24 h. Incluye metadatos/teselas y assets científicos con clave SHA-256. Errores HTTP y respuestas parciales 206 no se guardan; las imágenes inválidas o assets que fallen el hash se eliminan. Fallos de cuota no bloquean el mapa. Un intento de nivel CTX fallido cancela sus solicitudes restantes antes de probar otro.

La interfaz se separó de la escena y del motor Three.js. En la compilación de esta revisión, el JavaScript de entrada pasó de ~435 KB gzip a ~176 KB gzip (~60% menos); el motor y la escena se descargan en chunks separados. Esto reduce el coste anterior a la primera interfaz; no significa una reducción del 60% en el tiempo total ni elimina la latencia externa de NASA/USGS o el coste del DEM de alta resolución. La primera visita aún descarga los productos necesarios; las visitas siguientes pueden reutilizar la caché.

QA de esta revisión: 60 pruebas aprobadas y compilación correcta. En el navegador se verificaron el selector de categoría y los iconos en lista y mapa; Jezero llegó al estado de relieve listo en 2.643 s en una prueba con runtime y recursos disponibles (no es un benchmark de primera visita). Se calcularon alternativas de 3.43 km sobre el DEM de 20 m después de posponer la creación de la cuadrícula de rutas hasta abrir Misión. Los datos y algoritmos científicos no se sustituyeron por estimaciones visuales.

### Rover con suspensión y planificación directa

El rover pasa de escala visual 0.25 a 0.32 (+28%). La escala sigue siendo simbólica. La altura bajo cada una de las cuatro ruedas se obtiene de `heightAt` de la misma malla DEM visible, transformando la huella según el rumbo. La carrocería ajusta cabeceo, balanceo y altura con resortes amortiguados; cada rueda conserva su contacto independiente con el terreno. La antena tiene una flexión leve debida al movimiento de la carrocería. No se añade ruido de terreno, baches ficticios ni precisión subpíxel: irregularidades menores que el DEM no están resueltas.

Las ruedas giran según la distancia recorrida y su radio visual. El avance consume el presupuesto de desplazamiento completo aunque un frame atraviese varios tramos pequeños de la ruta; no se ralentiza artificialmente en cada celda. Si falta cobertura o apoyo medido para una rueda, la simulación se detiene. Al pausar y reanudar se conserva el progreso; reiniciar después de la llegada o después de una desviación manual vuelve a A.

El extremo de la antena usa material emisivo y un halo verde que pulsa a ~1.35 Hz sólo durante desplazamiento real. Al detenerse se atenúa. Con movimiento reducido se mantiene una señal estable durante el avance. La intensidad, cabeceo, balanceo, escala y estado de movimiento se exponen en atributos `data-rover-*` del canvas para QA.

Flujo rápido: «Elegir destino» fija A en la posición actual, muestra «Elegir punto B» junto al cursor y permite seleccionar B con un clic. Una tarjeta anclada al clic ofrece «Ir», «Cambiar B» y cancelar. «Ir» calcula la ruta con el DEM y comienza su vista previa sin abrir el panel. «Cambiar inicio» permite elegir A y pasa automáticamente a B. La configuración avanzada y la parada científica C siguen en Misión. Pausa, reanudación y detalles quedan en un control compacto sobre el mapa. Escape, cancelar o la conducción manual invalidan el cálculo pendiente para que ninguna respuesta tardía reinicie el movimiento.

La selección sobre el contexto global fuera del DEM no navega a otra región ni borra A: se informa que el punto no tiene datos utilizables. Se preservan las validaciones numéricas A* y NoData. Los puntos se ajustan a centros de celda; la animación no certifica transitabilidad física de un vehículo real.

QA de esta entrega: 66 pruebas aprobadas y compilación correcta. Se verificaron en navegador A automático → B → Ir, A manual → B automático, indicación junto al cursor, Escape, inicio del recorrido, pausa/reanudación y llegada. Una ruta de 4.45 km se reanudó desde ~20.1289° S, 57.6925° O sin regresar a A. Se observaron cambios de cabeceo/balanceo al avanzar y una señal de antena que pasó por intensidad 1.000 durante movimiento y 0.000 al detenerse. Los controles de simulación permanecen visibles sin abrir el panel lateral.

### Navegación directa y sitios de aterrizaje

En Explorar, seleccionar una etiqueta geográfica o un resultado del buscador dirige directamente a esa zona, sin abrir una ficha intermedia. Seleccionar de nuevo el sitio activo recupera su encuadre local. El cambio cancela cualquier planificación pendiente.

Planeta muestra exclusivamente diez sitios históricos de aterrizaje: Viking 1/2, Pathfinder, Spirit, Opportunity, Phoenix, Curiosity, InSight, Perseverance y Zhurong. Las coordenadas y referencias individuales están en `src/data/landingSites.js`; se distinguen de centros de cráteres, posiciones actuales y propuestas futuras. Sus fuentes incluyen NASA/NTRS, PDS Geosciences y las publicaciones de localización de Perseverance, InSight y Zhurong. El filtro de accidentes geográficos de Explorar no oculta estos sitios en Planeta.

El rover se renderiza en una capa transparente con la misma cámara, por encima de las etiquetas del mapa (`z-index: 5`) y sin interceptar eventos del puntero. Conserva suspensión, iluminación y fundido entre vistas; los controles de interfaz mantienen su prioridad. Las ventanas compatibles con la ortoimagen de Jezero pueden reducirse a 0.25° cerca del borde, permitiendo utilizar el DEM de 20 m en el aterrizaje real de Perseverance.

QA: 69 pruebas aprobadas y compilación correcta. Se verificaron en navegador los diez marcadores de Planeta, el viaje desde Perseverance al DEM de 20 m y el clic directo en Belva en Explorar. En Belva se confirmó visualmente que el rover aparece encima de su etiqueta y que la capa tiene `pointer-events: none`.

### Tablero analógico del rover

Explorar integra cuatro instrumentos de aguja con edición numérica, deslizador y pasos: velocidad (0.5–5 km/h), tiempo disponible (30–720 min), reserva (0–80%) y trabajo científico (0–180 min). Se trasladaron estos parámetros desde Misión al tablero; el objetivo científico y los puntos A/B/C permanecen en la planificación avanzada. Un control adicional limita la pendiente del modelo (3–30°). El tablero muestra velocidad actual, inclinación derivada del terreno, distancia recorrida y margen del escenario, y puede minimizarse.

La velocidad controla el desplazamiento del rover, convertido según los kilómetros del mapa. La reproducción usa aceleración temporal explícita ×120; el presupuesto se consume en minutos simulados, no en segundos de reloj. El avance sobre la ruta se ajusta a la inclinación del segmento del DEM; la distancia acumulada incluye su componente vertical. El trabajo científico es tiempo reservado en el presupuesto; no anima una actividad científica ni una espera en C. La simulación sigue siendo una vista previa de ida; el regreso se calcula para el presupuesto.

Cambiar cualquiera de los parámetros o la pendiente pausa inmediatamente el recorrido y cancela el cálculo anterior. Tras 350 ms sin nuevos cambios se recalculan las alternativas A* desde la posición actual. Se conserva la base original para calcular el regreso y el tiempo ya consumido a las velocidades anteriores. Una parada C ya atravesada no vuelve a insertarse. El nuevo trayecto comienza en la posición continua del rover y conecta con la celda del DEM, evitando volver al A inicial. El terreno y sus huecos de datos siguen restringiendo el cálculo.

Se prefiere la alternativa de menor coste por pendiente si cabe en el presupuesto; de lo contrario se usa la de menor distancia cuando es viable. Si ninguna cabe, el vehículo permanece detenido con el motivo visible. Una misión que estaba en marcha continúa automáticamente tras un recálculo viable; una que estaba pausada necesita Continuar. Cancelar, Escape, conducción manual o navegar a otra región invalidan respuestas tardías. La velocidad no garantiza una ruta geométricamente distinta: afecta tiempos y movimiento, mientras que pendiente y viabilidad pueden cambiar la alternativa.

QA del tablero: 75 pruebas aprobadas y compilación correcta. Las pruebas nuevas contrastan conversión de velocidad/escala, tiempo simulado, validación de parámetros, tiempo consumido, distancia restante sin doble conteo, selección por presupuesto y conservación del destino de regreso. En navegador se verificaron selección B → Ir, velocidad 2 → 3/4 km/h con recálculo y continuación, ajustes consecutivos de velocidad/reserva, cambio de trabajo científico en pausa, detención por presupuesto de 30 min, recuperación del presupuesto sin arranque automático, Continuar y minimizar/abrir el tablero. El rover mantuvo el avance acumulado y la base A permaneció en su ubicación inicial.

### Tablero retro compacto

La consola principal se reduce a 400 px de ancho y ~200 px de alto, con carcasa trapezoidal de esquinas redondeadas basada en el boceto. Un velocímetro de aguja muestra la velocidad actual; el ajuste numérico y los botones −/+ bajo la esfera fijan el ritmo. Tiempo disponible, reserva, trabajo científico y pendiente máxima quedan siempre visibles en una fila compacta de inputs. Las ventanillas muestran tiempo de viaje y distancia recorrida, junto al estado, margen y pausa/continuación. Se eliminó el menú de ajustes. Conserva la cancelación y el recálculo desde el rover, y la aceleración ×120 visible.

QA visual: inicio desde Destino, cambios de ritmo 2 → 3 km/h, trabajo científico en marcha con recálculo, llegada, reinicio, pausa y minimizar/abrir la consola. Se verificaron los cuatro parámetros secundarios y la aguja enlazada al movimiento real de la simulación. No se modificaron el DEM ni el algoritmo A*.

QA de la fila visible: edición directa de los cuatro inputs, velocidad 2 → 3 km/h durante el viaje, pausa por presupuesto de 30 min y reanudación después de devolverlo a 240 min.

### Antena luminosa y flexible

Durante desplazamiento real, la antena mantiene un nivel luminoso de base y un pulso de hasta 12.18 de emisión (antes el máximo era 4.18). El halo aumenta hasta 1.15 unidades locales y una luz puntual suave ilumina el propio rover. Al detenerse, luz y halo se atenúan hasta apagarse, conservando sólo la emisión tenue de reposo.

El mástil se divide en dos tramos y flexiona con resortes amortiguados a partir de las velocidades de cabeceo/balanceo de la suspensión y su aceleración vertical. No usa oscilación aleatoria ni un bucle de balanceo en reposo; el terreno visible sigue determinando el apoyo de las ruedas. Con movimiento reducido se suaviza la flexión y se usa luz constante durante el avance. La respuesta es visual y simbólica, limitada por la resolución del DEM.

QA: pruebas de reposo sobre suelo plano, respuesta a pendientes/baches, amortiguación, límites de flexión, movimiento reducido y luz en marcha/reposo. En navegador se observaron emisiones de 11.285 y 12.179 durante el avance, cambios de flexión asociados al relieve y emisión 0.180 sin halo al pausar.

### Paneles independientes y navegación con rebote

Búsqueda, catálogo, categorías y visibilidad de puntos viven en el panel izquierdo. Planeta usa el catálogo de diez aterrizajes históricos; Explorar usa los 2,054 lugares IAU/USGS. Elegir un resultado navega directamente al sitio. Cada vista reinicia el texto de búsqueda para no aplicar el nombre de un accidente geográfico al catálogo de misiones.

La barra vertical derecha abre Capas, Misión, Rover y Datos en un panel independiente: extensión del mapa, cenital/3D, modos del DEM, curvas, geología, texturas y retícula. Ambos paneles se pueden abrir/cerrar por separado. La malla/cámara no cambian de tamaño al abrirlos. En ventanas estrechas de escritorio se reserva espacio inferior para el tablero y la conducción.

El indicador activo del header adapta `SlidingPill` de WaterWiki: desplazamiento de 650 ms, sobrepaso del 12% y retorno del 3% antes de asentarse. Cambios rápidos parten de la posición animada actual; movimiento reducido desactiva el rebote. Se conservan enlaces, navegación por teclado y enlace activo con `aria-current`. La barra vertical permite foco con flechas, Inicio y Fin sin conducir el rover.

El tablero sólo se comprimió verticalmente (~181 px de alto en QA, 400 px de ancho), conservando posición, velocímetro, ritmo, tiempo de viaje, distancia, margen, estado, los cuatro ajustes de misión, controles de viaje, inclinación y factor temporal. Los paneles no lo ocultan.

QA de esta organización: 78 pruebas aprobadas. En navegador se verificaron ambos paneles simultáneos e independientes, búsqueda de Belva y navegación directa conservando el panel derecho, el catálogo de diez aterrizajes en Planeta, cambio cenital/3D desde Capas y cambio Misión ↔ Capas. El indicador del header se observó en una posición intermedia durante su desplazamiento. El tablero midió 400 × 180.5 px y conservó sus cinco inputs. El movimiento del rover basado en el relieve y la antena flexible se mantienen.

### Etiquetas que respetan el espacio del rover

Las etiquetas de lugares y los indicadores A/B/C comparten un registro de posiciones en pantalla. Se proyecta el volumen visible del rover con la misma cámara; al coincidir una etiqueta, se recoloca preferentemente a derecha o izquierda, manteniéndose dentro del viewport y evitando otras etiquetas. Si no cabe lateralmente, puede usar una posición superior/inferior; sólo se oculta temporalmente el texto si no existe espacio fuera del rover. El punto del mapa y el catálogo permanecen disponibles.

Una línea fina conserva el enlace con el ancla geográfica original. El desplazamiento tiene transición corta y una zona de retención para evitar parpadeos cerca del límite; la etiqueta vuelve a su posición original cuando el rover se aleja. No cambian coordenadas, rutas, DEM ni el z-index: rover 5 y etiquetas 1–4. La recolocación trabaja por lotes ~13 veces por segundo, sin actualizaciones de estado global de React en cada frame, y respeta movimiento reducido.

QA: pruebas numéricas de separación, bordes del viewport, otras etiquetas/indicadores, retorno y espacio insuficiente. En navegador, Belva se desplazó lateralmente 66.7 px en 3D y ~62.9 px en cenital, siguió siendo clicable y no intersectó el volumen proyectado del rover. Las cuatro etiquetas visibles de la comprobación final tuvieron intersección cero y la capa del rover conservó z-index 5.

### Detalle real HiRISE y calidad de la geometría

Capas → «Explorar detalle HiRISE» carga un área de aproximadamente 450 × 475 m alrededor del aterrizaje de Perseverance. Usa el DEM de 1 m y la ortoimagen del producto USGS Mars 2020 TRN (Fergason et al., 2020, https://doi.org/10.5066/P9REJ9JN). La imagen fuente de 25 cm/píxel se entrega a 50 cm/píxel mediante promedio de área; el DEM conserva sus muestras y alturas originales. Ambos recortes comparten proyección y límites, con SHA-256 y ventana de origen en sus JSON. La separación de píxeles no es una garantía de exactitud vertical.

Los archivos se descargan bajo demanda al abrir ese detalle; no se atribuye esta resolución al resto del planeta. «Volver al contexto CTX» recupera el área regional y su intervalo de curvas anterior. Jezero conserva el DEM CTX de 20 m; el contexto global usa MOLA/HRSC de 200 m. El detalle HiRISE emplea simulación ×12; el contexto mantiene ×120, ambos indicados en el tablero. Las rutas siguen calculándose en tiempo físico a partir del ritmo indicado.

La malla visible se adapta al zoom con histéresis (máximo 512 segmentos por eje). Esto cambia sólo la geometría dibujada: el cálculo de rutas mantiene las muestras numéricas de origen. Las celdas sin datos no se rellenan; tampoco se dibujan triángulos gruesos que crucen huecos internos. El horizonte usa un fundido cartográfico, no un modelo de atmósfera. Las curvas se derivan del relieve visible, sin inventar detalle entre muestras.

La capa USGS SIM 3292 incorpora también estructuras lineales con sus atributos originales de morfología, interpretación y preservación. Se muestran como contexto regional (escala 1:20 millones); no se convierten en obstáculos ni costes de ingeniería sin evidencia local. Una región puede no contener estructuras de esa cartografía. Si ese servicio falla, se conservan unidades/contactos y se indica la disponibilidad parcial.

Los NPZ compartidos estaban marcados `synthetic=True`: no se incorporaron como elevación observada. No se utilizan IA ni superficies generadas para rellenar terreno. `scripts/prepare_hirise.mjs` reproduce los recortes por rangos HTTP con validación de ventana/proyección y conservación de NoData. Requiere `geotiff` y `sharp` en el entorno de preparación, sin añadir dependencias al navegador.

### Buscador integrado y contexto de radiación

`PlaceSearch` adapta el patrón de `EventoSearchBar` de `josuerdz01/asignacion-codigos` (campo y previsualización unidos, lupa móvil, grupos y selección por flechas/Enter). Las categorías forman parte de las sugerencias y quedan como un filtro removible dentro del buscador; no hay un select separado. Cinco coincidencias anticipan nombre, tipo y coordenadas; «Ver resultados» aplica la búsqueda sin navegar. Escape/clic fuera cierra la previsualización; seleccionar un lugar conserva la navegación directa existente. En Planeta se muestran sólo aterrizajes y no tipos geológicos.

La nueva capa opcional de torio usa la tabla oficial no suavizada TH_5X5 v2.0 de Odyssey GRS (2002-06-04 a 2005-04-03), con 2592 celdas de 5 × 5 grados. `scripts/prepare_thorium.py` descarga tabla/etiqueta, valida estructura y unidades, convierte porcentaje en masa a ppm (×10000), conserva estimaciones negativas de sustracción de fondo y transforma NoData a null. No se ejecutó el script adjunto; se revisaron sus supuestos contra la etiqueta PDS. Las incertidumbres sigma y sigma con factores de corrección se conservan por separado. Una celda negativa es una estimación estadística, no una concentración física negativa. La visualización utiliza celdas sin interpolar; no implica resolución local de peligros. Referencia: https://pds-geosciences.wustl.edu/missions/odyssey/grs_elements.html .

«Excluir torio sobre mi límite» es una preferencia de misión opcional. A* bloquea celdas del DEM cuyo bin GRS supera el umbral y celdas GRS sin datos, conservando la máscara y elevaciones originales; sigue comprobando pendiente y esquinas diagonales. Se aplica a ida, parada científica y retorno. Cambiar la preferencia durante un viaje detiene y recalcula desde la posición actual sin devolver tiempo ya consumido. Si A, B o la base quedan bloqueados, se informa sin inventar un camino. Un área local contenida en un solo bin GRS no ofrece alternativas entre zonas: todas comparten la misma concentración regional. El símbolo de radiación indica concentración sobre el límite elegido, no una clasificación sanitaria.

El tablero incluye **dosis electrónica simulada** en krad(Si), con presupuesto inicial de 50 krad(Si) basado en una computadora RAD750 completa, no una tolerancia certificada del robot. La tasa inicial de 1 rad(Si)/día es una hipótesis de prueba sin calibración; no procede del mapa de torio ni se convierte desde el modelo histórico en mSv. Se integra sólo tiempo físico de avance, conservando la dosis al pausar, recalcular, cambiar de ruta o región. Cambiar la tasa afecta incrementos futuros. Alcanzar o superar el presupuesto abre un aviso sobre posibles errores/degradación y hace pulsar en amarillo el símbolo del indicador; no implica un fallo real ni pausa automáticamente. El aviso puede cerrarse y reabrirse desde el indicador; el símbolo de alerta también queda en la cabecera minimizada. Con movimiento reducido el amarillo es fijo. Se reinicia sólo al recargar la sesión de simulación. Referencia de hardware: https://www.baesystems.com/en-us/dam/jcr%3Ae2c04c2e-8dea-425c-8460-96a509a95111/16-f76-RAD750-3U-CompactPCI-datasheet-2025-web.2025-06-25-21-58-21.pdf .

### Lectura del relieve y tablero de vidrio

La imagen orbital local usa un material rugoso iluminado por una luz lateral fija y luz ambiente contenida, en lugar de un material sin iluminación. Las normales provienen exclusivamente de la geometría del DEM; no se añaden baches, ruido ni alturas ficticias. La escala permanece 1:1 y las rutas conservan las elevaciones nativas. Elevación, pendiente y sombreado cuantitativos mantienen su material sin iluminación adicional para conservar sus colores. La iluminación es cartográfica, no una predicción del Sol actual. Con DEM de 200 m no pueden aparecer obstáculos de tamaño inferior a la fuente; para detalle local usar HiRISE donde existe cobertura.

La carcasa retro del tablero mantiene tamaño y controles, con relleno translúcido, desenfoque del mapa detrás de la silueta, brillo de borde y campos de mayor transparencia. No se usa desenfoque sobre textos o agujas.
