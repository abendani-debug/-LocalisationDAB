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
  const [mapCenter, setMapCenter]         = useState(null);
  const [filters, setFilters]             = useState({ radius: 5 });
  const searchPosition                    = mapCenter || position;
  const { dabs, loading, error, refetch, updateDAB } = useDABs(searchPosition, filters);
  const [panel, setPanel]                 = useState('list');
  const [sheetOpen, setSheetOpen]         = useState(false);
  const [selectedDabId, setSelectedDabId] = useState(null);
  const [highlight, setHighlight]         = useState({ id: null, tick: 0 });
  const [flyTo, setFlyTo]                 = useState(null);
  const lastFliedBanque                   = useRef(null);
  const isMobile                          = useIsMobile();

  useEffect(() => {
    if (!filters.banque_id) { lastFliedBanque.current = null; return; }
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

  /* ── Desktop ───────────────────────────────────────────────── */
  if (!isMobile) {
    return (
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-[340px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {['list', 'filters'].map((p) => (
              <button
                key={p}
                onClick={() => setPanel(p)}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-l-0 border-r-0 border-t-0
                  ${panel === p
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-gray-700'
                  }`}
              >
                {p === 'list' ? `DAB (${dabs.length})` : 'Filtres'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {panel === 'filters'
              ? <DABFilters onFiltersChange={setFilters} />
              : <DABList
                  dabs={dabs} loading={loading} error={error}
                  onRetry={refetch} onSelectDAB={setSelectedDabId}
                  onHighlightDAB={handleHighlight}
                />
            }
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 h-full min-h-0 overflow-hidden">
          <MapView
            dabs={dabs} userPosition={position}
            onCenterChange={setMapCenter} onSelectDAB={setSelectedDabId}
            highlight={highlight} flyTo={flyTo}
          />
        </div>

        {selectedDabId && (
          <DABDetailModal dabId={selectedDabId} onClose={() => setSelectedDabId(null)} />
        )}
      </div>
    );
  }

  /* ── Mobile ────────────────────────────────────────────────── */
  const HANDLE_HEIGHT = 44;
  const SHEET_HEIGHT  = '55vh';

  return (
    <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Carte plein écran */}
      <div className="absolute inset-0">
        <MapView
          dabs={dabs} userPosition={position}
          onCenterChange={setMapCenter} onSelectDAB={setSelectedDabId}
          highlight={highlight} flyTo={flyTo}
        />
      </div>

      {/* Bottom sheet */}
      <div
        className="bottom-sheet absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-3px_16px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden z-[500]"
        style={{ height: sheetOpen ? SHEET_HEIGHT : `${HANDLE_HEIGHT}px` }}
      >
        {/* Handle + tabs */}
        <div
          onClick={() => setSheetOpen((v) => !v)}
          className="flex-shrink-0 flex items-center justify-between px-3 cursor-pointer select-none"
          style={{ height: `${HANDLE_HEIGHT}px` }}
        >
          <div className="flex gap-1.5">
            {['list', 'filters'].map((p) => (
              <button
                key={p}
                onClick={(e) => { e.stopPropagation(); setPanel(p); if (!sheetOpen) setSheetOpen(true); }}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer
                  ${panel === p
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-transparent text-slate-500'
                  }`}
              >
                {p === 'list' ? `DAB (${dabs.length})` : 'Filtres'}
              </button>
            ))}
          </div>
          <span
            className="text-xs text-slate-400 inline-block transition-transform duration-300"
            style={{ transform: sheetOpen ? 'rotate(180deg)' : 'none' }}
          >
            ▲
          </span>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {panel === 'filters'
            ? <DABFilters onFiltersChange={setFilters} />
            : <DABList
                dabs={dabs} loading={loading} error={error}
                onRetry={refetch} onSelectDAB={setSelectedDabId}
                onHighlightDAB={handleHighlight}
              />
          }
        </div>
      </div>

      {selectedDabId && (
        <DABDetailModal dabId={selectedDabId} onClose={() => setSelectedDabId(null)} />
      )}
    </div>
  );
}
