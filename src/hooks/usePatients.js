import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storageKeys';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PATIENTS);
      setPatients(data ? JSON.parse(data) : []);
    } catch (e) {
      setError('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const persistPatients = async (lista) => {
    await AsyncStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(lista));
    setPatients(lista);
  };

  const savePatient = async (patient) => {
    try {
      const lista = [...patients];
      const idx = lista.findIndex((p) => p.sus === patient.sus);
      const agora = new Date().toISOString();
      if (idx >= 0) {
        lista[idx] = { ...lista[idx], ...patient, updatedAt: agora };
      } else {
        lista.push({ ...patient, createdAt: agora, updatedAt: agora });
      }
      await persistPatients(lista);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Erro ao salvar paciente' };
    }
  };

  const deletePatient = async (sus) => {
    try {
      const lista = patients.filter((p) => p.sus !== sus);
      await persistPatients(lista);
      await AsyncStorage.removeItem(STORAGE_KEYS.getRecordsKey(sus));
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Erro ao excluir paciente' };
    }
  };

  const findPatientBySus = (sus) => patients.find((p) => p.sus === sus) || null;

  return { patients, loading, error, loadPatients, savePatient, deletePatient, findPatientBySus };
};
