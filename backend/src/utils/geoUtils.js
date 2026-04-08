const EARTH_RADIUS_KM = 6371;

/**
 * Calcule la distance en km entre deux points GPS (formule Haversine).
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Calcule une bounding box approximative autour d'un point.
 * Utile pour pré-filtrer en SQL avant Haversine.
 */
const boundingBox = (lat, lon, radiusKm) => {
  const deltaLat = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI);
  const deltaLon = deltaLat / Math.cos((lat * Math.PI) / 180);
  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLon: lon - deltaLon,
    maxLon: lon + deltaLon,
  };
};

module.exports = { haversineDistance, boundingBox };
