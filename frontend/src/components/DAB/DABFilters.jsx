import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const STATUTS = [
  { value: '',              label: 'Tous' },
  { value: 'actif',         label: 'Actif' },
  { value: 'hors_service',  label: 'Hors service' },
  { value: 'maintenance',   label: 'Maintenance' },
];

const RAYONS = [
  { value: 1,  label: '1 km' },
  { value: 2,  label: '2 km' },
  { value: 5,  label: '5 km' },
  { value: 10, label: '10 km' },
];

function ChipRow({ label, items, activeValue, onSelect, getKey, getLabel }) {
  return (
    <div className="px-4 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {items.map((item) => {
          const key   = getKey(item);
          const text  = getLabel(item);
          const active = String(activeValue) === String(key);
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex-shrink-0 h-7 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer
                ${active
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DABFilters({ onFiltersChange }) {
  const [banques, setBanques] = useState([]);
  const [filters, setFilters] = useState({ banque_id: '', statut: '', radius: 2 });

  useEffect(() => {
    api.get('/banques').then((r) => setBanques(r.data.data || [])).catch(() => {});
  }, []);

  const handleChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange(next);
  };

  const banqueItems = [{ id: '', nom: 'Toutes' }, ...banques];

  return (
    <div className="flex flex-col divide-y divide-slate-100">
      <ChipRow
        label="Banque"
        items={banqueItems}
        activeValue={filters.banque_id}
        onSelect={(v) => handleChange('banque_id', v)}
        getKey={(b) => b.id}
        getLabel={(b) => b.nom}
      />
      <ChipRow
        label="Statut"
        items={STATUTS}
        activeValue={filters.statut}
        onSelect={(v) => handleChange('statut', v)}
        getKey={(s) => s.value}
        getLabel={(s) => s.label}
      />
      <ChipRow
        label="Rayon"
        items={RAYONS}
        activeValue={filters.radius}
        onSelect={(v) => handleChange('radius', Number(v))}
        getKey={(r) => r.value}
        getLabel={(r) => r.label}
      />
    </div>
  );
}
