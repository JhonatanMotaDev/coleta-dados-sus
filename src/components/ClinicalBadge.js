import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const CONFIG = {
  HAS: { label: 'HAS', bg: COLORS.dangerLight, text: COLORS.danger },
  DM: { label: 'DM', bg: '#FFF3E0', text: '#E65100' },
};

export default function ClinicalBadge({ tipo }) {
  const cfg = CONFIG[tipo];
  if (!cfg) return null;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.texto, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 4 },
  texto: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
