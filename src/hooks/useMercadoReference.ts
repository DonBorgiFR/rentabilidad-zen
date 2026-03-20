import { useState, useEffect } from 'react';

export interface PrecioVentaRef {
  precio_mediana: number;
  precio_media: number;
  precio_m2_mediana: number;
  precio_m2_media: number;
  precio_p25: number;
  precio_p75: number;
  precio_min: number;
  precio_max: number;
  total_muestra: number;
  zona: string;
}

export interface PrecioAlquilerRef {
  alquiler_mediana: number;
  alquiler_media: number;
  alquiler_m2_mediana: number;
  alquiler_m2_media: number;
  alquiler_p25: number;
  alquiler_p75: number;
  total_muestra: number;
  zona: string;
}

const API_BASE = 'http://localhost:3001/api';

export function usePrecioVentaRef(
  municipio: string,
  habitaciones?: number,
  superficieMin?: number,
  superficieMax?: number,
  barrio?: string
) {
  const [data, setData] = useState<PrecioVentaRef | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!municipio) return;
    
    const params = new URLSearchParams({ municipio });
    if (habitaciones) params.set('habitaciones', String(habitaciones));
    if (superficieMin) params.set('superficie_min', String(superficieMin));
    if (superficieMax) params.set('superficie_max', String(superficieMax));
    if (barrio) params.set('barrio', barrio);

    let isMounted = true;
    setLoading(true);

    fetch(`${API_BASE}/precio-venta?${params}`)
      .then(r => r.json())
      .then(d => {
        if (!isMounted) return;
        if (d.error) {
          setError(d.error);
          setData(null);
        } else {
          setData(d);
          setError(null);
        }
        setLoading(false);
      })
      .catch(e => {
        if (!isMounted) return;
        setError(e.message);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [municipio, habitaciones, superficieMin, superficieMax, barrio]);

  return { data, loading, error };
}

export function usePrecioAlquilerRef(
  municipio: string,
  habitaciones?: number,
  superficieMin?: number,
  superficieMax?: number,
  barrio?: string
) {
  const [data, setData] = useState<PrecioAlquilerRef | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!municipio) return;
    
    const params = new URLSearchParams({ municipio });
    if (habitaciones) params.set('habitaciones', String(habitaciones));
    if (superficieMin) params.set('superficie_min', String(superficieMin));
    if (superficieMax) params.set('superficie_max', String(superficieMax));
    if (barrio) params.set('barrio', barrio);

    let isMounted = true;
    setLoading(true);

    fetch(`${API_BASE}/precio-alquiler?${params}`)
      .then(r => r.json())
      .then(d => {
        if (!isMounted) return;
        if (d.error) {
          setError(d.error);
          setData(null);
        } else {
          setData(d);
          setError(null);
        }
        setLoading(false);
      })
      .catch(e => {
        if (!isMounted) return;
        setError(e.message);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [municipio, habitaciones, superficieMin, superficieMax, barrio]);

  return { data, loading, error };
}
