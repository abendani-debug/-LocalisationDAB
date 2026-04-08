import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Rechercher un DAB…' }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db', borderRadius: '0.375rem',
          fontSize: '0.9rem', outline: 'none',
        }}
      />
      <button type="submit" style={{
        padding: '0.5rem 1rem', background: '#3b82f6',
        color: '#fff', border: 'none', borderRadius: '0.375rem',
        cursor: 'pointer', fontWeight: 600,
      }}>
        🔍
      </button>
    </form>
  );
}
