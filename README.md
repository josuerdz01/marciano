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
