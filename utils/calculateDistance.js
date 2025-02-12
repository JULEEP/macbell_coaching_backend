export const calculateDistance = (lat1, lon1, lat2, lon2, inKilometers = true) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * (Math.PI / 180); // Convert degrees to radians
    const φ2 = lat2 * (Math.PI / 180); 
    const Δφ = (lat2 - lat1) * (Math.PI / 180); 
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInMeters = R * c; // Distance in meters

    return inKilometers ? distanceInMeters / 1000 : distanceInMeters; // Return in kilometers or meters based on the flag
};
