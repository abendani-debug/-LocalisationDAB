import { useState, useCallback, useEffect, useRef } from 'react';
import MapView from '../components/Map/MapView';
import DABList from '../components/DAB/DABList';
import DABFilters from '../components/DAB/DABFilters';
import DABDetailModal from '../components/DAB/DABDetailModal';
import useGeolocation from '../hooks/useGeolocation';
import useDABs from '../hooks/useDABs';
import useSocket from '../hooks/useSocket';
import useIsMobile from '../hooks/useIsMobile';

export default function HomePage() {
  const { position } = useGeolocation();
  const [mapCenter, setMapCenter] = useState(null);
  const [filters, setFilters] = useState({ radius: 5 });
  const searchPosition = mapCenter || position;
  const { dabs, loading, error, refetch, updateDAB } = useDABs(searchPosition, filters);
  const [panel, setPanel]                 = useState('list');
  const [sheetOpen, setSheetOpen]         = useState(false);
  const [selectedDabId, setSelectedDabId] = useState(null);
  const [highlight, setHighlight]         = useState({ id: null, tick: 0 });
  const [flyTo, setFlyTo]                 = useState(null);
  const lastFliedBanque                   = useRef(null);
  const isMobile = useIsMobile();

  /* ── Fly vers le premier DAB quand une banque est sélectionnée ── */
  useEffect(() => {
    if (!filters.banque_id) {
      lastFliedBanque.current = null;
      return;
    }
    if (loading || dabs.length === 0) return;
    if (lastFliedBanque.current === filters.banque_id) return;
    lastFliedBanque.current = filters.banque_id;
    const first = dabs[0];
    setFlyTo({ lat: first.latitude, lng: first.longitude });
  }, [filters.banque_id, dabs, loading]);

  const handleHighlight = useCallback((id) => {
    setHighlight((prev) => ({ id, tick: prev.tick + 1 }));
    const dab = dabs.find((d) => d.id === id);
    if (dab) setFlyTo({ lat: dab.latitude, lng: dab.longitude });
    if (isMobile) setSheetOpen(false);
  }, [dabs, isMobile]);

  const handleDabUpdate = useCallback(({ dabId, etatCommunautaire, votes, totalVotes }) => {
    const vote_dominant = !etatCommunautaire && votes && totalVotes > 0
      ? (Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || null)
      : null;
    updateDAB(dabId, { etat_communautaire: etatCommunautaire, nb_votes_actifs: totalVotes, vote_dominant });
  }, [updateDAB]);

  useSocket(handleDabUpdate);

  /* ── Desktop layout ─────────────────────────────────────────── */
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {['list', 'filters'].map((p) => (
              <button key={p} onClick={() => setPanel(p)} style={{
                flex: 1, padding: '0.6rem', background: panel === p ? '#eff6ff' : '#fff',
                border: 'none', borderBottom: panel === p ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer', fontWeight: panel === p ? 600 : 400,
                color: panel === p ? '#1e40af' : '#6b7280', fontSize: '0.85rem',
              }}>
                {p === 'list' ? `DAB (${dabs.length})` : 'Filtres'}
              </button>
            ))}
          </div>
          {panel === 'filters'
            ? <DABFilters onFiltersChange={setFilters} />
            : <DABList dabs={dabs} loading={loading} error={error} onRetry={refetch} onSelectDAB={setSelectedDabId} onHighlightDAB={handleHighlight} />
          }
        </div>
        <div style={{ flex: 1 }}>
          <MapView dabs={dabs} userPosition={position} onCenterChange={setMapCenter} onSelectDAB={setSelectedDabId} highlight={highlight} flyTo={flyTo} />
        </div>
        {selectedDabId && (
          <DABDetailModal dabId={selectedDabId} onClose={() => setSelectedDabId(null)} />
        )}
      </div>
    );
  }

  /* ── Mobile layout — carte plein écran + bottom sheet ───────── */
  const HANDLE_HEIGHT = 44;
  const SHEET_HEIGHT  = '55vh';

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Carte plein écran */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MapView dabs={dabs} userPosition={position} onCenterChange={setMapCenter} onSelectDAB={setSelectedDabId} highlight={highlight} flyTo={flyTo} />
      </div>

      {/* Bottom sheet */}
      <div
        className="bottom-sheet"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: sheetOpen ? SHEET_HEIGHT : `${HANDLE_HEIGHT}px`,
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -3px 16px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 500,
        }}
      >
        {/* Handle / tab strip */}
        <div
          onClick={() => setSheetOpen((v) => !v)}
          style={{
            flexShrink: 0,
            height: `${HANDLE_HEIGHT}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.75rem',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Tabs inline dans le handle */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {['list', 'filters'].map((p) => (
              <button
                key={p}
                onClick={(e) => { e.stopPropagation(); setPanel(p); if (!sheetOpen) setSheetOpen(true); }}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: panel === p ? '#eff6ff' : 'transparent',
                  border: panel === p ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: panel === p ? 600 : 400,
                  color: panel === p ? '#1e40af' : '#6b7280',
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {p === 'list' ? `DAB (${dabs.length})` : 'Filtres'}
              </button>
            ))}
          </div>

          {/* Indicateur flèche */}
          <span style={{
            fontSize: '0.75rem', color: '#9ca3af',
            transform: sheetOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
            display: 'inline-block',
          }}>
            ▲
          </span>
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {panel === 'filters'
            ? <DABFilters onFiltersChange={setFilters} />
            : <DABList dabs={dabs} loading={loading} error={error} onRetry={refetch} onSelectDAB={setSelectedDabId} onHighlightDAB={handleHighlight} />
          }
        </div>
      </div>

      {selectedDabId && (
        <DABDetailModal dabId={selectedDabId} onClose={() => setSelectedDabId(null)} />
      )}
    </div>
  );
}
