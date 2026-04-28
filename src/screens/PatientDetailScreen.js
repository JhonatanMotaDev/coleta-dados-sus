import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useClinicalRecords } from '../hooks/useClinicalRecords';
import ClinicalBadge from '../components/ClinicalBadge';
import RiskBadge from '../components/RiskBadge';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatData } from '../utils/formatters';

export default function PatientDetailScreen({ route, navigation }) {
  const { patient } = route.params;
  const { records, loading, getLastRecord, getStats } = useClinicalRecords(patient.sus);

  const ultimoHAS = getLastRecord('HAS');
  const ultimoDM = getLastRecord('DM');
  const statsHAS = getStats('HAS');
  const statsDM = getStats('DM');

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <View style={styles.avatarGrande}>
          <Ionicons name="person" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.nome}>{patient.nome}</Text>
        <Text style={styles.sus}>SUS: {patient.sus}</Text>
        <View style={styles.badgesRow}>
          {patient.conditions?.map((c) => <ClinicalBadge key={c} tipo={c} />)}
        </View>
      </LinearGradient>

      {/* Botões de nova medição */}
      <View style={styles.botoesRow}>
        {patient.conditions?.includes('HAS') && (
          <TouchableOpacity
            style={[styles.btnMedicao, { backgroundColor: COLORS.danger }]}
            onPress={() => navigation.navigate('HASForm', { patient })}
          >
            <Ionicons name="heart" size={20} color={COLORS.white} />
            <Text style={styles.btnMedicaoText}>Nova Medição HAS</Text>
          </TouchableOpacity>
        )}
        {patient.conditions?.includes('DM') && (
          <TouchableOpacity
            style={[styles.btnMedicao, { backgroundColor: '#E65100' }]}
            onPress={() => navigation.navigate('DMForm', { patient })}
          >
            <Ionicons name="water" size={20} color={COLORS.white} />
            <Text style={styles.btnMedicaoText}>Nova Medição DM</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Último registro HAS */}
      {ultimoHAS && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Último Registro — Hipertensão</Text>
          <Text style={styles.dataRegistro}>{formatData(ultimoHAS.timestamp)}</Text>
          <View style={styles.metricsRow}>
            <MetricCard
              label="Sistólica"
              valor={ultimoHAS.data.pressaoSistolica}
              unidade="mmHg"
              cor={ultimoHAS.riskColor}
            />
            <MetricCard
              label="Diastólica"
              valor={ultimoHAS.data.pressaoDiastolica}
              unidade="mmHg"
              cor={ultimoHAS.riskColor}
            />
            <MetricCard
              label="FC"
              valor={ultimoHAS.data.frequenciaCardiaca}
              unidade="bpm"
            />
          </View>
          <View style={styles.riskRow}>
            <RiskBadge label={ultimoHAS.riskLabel} color={ultimoHAS.riskColor} />
          </View>
          {statsHAS && (
            <View style={styles.statsBox}>
              <Text style={styles.statsTitle}>Estatísticas (todos os registros)</Text>
              <Text style={styles.statsText}>
                Sistólica — Média: {statsHAS.sistolica.media} | Máx: {statsHAS.sistolica.max} | Mín: {statsHAS.sistolica.min}
              </Text>
              <Text style={styles.statsText}>
                Diastólica — Média: {statsHAS.diastolica.media} | Máx: {statsHAS.diastolica.max} | Mín: {statsHAS.diastolica.min}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Último registro DM */}
      {ultimoDM && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Último Registro — Diabetes</Text>
          <Text style={styles.dataRegistro}>{formatData(ultimoDM.timestamp)}</Text>
          <View style={styles.metricsRow}>
            <MetricCard
              label="Jejum"
              valor={ultimoDM.data.glicemiaJejum}
              unidade="mg/dL"
              cor={ultimoDM.riskColor}
            />
            <MetricCard
              label="Pós-Prandial"
              valor={ultimoDM.data.glicemiaPosPrandial}
              unidade="mg/dL"
            />
            <MetricCard
              label="HbA1c"
              valor={ultimoDM.data.hemoglobinaGlicada}
              unidade="%"
            />
          </View>
          <View style={styles.riskRow}>
            <RiskBadge label={ultimoDM.riskLabel} color={ultimoDM.riskColor} />
          </View>
          {statsDM?.glicemiaJejum && (
            <View style={styles.statsBox}>
              <Text style={styles.statsTitle}>Estatísticas — Glicemia em Jejum</Text>
              <Text style={styles.statsText}>
                Média: {statsDM.glicemiaJejum.media} | Máx: {statsDM.glicemiaJejum.max} | Mín: {statsDM.glicemiaJejum.min} mg/dL
              </Text>
            </View>
          )}
        </View>
      )}

      {records.length === 0 && (
        <View style={styles.semRegistros}>
          <Ionicons name="clipboard-outline" size={48} color={COLORS.border} />
          <Text style={styles.semRegistrosText}>Nenhum registro ainda</Text>
          <Text style={styles.semRegistrosSub}>Use os botões acima para registrar medições</Text>
        </View>
      )}

      {/* Botões de navegação */}
      <View style={styles.navBotoes}>
        <TouchableOpacity
          style={styles.btnNav}
          onPress={() => navigation.navigate('History', { patient })}
        >
          <Ionicons name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.btnNavText}>Histórico Completo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnNav}
          onPress={() => navigation.navigate('Chart', { patient })}
        >
          <Ionicons name="stats-chart-outline" size={20} color={COLORS.secondary} />
          <Text style={[styles.btnNavText, { color: COLORS.secondary }]}>Ver Gráficos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  header: { paddingTop: 24, paddingBottom: 28, alignItems: 'center' },
  avatarGrande: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  nome: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  sus: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  badgesRow: { flexDirection: 'row', marginTop: 10, gap: 6 },
  botoesRow: { flexDirection: 'row', padding: 16, gap: 10 },
  btnMedicao: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 14, gap: 8,
  },
  btnMedicaoText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  section: {
    backgroundColor: COLORS.surface, margin: 16, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  dataRegistro: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 },
  metricsRow: { flexDirection: 'row', marginHorizontal: -4 },
  riskRow: { marginTop: 12, alignItems: 'flex-start' },
  statsBox: { marginTop: 12, backgroundColor: COLORS.background, borderRadius: 10, padding: 12 },
  statsTitle: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  statsText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  semRegistros: { alignItems: 'center', padding: 40 },
  semRegistrosText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginTop: 12 },
  semRegistrosSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
  navBotoes: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  btnNav: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, padding: 12, gap: 6,
  },
  btnNavText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
});
