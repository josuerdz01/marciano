# marciano

Atlas exploratorio de Marte. React, React Router, Three.js / React Three Fiber, Lucide y Morphicons.

## Desarrollo

Node.js 22.12+ y pnpm 11.

```sh
pnpm install
pnpm dev
pnpm build
```

Rutas: `/` planeta, `/explorar` maqueta del rover, `/fuentes` bibliografía inicial. Para hosting estático, configurar fallback de rutas a `index.html`.

## Estado de esta versión

Prototipo visual: mapa a viewport completo con controles flotantes, globo con textura, control orbital, vista sin distracciones, tema persistido por navegador, recorrido guiado, rover modelado con primitivas y paseo ilustrativo. La entrada de unos ocho segundos recorre una galaxia de partículas, sistema solar y acercamiento a Marte; puede omitirse y repetirse. Las posiciones y escalas son ilustrativas, no efemérides. La entrada automática respeta movimiento reducido.

No incorpora elevación numérica real, datos meteorológicos, rutas A*, alertas de radiación ni navegación física. La vista CTX local sí calcula coordenadas geográficas aproximadas del personaje. La retícula es una referencia gráfica sin etiquetas geográficas. El paseo no evita obstáculos físicos. La imagen local CTX es real, pero el plano no es un modelo de elevación.

Textura: [Solar System Scope](https://www.solarsystemscope.com/textures/), CC BY 4.0, descargada como `public/textures/mars.jpg`. No sirve como DEM. La paleta de la interfaz no modifica el color natural de la textura.

Ver [propuesta y fuentes](docs/PRODUCTO.md).

## Mapas reales de NASA Mars Trek

El selector carga cinco productos WMTS desde `trek.nasa.gov`: Viking color, MOLA/HRSC color y sombreado, THEMIS IR día y noche. Los identificadores, procedencia y cobertura están centralizados en `src/data/marsLayers.js`. El adaptador lee `WMTSCapabilities.xml` para obtener el estilo, plantilla y matriz, verifica la cuadrícula equirectangular y compone la matriz 2 (2048 × 1024 px). Las teselas se solicitan directamente por CORS, con seis solicitudes concurrentes, cancelación al cambiar de capa y tiempos límite. La fuente es real, pero esta vista global está reducida respecto de la resolución nativa del producto; **no implementa aún detalle adaptativo por zoom**.

La capa anterior permanece visible mientras carga la siguiente y su atribución continúa al pie. Un error ofrece reintento; no sustituye datos por texturas ficticias. Las teselas 404 y la región fuera de cobertura se muestran con rayado. THEMIS cubre aproximadamente ±65° y sus mosaicos v2 son de octubre de 2018: no son clima en vivo ni un termómetro en °C. MOLA/HRSC es cartografía sombreada, sin desplazamiento geométrico ni consulta numérica de elevación. El material del mapa no añade iluminación artificial a los colores del producto.

La escena del rover sigue siendo ilustrativa y está separada del selector científico. La introducción conserva su textura ilustrativa local; al terminar se muestra la capa NASA activa.

## Vista local y rover

El zoom orbital activa el descenso cuando la cámara se acerca al globo. La región se obtiene de la intersección del centro de la cámara con la esfera; el botón de exploración usa el sitio inicial del enlace de Mars Trek (44.3847648 E, 35.9912103 S). El panel permite cambiar a Jezero.

La vista local carga una ventana de 3 × 3 teselas CTX del servicio Esri indicado en las capacidades NASA. Lee además `tileInfo` del servicio para respetar sus teselas de 512 px, origen, datum marciano y resolución. No presupone que las dimensiones anunciadas por WMTS coincidan con las imágenes del distribuidor. Si una imagen resulta incompleta, intenta niveles 10 y 9, informa de la reducción de detalle y calcula de nuevo extensión y resolución. No hay terreno ficticio como sustitución.

El rover usa coordenadas locales sobre un plano georreferenciado, puede moverse con WASD, flechas o controles táctiles y se limita a la ventana y cobertura cargadas. Tiene escala y velocidad simbólicas. El movimiento no evita cráteres ni valida seguridad; no se ha integrado un DEM. No existe aún carga infinita al desplazar la cámara. El panel ocupa todo el alto y separa Mapa, Exploración y Datos.

Ver [requisitos y fuentes para calcular rutas](docs/RUTAS-Y-FUENTES.md). CRISM se ha registrado como fuente de mineralogía candidata; sus datos espectrales todavía no se renderizan.

Verificación geométrica: `node --test`.
