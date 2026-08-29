export interface GeocodeResult {
  displayName: string;
  lat: number;
  lon: number;
}

export interface RouteResult {
  distanceKm: number;
}

export interface ILocationGateway {
  searchLocations(query: string): Promise<GeocodeResult[]>;
  calculateRoute(fromLat: number, fromLon: number, toLat: number, toLon: number): Promise<RouteResult>;
}
