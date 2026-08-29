import type { ILocationGateway, GeocodeResult, RouteResult } from '../../../core/contracts/ILocationGateway';

export class OpenStreetMapLocationGateway implements ILocationGateway {
  async searchLocations(query: string): Promise<GeocodeResult[]> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=in&limit=5`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'ChikuSFA-Admin/1.0' },
      });
      if (!res.ok) return [];
      const data = await res.json();
      interface OsmItem { lat: string; lon: string; display_name: string; }
    return ((data as OsmItem[]) || []).map((item: OsmItem) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
    } catch (err) {
      console.error('[OpenStreetMapLocationGateway] Search error:', err);
      return [];
    }
  }

  async calculateRoute(fromLat: number, fromLon: number, toLat: number, toLon: number): Promise<RouteResult> {
    try {
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
      const res = await fetch(routeUrl, {
        headers: { 'User-Agent': 'ChikuSFA-Admin/1.0' },
      });
      if (!res.ok) return { distanceKm: 0 };
      const data = await res.json();
      const distanceMeters = data?.routes?.[0]?.distance || 0;
      return { distanceKm: Math.round(distanceMeters / 1000) };
    } catch (err) {
      console.error('[OpenStreetMapLocationGateway] Route error:', err);
      return { distanceKm: 0 };
    }
  }
}
