import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { usePatients } from '../hooks/usePatients';
import { STORAGE_KEYS } from '../utils/storageKeys';
import PatientCard from '../components/PatientCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PatientListScreen({ navigation }) {
  const { patients, loading, loadPatients, deletePatient } = usePatients();
  const [busca, setBusca] = useState('');
  const [ultimosRegistros, setUltimosRegistros] = useState({});

  const carregarUltimosRegistros = useCallback(async () => {
    const mapa = {};
    for (const p of patients) {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.getRecordsKey(p.sus));
        if (data) {
          const registros = JSON.parse(data);
          if (registros.length > 0) {
            mapa[p.sus] = registros.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
          }
        }
      } catch { /* ignora */ }
    }
    setUltimosRegistros(mapa);
  }, [patients]);

  useEffect(() => { carregarUltimosRegistros(); }, [carregarUltimosRegistros]);

  const handleDelete = (patient) => {
    Alert.alert(
      'Excluir Paciente',
      `Deseja excluir ${patient.nome} e todos os seus registros?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            const result = await deletePatient(patient.sus);
            if (!result.success) Alert.alert('Erro', result.error);
          },
        },
      ]
    );
  };

  const pacientesFiltrados = patients
    .filter((p) => {
      const q = busca.toLowerCase();
      return p.nome.toLowerCase().includes(q) || p.sus.includes(q);
    })
    .sort((a, b) => {
      const ua = ultimosRegistros[a.sus]?.timestamp || a.updatedAt;
      const ub = ultimosRegistros[b.sus]?.timestamp || b.updatedAt;
      return new Date(ub) - new Date(ua);
    });

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou SUS..."
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor={COLORS.textSecondary}
        />
        {busca ? (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={pacientesFiltrados}
        keyExtractor={(item) => item.sus}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            ultimoRegistro={ultimosRegistros[item.sus]}
            onPress={() => navigation.navigate('PatientDetail', { patient: item })}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icone="people-outline"
            titulo={busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            subtitulo={busca ? 'Tente outro termo de busca' : 'Cadastre o primeiro paciente na tela inicial'}
          />
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPatients} />}
        contentContainerStyle={pacientesFiltrados.length === 0 ? { flex: 1 } : { paddingBottom: 80 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
});
