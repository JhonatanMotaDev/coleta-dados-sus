import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function MetricCard({ label, valor, unidade, cor, subtexto }) {
  return (
    <View style={[styles.card, cor && { borderLeftColor: cor, borderLeftWidth: 4 }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={[styles.valor, cor && { color: cor }]}>{valor ?? '—'}</Text>
        {unidade ? <Text style={styles.unidade}>{unidade}</Text> : null}
      </View>
      {subtexto ? <Text style={styles.subtexto}>{subtexto}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, flex: 1, margin: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  label: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'baseline' },
  valor: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary },
  unidade: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4, marginBottom: 2 },
  subtexto: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
});
