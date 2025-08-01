export interface Location {
  lat: number;
  lng: number;
  address: string | null;
}
export interface LocationUpdateRequestDTO {
  lat?: number;
  lng?: number;
  address?: string;
}