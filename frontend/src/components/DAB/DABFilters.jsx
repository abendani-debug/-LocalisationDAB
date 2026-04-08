import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

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

  const selectStyle = {
    padding: '0.6rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    background: '#fff',
    width: '100%',
    minHeight: '44px',
    appearance: 'auto',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem' }}>
      <div>
        <label style={labelStyle}>Banque</label>
        <select value={filters.banque_id} onChange={(e) => handleChange('banque_id', e.target.value)} style={selectStyle}>
          <option value="">Toutes les banques</option>
          {banques.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Statut</label>
        <select value={filters.statut} onChange={(e) => handleChange('statut', e.target.value)} style={selectStyle}>
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="hors_service">Hors service</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Rayon de recherche</label>
        <select value={filters.radius} onChange={(e) => handleChange('radius', e.target.value)} style={selectStyle}>
          <option value="1">1 km</option>
          <option value="2">2 km</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
        </select>
      </div>
    </div>
  );
}
