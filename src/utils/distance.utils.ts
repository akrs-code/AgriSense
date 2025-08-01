// distanceUtils.ts
import { Location } from "../types/location";

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param loc1 The first location (e.g., buyer).
 * @param loc2 The second location (e.g., seller).
 * @returns The distance in kilometers.
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Radius of the Earth in kilometers
    const toRadians = (deg: number) => deg * (Math.PI / 180);

    const lat1 = toRadians(loc1.lat);
    const lat2 = toRadians(loc2.lat);
    const deltaLat = toRadians(loc2.lat - loc1.lat);
    const deltaLng = toRadians(loc2.lng - loc1.lng);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Estimates delivery time based on distance and returns a user-friendly string.
 * This is a simple linear model. You can adjust the average speed (kph) as needed.
 * @param distanceKm The distance in kilometers.
 * @param averageSpeedKph The average delivery speed in km/h.
 * @returns The estimated delivery time as a string.
 */
export function estimateDeliveryTime(distanceKm: number, averageSpeedKph: number = 30): string {
    if (distanceKm <= 0) {
        return 'Immediate';
    }

    const hours = distanceKm / averageSpeedKph;

    if (hours < 24) {
        // Round up to the nearest hour for a more conservative estimate
        const roundedHours = Math.ceil(hours);
        return `Approximately ${roundedHours} hour${roundedHours > 1 ? 's' : ''}`;
    }

    // Convert hours to days and provide a range
    const days = hours / 24;
    const lowerBound = Math.ceil(days);
    const upperBound = Math.ceil(days + 1); // A simple range for a more realistic estimate

    return `Approximately ${lowerBound}-${upperBound} day${upperBound > 1 ? 's' : ''}`;
}