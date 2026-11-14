# Rutas A–B: implementación y tecnologías

## Ya integrado

El sitio inicial es el centro de la última referencia de Mars Trek: longitud -57.70568740014555, latitud -20.148925405400668. El globo y las capas WMTS se conservan; el descenso carga una ventana local CTX alrededor de ese punto. No se incrusta la interfaz de Trek.

Datos de imágenes: catálogo NASA Mars Trek WMTS → servicio CTX de NASA/JPL/MSSS/Caltech, distribuido por Esri. Datos numéricos: recorte independiente del DEM combinado MOLA (NASA) + HRSC (ESA/DLR), publicado por USGS, v2. El recorte mide 387 × 387 celdas de cuadrícula nominal de 200 m y ocupa unos 300 KB en binario. Su procedencia, CRS, valores NoData, licencia y hash están en public/data/. Las alturas no se deducen del color de la imagen.

Se verifica SHA-256 antes de usar el recorte. Cada A/B se ajusta al centro de una celda y se informa su coordenada. La región utilizable requiere elevación finita y cobertura CTX en el centro y esquinas de la celda; el cálculo se limita a la imagen local cargada y al recorte de elevación. Fuera del recorte la interfaz lo indica y no inventa alturas.

El motor calcula pendientes métricas, bloquea celdas que superan el umbral y verifica además la pendiente de cada arista. No permite diagonales que corten esquinas bloqueadas. A* corre en un Web Worker y entrega dos alternativas: distancia mínima y coste mínimo con penalización de pendiente. La heurística es distancia geodésica y no supera el coste mínimo por distancia. No se suavizan los resultados atravesando obstáculos. Se muestran perfil de elevación, distancia, ascenso, descenso y pendiente máxima calculada. El rover puede recorrer la polilínea y detenerse en B; su escala y velocidad son ilustrativas. Reiniciar el recorrido lo lleva de nuevo a A.

La segunda alternativa minimiza el coste total ponderado: no promete minimizar el máximo de pendiente. El límite del modelo por defecto (15°) es configurable y no procede de una calibración de vehículo real. No hay clasificación automática de rocas/arena, coste energético ni alertas radiológicas. Un DEM regional, y especialmente el detalle MOLA remuestreado, no resuelve peligros de escala de ruedas. La geometría visible sigue siendo plana aunque las rutas sí usan alturas numéricas.

## Tecnologías necesarias ahora

- React + React Router para la aplicación; Three.js/R3F para mapa y rover.
- Servicios públicos WMTS/ArcGIS para imágenes. No se necesita clave de OpenAI ni una suscripción de IA para este flujo.
- Datos estáticos de elevación preparados con Python, Rasterio/GDAL y NumPy. Se necesitan sólo al preparar o ampliar regiones; no son un backend obligatorio para este recorte.
- Web Worker y A* para la planificación en el navegador, más SHA-256 nativo para integridad.

No usamos IA para calcular la ruta. Si después queremos clasificar dunas, piedras o tipos de suelo desde imágenes, un modelo de visión podría ser útil, con etiquetas y validación. Eso no sustituiría la elevación, las restricciones físicas ni el planificador.

## Para crecer

Para rutas en todo Marte o áreas muy grandes hará falta servir elevación por teselas/COG, cachear recortes y procesar datos en un servicio de geodatos. Un backend con GDAL/Rasterio y almacenamiento de objetos es una opción; también puede evaluarse lectura de COG en navegador si el origen soporta CORS y rangos. Para rutas locales de un rover físico hacen falta DTM/ortoimagen de mayor resolución y percepción estéreo/localización, además de calibrar huella, giro, altura libre, suelo y energía.

## Reproducción y verificación

Instalar rasterio y numpy en un entorno de Python y ejecutar scripts/prepare_dem.py desde el repositorio. Usa lecturas HTTP Range de un GeoTIFF global de unos 11 GB; no descarga el globo completo. Conserva fuente y licencia al regenerar y comprueba la nueva extensión/hash.

node --test verifica geometría, cruces de esquinas, bordes, acantilados, NoData, selección de alternativas, integridad del DEM y una ruta sobre las alturas reales incluidas. pnpm build genera la aplicación y su worker.
