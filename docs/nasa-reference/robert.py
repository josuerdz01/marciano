import heapq
import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import rasterio
from rasterio.windows import Window
from scipy.ndimage import generic_filter


@dataclass
class RoverSpecs:
    """Parámetros mecánicos, térmicos y energéticos del rover (Estándar NASA MSL/M2020)."""
    wheel_diameter_m: float = 0.525      # Diámetro de rueda en el modelo 3D (m)
    ground_clearance_m: float = 0.60     # Despeje libre del chasis (m)
    nominal_speed_kmh: float = 0.14      # Velocidad media de travesía autónoma (km/h)

    # Umbrales críticos de supervivencia (Exclusión estricta -> Costo infinito)
    max_pitch_deg: float = 30.0          # Ángulo máximo longitudinal de subida/bajada (°)
    max_roll_deg: float = 25.0           # Ángulo máximo de inclinación lateral (°)
    min_operating_temp_c: float = -40.0  # Límite inferior operativo de electrónica/baterías (°C)
    max_operating_temp_c: float = 50.0   # Límite superior operativo (°C)
    max_radiation_msv_day: float = 150.0 # Límite de radiación para evitar fallos lógicos SEE (mSv/día)

    # Umbrales óptimos de operación (Sin penalización adicional)
    opt_slope_deg: float = 10.0
    opt_temp_min_c: float = -10.0
    opt_temp_max_c: float = 25.0
    opt_radiation_msv_day: float = 0.70

    # Pesos del Mapa de Costos Ponderado (Weighted Cost Map)
    w_distance: float = 1.0              # Peso por distancia euclidiana 3D
    w_slope_energy: float = 5.0          # Peso por consumo de batería y deslizamiento en pendiente
    w_thermal: float = 2.5               # Peso por activación de calentadores RHU/eléctricos
    w_radiation: float = 3.0             # Peso por dosis de radiación acumulada
    w_roughness: float = 3.5             # Peso por fatiga mecánica en terreno rugoso (TRI)


class MarsGeoPackageManager:
    """Gestiona la lectura del archivo .gpkg, recorte dinámico de ROI y derivación de capas."""

    def __init__(self, gpkg_path: str, dem_table: str = "mola_elevacion"):
        self.gpkg_path = Path(gpkg_path)
        if not self.gpkg_path.exists():
            raise FileNotFoundError(f"No se encontró el archivo GeoPackage: {self.gpkg_path}")
        self.dem_table = dem_table
        self.dem_uri = f"GPKG:{self.gpkg_path}:{self.dem_table}"
        self.available_tables = self._inspect_gpkg_tables()

    def _inspect_gpkg_tables(self) -> List[str]:
        """Consulta el catálogo interno SQLite del GeoPackage para detectar capas disponibles."""
        with sqlite3.connect(self.gpkg_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT table_name FROM gpkg_contents;")
            return [row[0] for row in cursor.fetchall()]

    def latlon_to_global_rc(self, lat_deg: float, lon_deg: float) -> Tuple[int, int]:
        """
        Convierte coordenadas planetarias (latitud [-90, 90], longitud [-180, 180])
        a índices globales (fila, columna) usando los límites reales del GeoPackage.
        """
        with rasterio.open(self.dem_uri) as src:
            bounds = src.bounds
            x_m = bounds.left + ((lon_deg + 180.0) / 360.0) * (bounds.right - bounds.left)
            y_m = bounds.bottom + ((lat_deg + 90.0) / 180.0) * (bounds.top - bounds.bottom)
            row, col = src.index(x_m, y_m)
            row = int(np.clip(row, 0, src.height - 1))
            col = int(np.clip(col, 0, src.width - 1))
            return row, col

    def extract_roi_around_points(
        self,
        point_a_rc: Tuple[int, int],
        point_b_rc: Tuple[int, int],
        padding_px: int = 40,
        temp_layer: Optional[str] = None,
        rad_layer: Optional[str] = None,
        roughness_layer: Optional[str] = None
    ) -> Dict:
        """
        Recorta automáticamente una Región de Interés (ROI) que engloba los puntos A y B
        más un margen de maniobra (padding_px) para que A* se ejecute en segundos.
        """
        with rasterio.open(self.dem_uri) as src:
            r_min = max(0, min(point_a_rc[0], point_b_rc[0]) - padding_px)
            r_max = min(src.height, max(point_a_rc[0], point_b_rc[0]) + padding_px + 1)
            c_min = max(0, min(point_a_rc[1], point_b_rc[1]) - padding_px)
            c_max = min(src.width, max(point_a_rc[1], point_b_rc[1]) + padding_px + 1)

            roi_window = Window(col_off=c_min, row_off=r_min, width=c_max - c_min, height=r_max - r_min)
            dem = src.read(1, window=roi_window).astype(np.float64)

            # Limpiar valores nulos (NoData) si existen en el recorte
            if src.nodata is not None:
                dem[dem == src.nodata] = np.nan
            if np.isnan(dem).any():
                dem = np.nan_to_num(dem, nan=float(np.nanmean(dem)))

            # Extraer resolución espacial exacta en metros por píxel desde la matriz afín
            pixel_x_m = abs(float(src.transform.a))
            pixel_y_m = abs(float(src.transform.e))
            window_transform = src.window_transform(roi_window)

            # Calcular latitud de cada fila del ROI para el modelo físico térmico
            rows_global = np.arange(r_min, r_max)
            latitudes_deg = 90.0 - ((rows_global + 0.5) / src.height) * 180.0
            lat_grid_rad = np.radians(latitudes_deg)[:, np.newaxis]

        # Verificar capas adicionales o derivarlas físicamente a partir del DEM MOLA
        temp_map = self._load_layer_if_exists(temp_layer, roi_window)
        if temp_map is None:
            temp_map = self._synthesize_temperature(dem, lat_grid_rad, pixel_y_m)

        rad_map = self._load_layer_if_exists(rad_layer, roi_window)
        if rad_map is None:
            rad_map = self._synthesize_radiation(dem)

        rough_map = self._load_layer_if_exists(roughness_layer, roi_window)
        if rough_map is None:
            rough_map = self._synthesize_tri_roughness(dem)

        # Coordenadas de A y B relativas a la matriz recortada (ROI)
        local_a = (point_a_rc[0] - r_min, point_a_rc[1] - c_min)
        local_b = (point_b_rc[0] - r_min, point_b_rc[1] - c_min)

        return {
            "dem": dem,
            "temp": temp_map,
            "rad": rad_map,
            "roughness": rough_map,
            "pixel_x_m": pixel_x_m,
            "pixel_y_m": pixel_y_m,
            "local_a": local_a,
            "local_b": local_b,
            "roi_offset_rc": (r_min, c_min),
            "window_transform": window_transform
        }

    def _load_layer_if_exists(self, layer_name: Optional[str], window: Window) -> Optional[np.ndarray]:
        """Carga una capa extra desde el .gpkg o desde un archivo externo GeoTIFF si existe."""
        if not layer_name:
            return None
        if layer_name in self.available_tables:
            with rasterio.open(f"GPKG:{self.gpkg_path}:{layer_name}") as src:
                return src.read(1, window=window).astype(np.float64)
        ext_path = Path(layer_name)
        if ext_path.exists():
            with rasterio.open(ext_path) as src:
                return src.read(1, window=window).astype(np.float64)
        return None

    @staticmethod
    def _synthesize_temperature(dem: np.ndarray, lat_grid_rad: np.ndarray, pixel_y_m: float) -> np.ndarray:
        """Modelo térmico marciano acoplado por latitud, altitud sobre el areoide y orientación de ladera."""
        t_equator_c = -5.0
        delta_t_lat_c = 55.0
        lapse_rate_c_m = 0.0015
        dz_dy = np.gradient(dem, pixel_y_m, axis=0)
        aspect_cooling = 8.0 * np.tanh(dz_dy * 15.0) * np.sign(lat_grid_rad)
        return t_equator_c - (delta_t_lat_c * (np.sin(lat_grid_rad) ** 2)) - (lapse_rate_c_m * dem) - aspect_cooling

    @staticmethod
    def _synthesize_radiation(dem: np.ndarray) -> np.ndarray:
        """Modelo de dosis de radiación ionizante (mSv/día) por altura de escala atmosférica (H = 11.1 km)."""
        d_datum_msv = 0.64
        scale_height_m = 11100.0
        return d_datum_msv * np.exp(dem / scale_height_m)

    @staticmethod
    def _synthesize_tri_roughness(dem: np.ndarray) -> np.ndarray:
        """Índice de Rugosidad del Terreno (TRI de Riley) escalado a obstáculos mecánicos locales (m)."""
        def riley_tri(window_vals):
            center = window_vals[4]
            return np.sqrt(np.sum((window_vals - center) ** 2))

        tri_raw = generic_filter(dem, riley_tri, size=3, mode="nearest")
        p99 = max(1.0, float(np.percentile(tri_raw, 99)))
        return np.clip(tri_raw / p99, 0.0, 1.15) * 0.48


class MarsMultilayerAStar:
    """Algoritmo A* con Mapa de Costos Ponderado y cinemática de Pitch/Roll sobre el ROI."""

    def __init__(self, roi_data: Dict, specs: RoverSpecs = RoverSpecs()):
        self.dem = roi_data["dem"]
        self.temp = roi_data["temp"]
        self.rad = roi_data["rad"]
        self.rough = roi_data["roughness"]
        self.dx_m = roi_data["pixel_x_m"]
        self.dy_m = roi_data["pixel_y_m"]
        self.r_off, self.c_off = roi_data["roi_offset_rc"]
        self.transform = roi_data["window_transform"]
        self.specs = specs
        self.rows, self.cols = self.dem.shape

        # Gradientes espaciales (m/m) y pendiente basal en grados
        self.dz_dy, self.dz_dx = np.gradient(self.dem, self.dy_m, self.dx_m)
        self.slope_deg = np.degrees(np.arctan(np.hypot(self.dz_dx, self.dz_dy)))
        self.static_cost_map = self._compile_static_cost_map()

    def _compile_static_cost_map(self) -> np.ndarray:
        """Evalúa penalizaciones ambientales y bloquea zonas letales con np.inf."""
        cost = np.zeros((self.rows, self.cols), dtype=np.float64)

        # 1. Estrés térmico fuera del rango óptimo
        cold_diff = np.maximum(0.0, self.specs.opt_temp_min_c - self.temp)
        hot_diff = np.maximum(0.0, self.temp - self.specs.opt_temp_max_c)
        cost += self.specs.w_thermal * (
            (cold_diff / (self.specs.opt_temp_min_c - self.specs.min_operating_temp_c)) ** 2
            + (hot_diff / (self.specs.max_operating_temp_c - self.specs.opt_temp_max_c)) ** 2
        )

        # 2. Exceso de radiación ionizante
        rad_diff = np.maximum(0.0, self.rad - self.specs.opt_radiation_msv_day)
        cost += self.specs.w_radiation * (rad_diff / self.specs.opt_radiation_msv_day)

        # 3. Rugosidad TRI frente al límite mecánico de rueda/chasis
        max_obstacle_m = min(self.specs.wheel_diameter_m, self.specs.ground_clearance_m * 0.85)
        cost += self.specs.w_roughness * ((self.rough / max_obstacle_m) ** 2)

        # 4. Zonas letales (Exclusión absoluta)
        lethal_zones = (
            (self.slope_deg > self.specs.max_pitch_deg)
            | (self.temp < self.specs.min_operating_temp_c)
            | (self.temp > self.specs.max_operating_temp_c)
            | (self.rad > self.specs.max_radiation_msv_day)
            | (self.rough >= max_obstacle_m)
        )
        cost[lethal_zones] = np.inf
        return cost

    def _step_cost(self, u: Tuple[int, int], v: Tuple[int, int]) -> float:
        """Calcula el costo de transición evaluando Pitch longitudinal, Roll lateral y consumo."""
        r1, c1 = u
        r2, c2 = v

        if np.isinf(self.static_cost_map[r2, c2]):
            return np.inf

        dx = (c2 - c1) * self.dx_m
        dy = (r2 - r1) * self.dy_m
        dist_2d = np.hypot(dx, dy)
        dz = self.dem[r2, c2] - self.dem[r1, c1]
        dist_3d = np.hypot(dist_2d, dz)

        # Ángulo longitudinal (Pitch) + contribución de micro-pendiente por rugosidad TRI
        macro_pitch_deg = np.degrees(np.arctan2(abs(dz), dist_2d))
        effective_pitch_deg = macro_pitch_deg + (self.rough[r2, c2] / self.specs.wheel_diameter_m) * 8.0
        if effective_pitch_deg > self.specs.max_pitch_deg:
            return np.inf

        # Ángulo transversal (Roll) proyectando el vector perpendicular de avance sobre el gradiente
        ux, uy = dx / dist_2d, dy / dist_2d
        cross_slope = abs(-uy * self.dz_dx[r2, c2] + ux * self.dz_dy[r2, c2])
        effective_roll_deg = np.degrees(np.arctan(cross_slope)) + (self.rough[r2, c2] / self.specs.wheel_diameter_m) * 5.0
        if effective_roll_deg > self.specs.max_roll_deg:
            return np.inf

        # Penalización energética por ascenso y patinaje (Slip)
        if dz > 0:
            slip_eff = max(0.15, 1.0 - (effective_pitch_deg / self.specs.max_pitch_deg) ** 2)
            slope_cost = self.specs.w_slope_energy * (effective_pitch_deg / self.specs.opt_slope_deg) / slip_eff
        else:
            slope_cost = 0.30 * self.specs.w_slope_energy * (effective_pitch_deg / self.specs.opt_slope_deg)

        roll_cost = self.specs.w_slope_energy * ((effective_roll_deg / self.specs.max_roll_deg) ** 2)
        env_cost = 0.5 * (self.static_cost_map[r1, c1] + self.static_cost_map[r2, c2])

        return float(dist_3d * (self.specs.w_distance + slope_cost + roll_cost + env_cost))

    def _heuristic(self, u: Tuple[int, int], goal: Tuple[int, int]) -> float:
        dx = (goal[1] - u[1]) * self.dx_m
        dy = (goal[0] - u[0]) * self.dy_m
        dz = self.dem[goal[0], goal[1]] - self.dem[u[0], u[1]]
        return float(np.sqrt(dx * dx + dy * dy + dz * dz) * self.specs.w_distance)

    def solve(self, start_local: Tuple[int, int], goal_local: Tuple[int, int]) -> Dict:
        """Ejecuta A* y genera el paquete completo de coordenadas 3D y telemetría."""
        if np.isinf(self.static_cost_map[start_local]):
            raise ValueError("El Punto A cae en una celda letal intransitable.")
        if np.isinf(self.static_cost_map[goal_local]):
            raise ValueError("El Punto B cae en una celda letal intransitable.")

        neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]
        pq = [(0.0, start_local)]
        came_from: Dict[Tuple[int, int], Tuple[int, int]] = {}
        g_score: Dict[Tuple[int, int], float] = {start_local: 0.0}
        closed = set()

        while pq:
            _, current = heapq.heappop(pq)
            if current == goal_local:
                return self._build_output_payload(came_from, current, g_score[goal_local])

            if current in closed:
                continue
            closed.add(current)

            for dr, dc in neighbors:
                nr, nc = current[0] + dr, current[1] + dc
                if 0 <= nr < self.rows and 0 <= nc < self.cols:
                    nxt = (nr, nc)
                    if nxt in closed:
                        continue
                    cost = self._step_cost(current, nxt)
                    if np.isinf(cost):
                        continue
                    tentative_g = g_score[current] + cost
                    if tentative_g < g_score.get(nxt, np.inf):
                        came_from[nxt] = current
                        g_score[nxt] = tentative_g
                        f_score = tentative_g + self._heuristic(nxt, goal_local)
                        heapq.heappush(pq, (f_score, nxt))

        raise RuntimeError("No existe ruta segura entre A y B con los parámetros actuales.")

    def _build_output_payload(
        self, came_from: Dict[Tuple[int, int], Tuple[int, int]], current: Tuple[int, int], total_cost: float
    ) -> Dict:
        path_rc = [current]
        while current in came_from:
            current = came_from[current]
            path_rc.append(current)
        path_rc.reverse()

        z_min_roi = float(np.min(self.dem))
        coords_local_3d: List[Tuple[float, float, float]] = []
        coords_planetary_m: List[Tuple[float, float, float]] = []

        total_dist_m = 0.0
        elev_gain_m = 0.0
        pitches = []
        temps = []
        rads = []
        accum_risk = 0.0

        for idx, (r, c) in enumerate(path_rc):
            # Coordenadas locales en metros para motores 3D (origen 0,0,0 en la esquina del ROI)
            x_local = float(c * self.dx_m)
            y_local = float(r * self.dy_m)
            z_raw = float(self.dem[r, c])
            z_local = z_raw - z_min_roi
            coords_local_3d.append((round(x_local, 2), round(y_local, 2), round(z_local, 2)))

            # Coordenadas proyectadas reales en SIMPLE_CYLINDRICAL MARS
            x_mars, y_mars = rasterio.transform.xy(self.transform, r, c)
            coords_planetary_m.append((round(float(x_mars), 2), round(float(y_mars), 2), round(z_raw, 2)))

            temps.append(float(self.temp[r, c]))
            rads.append(float(self.rad[r, c]))

            if idx > 0:
                r_prev, c_prev = path_rc[idx - 1]
                dx = (c - c_prev) * self.dx_m
                dy = (r - r_prev) * self.dy_m
                dz = z_raw - float(self.dem[r_prev, c_prev])
                step_2d = np.hypot(dx, dy)
                step_3d = np.hypot(step_2d, dz)

                total_dist_m += step_3d
                if dz > 0:
                    elev_gain_m += dz
                pitches.append(np.degrees(np.arctan2(abs(dz), step_2d)))
                accum_risk += float(self.static_cost_map[r, c]) * (step_3d / 1000.0)

        dist_km = total_dist_m / 1000.0
        mission_days = (dist_km / max(0.01, self.specs.nominal_speed_kmh)) / 24.0
        total_rad_dose_msv = float(np.mean(rads)) * mission_days

        return {
            "metadata_roi": {
                "crs": "SIMPLE_CYLINDRICAL MARS (R=3396000m)",
                "roi_dimensions_px": [self.rows, self.cols],
                "roi_global_offset_rc": [self.r_off, self.c_off],
                "pixel_resolution_m": [round(self.dx_m, 2), round(self.dy_m, 2)],
                "z_base_areoid_m": round(z_min_roi, 2)
            },
            "telemetria_mision": {
                "waypoints_totales": len(coords_local_3d),
                "distancia_total_3d_km": round(dist_km, 2),
                "desnivel_positivo_acumulado_m": round(elev_gain_m, 2),
                "pendiente_promedio_deg": round(float(np.mean(pitches)), 2) if pitches else 0.0,
                "pendiente_maxima_deg": round(float(np.max(pitches)), 2) if pitches else 0.0,
                "temperatura_media_ruta_c": round(float(np.mean(temps)), 2),
                "temperatura_minima_ruta_c": round(float(np.min(temps)), 2),
                "dosis_radiacion_media_msv_dia": round(float(np.mean(rads)), 3),
                "dosis_total_travesia_msv": round(total_rad_dose_msv, 2),
                "riesgo_ambiental_acumulado": round(accum_risk, 2),
                "costo_total_ponderado": round(total_cost, 2)
            },
            "coordenadas_locales_3d_m": coords_local_3d,
            "coordenadas_planetarias_m": coords_planetary_m
        }


# =====================================================================
# BLOQUE PRINCIPAL DE EJECUCIÓN
# =====================================================================
if __name__ == "__main__":
    ARCHIVO_GPKG = "Marte_MOLA_Elevacion_16ppd.gpkg"
    ARCHIVO_SALIDA = "ruta_marte_3d.json"

    # 1. Inicializar gestor del GeoPackage
    manager = MarsGeoPackageManager(gpkg_path=ARCHIVO_GPKG, dem_table="mola_elevacion")
    print(f"Capas detectadas en el GeoPackage: {manager.available_tables}")

    # 2. Definir Punto A y Punto B en Latitud/Longitud marciana (Ejemplo: Región de Valles Marineris)
    # También puedes pasar directamente índices de píxel (fila, col) si los obtuviste en QGIS
    punto_a_rc = manager.latlon_to_global_rc(lat_deg=-12.5, lon_deg=-65.0)
    punto_b_rc = manager.latlon_to_global_rc(lat_deg=-14.8, lon_deg=-61.5)

    # 3. Extraer ventana ROI automática alrededor de A y B con margen de 45 píxeles
    roi_data = manager.extract_roi_around_points(
        point_a_rc=punto_a_rc,
        point_b_rc=punto_b_rc,
        padding_px=45
    )

    # 4. Ejecutar el planificador A* multicapa
    planner = MarsMultilayerAStar(roi_data=roi_data, specs=RoverSpecs())
    resultado = planner.solve(
        start_local=roi_data["local_a"],
        goal_local=roi_data["local_b"]
    )

    # 5. Exportar coordenadas 3D [(x, y, z), ...] y telemetría a JSON
    with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)

    print("\n=== TELEMETRÍA DE LA RUTA ÓPTIMA ===")
    for metrica, valor in resultado["telemetria_mision"].items():
        print(f" - {metrica}: {valor}")
    print(f"\nArchivo exportado exitosamente en: {ARCHIVO_SALIDA}")
    