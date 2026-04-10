import { useState, useEffect, useCallback } from 'react';
import { getNearbyDABs, getDABs } from '../api/dabApi';

export default function useDABs(position, filters = {}) {
  const [dabs, setDabs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const fetchDABs = useCallback(async () => {
    if (!position) return;
    setLoading(true);
    setError(null);
    try {
      const extra = {};
      if (filters.banque_id) extra.banque_id = filters.banque_id;
      if (filters.statut)    extra.statut    = filters.statut;
      const res = position.lat
        ? await getNearbyDABs(position.lat, position.lng, filters.radius || 2, extra)
        : await getDABs(filters);
      setDabs(res.data || []);
    } catch {
      setError('Impossible de charger les DAB.');
    } finally {
      setLoading(false);
    }
  }, [position, filters.radius, filters.banque_id, filters.statut]);

  useEffect(() => { fetchDABs(); }, [fetchDABs]);

  const updateDAB = useCallback((dabId, updates) => {
    setDabs((prev) =>
      prev.map((d) => (d.id === dabId ? { ...d, ...updates } : d))
    );
  }, []);

  return { dabs, loading, error, refetch: fetchDABs, updateDAB };
}
