---
name: webgis-spatial-engine
description: Comprehensive spatial data engineering guide for TransitERA, covering Uber H3 Hexagonal Grid indexing (resolutions 8-9), OSMnx network walkability buffers, 5D TOD AHP matrix scoring, and Spatial Durbin Model (SDM) regression via PySAL.
---

# WebGIS Spatial Engine Guide (TransitERA)

Spatial data engineering, Uber H3 indexing, 5D TOD Analytic Hierarchy Process (AHP), and spatial econometrics (**Spatial Durbin Model**) for **TransitERA**.

---

## 1. Uber H3 Hexagonal Grid Aggregation

Replaces arbitrary circular buffers to resolve the **Modifiable Areal Unit Problem (MAUP)** with uniform spatial partitions.

### Resolution Standards:
- **Resolution 8**: Area $\approx 0.737\text{ km}^2$, edge length $\approx 461\text{ m}$. Macro corridor analysis.
- **Resolution 9**: Area $\approx 0.105\text{ km}^2$, edge length $\approx 174\text{ m}$. Micro pedestrian catchment and land value modeling.

```python
import h3
import geopandas as gpd
from shapely.geometry import Polygon

def geojson_to_h3_grid(gdf_polygon: gpd.GeoDataFrame, resolution: int = 9) -> gpd.GeoDataFrame:
    """Convert polygon GeoDataFrame into indexed Uber H3 hexagonal cells."""
    hexagons = []
    for _, row in gdf_polygon.iterrows():
        geom = row.geometry
        geojson_geom = geom.__geo_interface__
        h3_indexes = h3.polyfill(geojson_geom, resolution, geo_json_conformant=True)
        
        for h3_id in h3_indexes:
            boundary = h3.h3_to_geo_boundary(h3_id, geo_json=True)
            poly = Polygon(boundary)
            hexagons.append({
                "h3_index": h3_id,
                "resolution": resolution,
                "geometry": poly
            })
            
    gdf_h3 = gpd.GeoDataFrame(hexagons, crs="EPSG:4326")
    return gdf_h3.drop_duplicates(subset=["h3_index"])
```

---

## 2. Pedestrian Network Buffers (OSMnx)

Models true pedestrian catchment along road networks rather than straight-line Euclidean distance:

```python
import osmnx as ox
import networkx as nx
import geopandas as gpd
from shapely.geometry import Point

def generate_network_buffers(station_coords: tuple, distances: list = [400, 800, 1000]) -> dict:
    """Generate realistic walkability isochrones along pedestrian street networks."""
    G = ox.graph_from_point(station_coords, dist=1500, network_type='walk')
    center_node = ox.distance.nearest_nodes(G, station_coords[1], station_coords[0])
    
    buffers = {}
    for dist in distances:
        subgraph = nx.ego_graph(G, center_node, radius=dist, distance='length')
        node_points = [Point((data['x'], data['y'])) for _, data in subgraph.nodes(data=True)]
        gdf_nodes = gpd.GeoDataFrame(geometry=node_points, crs="EPSG:4326")
        
        # Project to UTM (EPSG:32749 - WGS 84 / UTM zone 49S) for metric accuracy
        gdf_utm = gdf_nodes.to_crs(epsg=32749)
        poly_utm = gdf_utm.geometry.unary_union.convex_hull.buffer(25)
        poly_wgs = gpd.GeoSeries([poly_utm], crs="EPSG:32749").to_crs(epsg=4326).iloc[0]
        buffers[f"zone_{dist}m"] = poly_wgs
        
    return buffers
```

---

## 3. 5D TOD Framework & AHP Scoring

### 5 TOD Dimensions:
1. **Density ($D_1$)**: Population density and building floor area ratio (FAR).
2. **Diversity ($D_2$)**: Mixed land use (Shannon Entropy Index) and business vitality.
3. **Design ($D_3$)**: Sidewalk quality, tactile paving, crosswalks, and tree canopy.
4. **Destination Accessibility ($D_4$)**: 15-minute access to essential public services and jobs.
5. **Distance to Transit ($D_5$)**: Network walking distance to rail stations and feeder stops.

### AHP Mathematical Consistency Invariant ($CR \le 0.10$):
$$\text{Consistency Index (CI)} = \frac{\lambda_{\max} - n}{n - 1}, \quad \text{Consistency Ratio (CR)} = \frac{\text{CI}}{\text{RI}}$$
For $n = 5$, $\text{Random Index (RI)} = 1.12$. AHP calculations **must assert** $CR \le 0.10$.

```python
import numpy as np

def calculate_ahp_weights(pairwise_matrix: np.ndarray) -> tuple[np.ndarray, float]:
    n = pairwise_matrix.shape[0]
    col_sum = pairwise_matrix.sum(axis=0)
    norm_matrix = pairwise_matrix / col_sum
    weights = norm_matrix.mean(axis=1)
    
    lambda_max = np.sum(col_sum * weights)
    ci = (lambda_max - n) / (n - 1)
    ri_dict = {3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24}
    cr = ci / ri_dict.get(n, 1.12)
    return weights, cr
```

---

## 4. Spatial Econometrics: Spatial Durbin Model (SDM)

Models the relationship between TOD Readiness ($X$) and Land Value/NJOP ($Y$) while capturing spatial spillovers:

$$Y = \rho W Y + \alpha + X \beta + W X \theta + \varepsilon$$

* $Y$: $\ln(\text{NJOP per m}^2)$
* $W$: Spatial weight matrix (Queen contiguity or k-nearest neighbors $k=6$).
* $\rho$: Spatial autoregressive coefficient of the dependent variable.
* $\beta$: Direct effect of local TOD readiness on land value.
* $\theta$: Indirect spatial spillover effect from adjacent hexagons.
