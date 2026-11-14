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

Prototipo visual: globo con textura, control orbital, expansión, tema persistido por navegador, recorrido guiado, rover modelado con primitivas y paseo ilustrativo. La entrada es un acercamiento breve al planeta; **no hay todavía una escena de galaxia o sistema solar completo**. El modo expandido ocupa el viewport de la aplicación.

No incorpora elevación real, localización geográfica del rover, datos meteorológicos, rutas A*, alertas de radiación ni navegación física. La retícula es una referencia gráfica sin etiquetas geográficas. El paseo no evita obstáculos. No interpretar el terreno como un mapa científico de Jezero.

Textura: [Solar System Scope](https://www.solarsystemscope.com/textures/), CC BY 4.0, descargada como `public/textures/mars.jpg`. No sirve como DEM. La paleta de la interfaz no modifica el color natural de la textura.

Ver [propuesta y fuentes](docs/PRODUCTO.md).
