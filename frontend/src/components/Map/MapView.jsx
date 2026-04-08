import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useIsMobile from '../../hooks/useIsMobile';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import DABMarker from './DABMarker';
import { FlyToPosition, LocateButton } from './MapControls';
import AddDABModal from './AddDABModal';
import toast from 'react-hot-toast';

const DEFAULT_LAT  = parseFloat(import.meta.env.VITE_MAP_DEFAULT_LAT  || '36.7372');
const DEFAULT_LNG  = parseFloat(import.meta.env.VITE_MAP_DEFAULT_LNG  || '3.0865');
const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM   || '13', 10);

/* ── Capture du clic carte en mode "ajout" + déplacement ───── */
function MapClickHandler({ addMode, onMapClick, onCenterChange }) {
  const timerRef = useRef(null);
  useMapEvents({
    click(e) {
      if (addMode) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    moveend(e) {
      const c = e.target.getCenter();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onCenterChange({ lat: c.lat, lng: c.lng });
      }, 600);
    },
  });
  return null;
}

/* ── Bouton flottant "Proposer un DAB" ──────────────────────── */
function AddButton({ addMode, onClick, isMobile }) {
  const btn = (
    <button
      onClick={onClick}
      title={addMode ? 'Cliquez sur la carte pour placer le marqueur' : 'Proposer un DAB ou une agence manquante'}
      style={{
        position: isMobile ? 'fixed' : 'absolute',
        bottom: isMobile ? '62px' : '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        padding: isMobile ? '0.7rem 1.4rem' : '0.55rem 1.1rem',
        background: addMode ? '#dc2626' : '#1e40af',
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        fontWeight: 700,
        fontSize: isMobile ? '0.95rem' : '0.85rem',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'background 0.2s',
        whiteSpace: 'nowrap',
        minHeight: '44px',
      }}
    >
      {addMode ? '✕ Annuler' : (isMobile ? '+ Proposer' : '+ Proposer un DAB / agence')}
    </button>
  );

  /* Sur mobile : portail au niveau body pour échapper aux stacking contexts */
  return isMobile ? createPortal(btn, document.body) : btn;
}

/* ── Bandeau d'instruction en mode ajout ───────────────────── */
function AddModeBanner({ isMobile }) {
  const banner = (
    <div style={{
      position: isMobile ? 'fixed' : 'absolute',
      top: isMobile ? '66px' : '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      padding: '0.5rem 1rem',
      background: '#1e40af',
      color: '#fff',
      borderRadius: '0.5rem',
      fontSize: isMobile ? '0.82rem' : '0.82rem',
      fontWeight: 600,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      pointerEvents: 'none',
      whiteSpace: isMobile ? 'normal' : 'nowrap',
      textAlign: 'center',
      maxWidth: isMobile ? 'calc(100vw - 2rem)' : 'none',
    }}>
      {isMobile ? 'Touchez la carte pour placer le DAB' : 'Cliquez sur la carte pour placer le nouveau DAB / agence'}
    </div>
  );

  return isMobile ? createPortal(banner, document.body) : banner;
}

/* ── Composant principal ─────────────────────────────────────── */
export default function MapView({ dabs = [], userPosition = null, onCenterChange, onSelectDAB, highlight = null }) {
  const [addMode, setAddMode]           = useState(false);
  const [modalPosition, setModalPosition] = useState(null);
  const isMobile = useIsMobile();

  const center = userPosition
    ? [userPosition.lat, userPosition.lng]
    : [DEFAULT_LAT, DEFAULT_LNG];

  const handleAddClick = () => {
    setAddMode((v) => !v);
    setModalPosition(null);
  };

  const handleMapClick = (pos) => {
    setModalPosition(pos);
    setAddMode(false);
  };

  const handleSuccess = () => {
    setModalPosition(null);
    toast.success('Merci ! Votre proposition sera examinée par un administrateur.', { duration: 5000 });
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%', cursor: addMode ? 'crosshair' : '' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt{s}.google.com/vt/lyrs=m&hl=fr&x={x}&y={y}&z={z}"
          subdomains="0123"
          maxZoom={20}
        />

        <MapClickHandler addMode={addMode} onMapClick={handleMapClick} onCenterChange={onCenterChange} />

        {userPosition && (
          <>
            <CircleMarker
              center={[userPosition.lat, userPosition.lng]}
              radius={8}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.9 }}
            />
            <FlyToPosition position={userPosition} />
            <LocateButton position={userPosition} />
          </>
        )}

        {dabs.map((dab) => (
          <DABMarker
            key={dab.id}
            dab={dab}
            userPosition={userPosition}
            onSelectDAB={onSelectDAB}
            highlightTick={highlight?.id === dab.id ? highlight.tick : 0}
          />
        ))}
      </MapContainer>

      {/* Contrôles hors MapContainer pour éviter les conflits Leaflet */}
      {addMode && <AddModeBanner isMobile={isMobile} />}
      <AddButton addMode={addMode} onClick={handleAddClick} isMobile={isMobile} />

      {/* Modal de proposition */}
      {modalPosition && (
        <AddDABModal
          position={modalPosition}
          onClose={() => setModalPosition(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
