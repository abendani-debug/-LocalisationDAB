import { useState, useEffect, useRef } from 'react';

const DEFAULT_LAT = parseFloat(import.meta.env.VITE_MAP_DEFAULT_LAT || '36.7372');
const DEFAULT_LNG = parseFloat(import.meta.env.VITE_MAP_DEFAULT_LNG || '3.0865');

export default function useGeolocation() {
  const [position, setPosition] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const watchIdRef              = useRef(null);
  const bestAccuracyRef         = useRef(Infinity);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        // Ne met à jour que si la précision s'améliore
        if (coords.accuracy < bestAccuracyRef.current) {
          bestAccuracyRef.current = coords.accuracy;
          // Arrondi à 4 décimales (~11m) pour éviter les micro-fluctuations GPS
          setPosition({
            lat: Math.round(coords.latitude  * 10000) / 10000,
            lng: Math.round(coords.longitude * 10000) / 10000,
          });
        }
        setLoading(false);
      },
      () => {
        setError('Géolocalisation refusée — position par défaut utilisée.');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, error, loading };
}
