import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ClinicalBadge from './ClinicalBadge';
import RiskBadge from './RiskBadge';
import { formatSUSMascarado, formatData } from '../utils/formatters';

export default function PatientCard({ patient, ultimoRegistro, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={COLORS.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={1}>{patient.nome}</Text>
          <Text style={styles.sus}>SUS: {formatSUSMascarado(patient.sus)}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.badges}>
        {patient.conditions?.map((c) => <ClinicalBadge key={c} tipo={c} />)}
      </View>

      {ultimoRegistro ? (
        <View style={styles.footer}>
          <Text style={styles.dataTexto}>
            Último: {formatData(ultimoRegistro.timestamp)}
          </Text>
          {ultimoRegistro.riskLabel ? (
            <RiskBadge label={ultimoRegistro.riskLabel} color={ultimoRegistro.riskColor} size="small" />
          ) : null}
        </View>
      ) : (
        <Text style={styles.semRegistro}>Nenhum registro ainda</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginHorizontal: 16, marginVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  sus: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  deleteBtn: { padding: 4 },
  badges: { flexDirection: 'row', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dataTexto: { fontSize: 12, color: COLORS.textSecondary },
  semRegistro: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' },
});
