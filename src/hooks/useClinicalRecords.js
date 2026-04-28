import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storageKeys';

export const useClinicalRecords = (patientSus) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    if (!patientSus) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEYS.getRecordsKey(patientSus));
      const lista = data ? JSON.parse(data) : [];
      setRecords(lista.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [patientSus]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const persist = async (lista) => {
    await AsyncStorage.setItem(STORAGE_KEYS.getRecordsKey(patientSus), JSON.stringify(lista));
    setRecords(lista.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const addRecord = async (recordData) => {
    try {
      const novo = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientSus,
        timestamp: new Date().toISOString(),
        ...recordData,
      };
      const lista = [novo, ...records];
      await persist(lista);
      return { success: true, record: novo };
    } catch {
      return { success: false, error: 'Erro ao salvar registro' };
    }
  };

  const deleteRecord = async (recordId) => {
    try {
      const lista = records.filter((r) => r.id !== recordId);
      await persist(lista);
      return { success: true };
    } catch {
      return { success: false, error: 'Erro ao excluir registro' };
    }
  };

  const getRecordsByType = (type) => records.filter((r) => r.type === type);

  const getLastRecord = (type) => {
    const filtrados = type ? records.filter((r) => r.type === type) : records;
    return filtrados.length > 0 ? filtrados[0] : null;
  };

  const getStats = (type) => {
    const filtrados = getRecordsByType(type);
    if (filtrados.length === 0) return null;
    if (type === 'HAS') {
      const sistolicas = filtrados.map((r) => r.data.pressaoSistolica).filter(Boolean);
      const diastolicas = filtrados.map((r) => r.data.pressaoDiastolica).filter(Boolean);
      return {
        sistolica: {
          media: Math.round(sistolicas.reduce((a, b) => a + b, 0) / sistolicas.length),
          max: Math.max(...sistolicas),
          min: Math.min(...sistolicas),
        },
        diastolica: {
          media: Math.round(diastolicas.reduce((a, b) => a + b, 0) / diastolicas.length),
          max: Math.max(...diastolicas),
          min: Math.min(...diastolicas),
        },
      };
    }
    if (type === 'DM') {
      const jejum = filtrados.map((r) => r.data.glicemiaJejum).filter(Boolean);
      return {
        glicemiaJejum: jejum.length > 0 ? {
          media: Math.round(jejum.reduce((a, b) => a + b, 0) / jejum.length),
          max: Math.max(...jejum),
          min: Math.min(...jejum),
        } : null,
      };
    }
    return null;
  };

  return { records, loading, loadRecords, addRecord, deleteRecord, getRecordsByType, getLastRecord, getStats };
};
