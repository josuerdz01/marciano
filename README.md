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

Prototipo visual: mapa a viewport completo con controles flotantes, globo con textura, control orbital, vista sin distracciones, tema persistido por navegador, recorrido guiado, rover modelado con primitivas y paseo ilustrativo. La entrada de unos ocho segundos recorre una galaxia de partículas, sistema solar y acercamiento a Marte; puede omitirse y repetirse. Las posiciones y escalas son ilustrativas, no efemérides. La entrada automática respeta movimiento reducido.

Incluye elevación numérica real y rutas A* en la región integrada. No incorpora datos meteorológicos, alertas de radiación ni navegación física. La vista CTX local sí calcula coordenadas geográficas aproximadas del personaje. La retícula es una referencia gráfica sin etiquetas geográficas. El paseo no evita obstáculos físicos. La imagen local CTX es real, pero el plano no es un modelo de elevación.

Textura: [Solar System Scope](https://www.solarsystemscope.com/textures/), CC BY 4.0, descargada como `public/textures/mars.jpg`. No sirve como DEM. La paleta de la interfaz no modifica el color natural de la textura.

Ver [propuesta y fuentes](docs/PRODUCTO.md).

## Mapas reales de NASA Mars Trek

El selector carga cinco productos WMTS desde `trek.nasa.gov`: Viking color, MOLA/HRSC color y sombreado, THEMIS IR día y noche. Los identificadores, procedencia y cobertura están centralizados en `src/data/marsLayers.js`. El adaptador lee `WMTSCapabilities.xml` para obtener el estilo, plantilla y matriz, verifica la cuadrícula equirectangular y compone la matriz 2 (2048 × 1024 px). Las teselas se solicitan directamente por CORS, con seis solicitudes concurrentes, cancelación al cambiar de capa y tiempos límite. La fuente es real, pero esta vista global está reducida respecto de la resolución nativa del producto; **no implementa aún detalle adaptativo por zoom**.

La capa anterior permanece visible mientras carga la siguiente y su atribución continúa al pie. Un error ofrece reintento; no sustituye datos por texturas ficticias. Las teselas 404 y la región fuera de cobertura se muestran con rayado. THEMIS cubre aproximadamente ±65° y sus mosaicos v2 son de octubre de 2018: no son clima en vivo ni un termómetro en °C. MOLA/HRSC es cartografía sombreada, sin desplazamiento geométrico ni consulta numérica de elevación. El material del mapa no añade iluminación artificial a los colores del producto.

La escena del rover sigue siendo ilustrativa y está separada del selector científico. La introducción conserva su textura ilustrativa local; al terminar se muestra la capa NASA activa.

## Vista local y rover

El zoom orbital activa el descenso cuando la cámara se acerca al globo. La región se obtiene de la intersección del centro de la cámara con la esfera; el botón de exploración usa el sitio inicial del enlace de Mars Trek (57.7056874 O, 20.1489254 S). El panel permite cambiar a Jezero.

La vista local carga una ventana de 3 × 3 teselas CTX del servicio Esri indicado en las capacidades NASA. Lee además `tileInfo` del servicio para respetar sus teselas de 512 px, origen, datum marciano y resolución. No presupone que las dimensiones anunciadas por WMTS coincidan con las imágenes del distribuidor. Si una imagen resulta incompleta, intenta niveles 10 y 9, informa de la reducción de detalle y calcula de nuevo extensión y resolución. No hay terreno ficticio como sustitución.

El rover usa coordenadas locales sobre un plano georreferenciado, puede moverse con WASD, flechas o controles táctiles y se limita a la ventana y cobertura cargadas. Tiene escala y velocidad simbólicas. El movimiento no evita cráteres ni valida seguridad; el DEM numérico sólo se usa para el cálculo regional; la geometría visible sigue plana. No existe aún carga infinita al desplazar la cámara. El panel ocupa todo el alto y separa Mapa, Ruta, Rover y Datos.

Ver [requisitos y fuentes para calcular rutas](docs/RUTAS-Y-FUENTES.md). CRISM se ha registrado como fuente de mineralogía candidata; sus datos espectrales todavía no se renderizan.

Verificación geométrica: `node --test`.

## Rutas A–B con datos reales

La pestaña **Ruta** permite elegir A/B sobre la región del enlace actual (-57.7057°, -20.1489°), calcular alternativas de distancia y pendiente, consultar métricas/perfil y animar el rover hasta B. Usa elevación numérica USGS MOLA/HRSC v2 de cuadrícula nominal 200 m, distribuida como recorte con atribución y hash; no usa colores de una textura para inferir alturas. El cálculo está limitado al recorte y cobertura local disponible y no valida peligros pequeños.

[Implementación, APIs y tecnologías](docs/IMPLEMENTACION-RUTAS.md) · [Atribución del DEM](public/data/ATTRIBUTION.md).

## Lugares oficiales y capas locales

Planeta muestra Olympus Mons, Valles Marineris, Jezero, Gale y Hellas Planitia, con nombres y centros cartográficos del Gazetteer IAU/USGS (red MDIM 2.1, latitud planetocéntrica y longitud este normalizada). Cada lugar enlaza su ficha. Son centros de accidentes geográficos, no coordenadas de aterrizaje de misiones. Los marcadores del hemisferio oculto se esconden y todos los lugares están disponibles en Mapa → Lugares conocidos. Se pueden ocultar desde el panel.

Al seleccionar un punto, la cámara orbita hacia él y se acerca; al terminar el vuelo y la carga CTX abre la vista local. Respeta movimiento reducido. La lista oficial se concentra en `src/data/landmarks.js` y su correspondencia con las UV de la esfera tiene pruebas geométricas.

Explorar sigue siendo una ventana local, no un mapa infinito de todo Marte. Ahora permite alternar CTX, Viking, relieve MOLA/HRSC en color/grises y THEMIS día/noche: recorta teselas WMTS a la misma extensión local y muestra su fuente y resolución. Los datos de pendiente/rutas y la máscara de cobertura CTX no cambian al cambiar la textura. El recorte numérico para A–B sigue limitado a la región integrada; visitar un lugar oficial no implica que ya tenga DEM de rutas disponible.

### Exploración de escritorio y lugares

La vista cenital mantiene el mapa a viewport completo. El panel se superpone con vidrio verde (desenfoque, saturación, reflejo interior y sombra adaptados del material de Sobre). La búsqueda reúne cinco centros cartográficos oficiales IAU/USGS; las fichas muestran coordenadas, procedencia, distancia a Jezero y disponibilidad del DEM integrado. Los mismos puntos se proyectan sobre el explorador únicamente cuando están dentro de la ventana cargada y tienen imagen. Seleccionar una etiqueta abre su ficha; no cambia la ruta ni representa la posición de una misión.

La introducción, el planeta y el mapa comparten un único Canvas. El recorrido inicial usa una curva continua de cámara y objetivo, y el cambio al mapa interpola cámara y opacidad sin una cortina opaca. Se respeta movimiento reducido. Las pruebas de movimiento verifican continuidad y coincidencia de encuadres finales; la comprobación visual principal se realizó en escritorio a 1440 × 900.

La cobertura del explorador sigue siendo una ventana local de 3 × 3 teselas; no es todavía un mapa global con carga continua. Los cinco lugares están disponibles desde búsqueda aunque queden fuera de esa ventana.
