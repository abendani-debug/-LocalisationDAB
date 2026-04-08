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

  /* Highlight animation DAB marker */
  @keyframes dabHighlight {
    0%        { transform: scale(1)    translateX(0);    }
    8%        { transform: scale(1.45) translateX(0);    }
    18%       { transform: scale(1.45) translateX(-6px); }
    28%       { transform: scale(1.45) translateX(6px);  }
    38%       { transform: scale(1.45) translateX(-6px); }
    48%       { transform: scale(1.45) translateX(6px);  }
    58%       { transform: scale(1.45) translateX(-6px); }
    68%       { transform: scale(1.45) translateX(6px);  }
    80%       { transform: scale(1.45) translateX(0);    }
    100%      { transform: scale(1)    translateX(0);    }
  }

  .dab-marker-highlighted {
    animation: dabHighlight 1.6s ease-in-out forwards;
    transform-origin: bottom center;
    z-index: 9999 !important;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
