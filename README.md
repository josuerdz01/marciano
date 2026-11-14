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

No incorpora elevación real, localización geográfica del rover, datos meteorológicos, rutas A*, alertas de radiación ni navegación física. La retícula es una referencia gráfica sin etiquetas geográficas. El paseo no evita obstáculos. No interpretar el terreno como un mapa científico de Jezero.

Textura: [Solar System Scope](https://www.solarsystemscope.com/textures/), CC BY 4.0, descargada como `public/textures/mars.jpg`. No sirve como DEM. La paleta de la interfaz no modifica el color natural de la textura.

Ver [propuesta y fuentes](docs/PRODUCTO.md).

## Mapas reales de NASA Mars Trek

El selector carga cinco productos WMTS desde `trek.nasa.gov`: Viking color, MOLA/HRSC color y sombreado, THEMIS IR día y noche. Los identificadores, procedencia y cobertura están centralizados en `src/data/marsLayers.js`. El adaptador lee `WMTSCapabilities.xml` para obtener el estilo, plantilla y matriz, verifica la cuadrícula equirectangular y compone la matriz 2 (2048 × 1024 px). Las teselas se solicitan directamente por CORS, con seis solicitudes concurrentes, cancelación al cambiar de capa y tiempos límite. La fuente es real, pero esta vista global está reducida respecto de la resolución nativa del producto; **no implementa aún detalle adaptativo por zoom**.

La capa anterior permanece visible mientras carga la siguiente y su atribución continúa al pie. Un error ofrece reintento; no sustituye datos por texturas ficticias. Las teselas 404 y la región fuera de cobertura se muestran con rayado. THEMIS cubre aproximadamente ±65° y sus mosaicos v2 son de octubre de 2018: no son clima en vivo ni un termómetro en °C. MOLA/HRSC es cartografía sombreada, sin desplazamiento geométrico ni consulta numérica de elevación. El material del mapa no añade iluminación artificial a los colores del producto.

La escena del rover sigue siendo ilustrativa y está separada del selector científico. La introducción conserva su textura ilustrativa local; al terminar se muestra la capa NASA activa.
