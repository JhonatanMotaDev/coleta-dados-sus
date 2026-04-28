import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RiskBadge({ label, color, size = 'normal' }) {
  if (!label || !color) return null;
  const small = size === 'small';
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }, small && styles.small]}>
      <View style={[styles.dot, { backgroundColor: color }, small && styles.dotSmall]} />
      <Text style={[styles.texto, { color }, small && styles.textoSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  small: { paddingHorizontal: 7, paddingVertical: 3 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  dotSmall: { width: 5, height: 5, marginRight: 4 },
  texto: { fontSize: 13, fontWeight: '600' },
  textoSmall: { fontSize: 11 },
});
