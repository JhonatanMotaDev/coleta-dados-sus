import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function EmptyState({ icone = 'document-outline', titulo, subtitulo }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icone} size={64} color={COLORS.border} />
      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  titulo: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginTop: 16, textAlign: 'center' },
  subtitulo: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
