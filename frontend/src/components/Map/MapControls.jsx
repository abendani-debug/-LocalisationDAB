import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';

export function FlyToPosition({ position }) {
  const map = useMap();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!map || !position || !mounted.current) return;
    try {
      map.flyTo([position.lat, position.lng], 14, { animate: true, duration: 1.5 });
    } catch (_) {
      // carte pas encore prête
    }
  }, [map, position]);

  return null;
}

export function LocateButton({ position }) {
  const map = useMap();
  if (!position) return null;
  return (
    <div style={{ position: 'absolute', bottom: '5rem', right: '0.75rem', zIndex: 1000 }}>
      <button
        onClick={() => map.flyTo([position.lat, position.lng], 15)}
        title="Ma position"
        style={{
          width: '34px', height: '34px', background: '#fff',
          border: '2px solid rgba(0,0,0,0.2)', borderRadius: '4px',
          cursor: 'pointer', fontSize: '1rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        📍
      </button>
    </div>
  );
}
