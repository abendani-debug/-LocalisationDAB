import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import App from './App';

// Fix icône Leaflet (bug connu avec bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Reset CSS minimal
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
  a { color: inherit; }
  button { font-family: inherit; }

  /* Responsive utilities */
  @media (max-width: 640px) {
    .desktop-only { display: none !important; }
  }
  @media (min-width: 641px) {
    .mobile-only { display: none !important; }
  }

  /* Touch-friendly tap targets */
  @media (max-width: 640px) {
    button, a, [role="button"] { min-height: 44px; }
    input, select, textarea { font-size: 16px !important; } /* Prevents zoom on iOS */
  }

  /* Leaflet controls mobile spacing */
  @media (max-width: 640px) {
    .leaflet-control-zoom { margin-bottom: 80px !important; }
    .leaflet-top.leaflet-right { top: auto !important; bottom: 140px !important; }
  }

  /* Bottom sheet transition */
  .bottom-sheet {
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Animation cinématique DAB marker ───────────────────────── */
  @keyframes dabSpring {
    0%   { transform: scale(1);    filter: none; }
    10%  { transform: scale(2.65); filter: drop-shadow(0 0 26px #60a5fa) drop-shadow(0 0 12px #2563eb); }
    20%  { transform: scale(1.82); filter: drop-shadow(0 0 14px #3b82f6); }
    34%  { transform: scale(2.32); filter: drop-shadow(0 0 22px #2563eb) drop-shadow(0 0 10px #1d4ed8); }
    48%  { transform: scale(1.97); filter: drop-shadow(0 0 16px #2563eb); }
    63%  { transform: scale(2.20); filter: drop-shadow(0 0 18px #2563eb) drop-shadow(0 0 8px #2563eb); }
    79%  { transform: scale(2.06); filter: drop-shadow(0 0 16px #2563eb); }
    100% { transform: scale(2.1);  filter: drop-shadow(0 0 16px #2563eb) drop-shadow(0 0 8px #2563eb) drop-shadow(0 0 3px #1d4ed8); }
  }

  .dab-marker-highlighted {
    z-index: 9999 !important;
  }

  /* Base : aucune transition par défaut pour ne pas interférer avec le zoom Leaflet */
  .dab-icon-inner {
    transform-origin: bottom center;
    will-change: transform;
  }

  /* Transition uniquement quand actif ou en cours d'animation */
  .dab-marker-active .dab-icon-inner,
  .dab-marker-highlighted .dab-icon-inner {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                filter   0.3s ease;
  }

  .dab-marker-highlighted .dab-icon-inner {
    animation: dabSpring 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .dab-marker-active .dab-icon-inner {
    transform: scale(2.1);
    filter: drop-shadow(0 0 16px #2563eb) drop-shadow(0 0 8px #2563eb) drop-shadow(0 0 3px #1d4ed8);
  }

  /* Désactiver filter pendant l'animation de zoom Leaflet pour éviter les disparitions */
  .leaflet-zoom-anim .dab-icon-inner {
    filter: none !important;
    transition: none !important;
    animation: none !important;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
