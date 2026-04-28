import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useClinicalRecords } from '../hooks/useClinicalRecords';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDataCurta } from '../utils/formatters';

const LARGURA = Dimensions.get('window').width - 32;
const MAX_PONTOS = 10;

export default function ChartScreen({ route }) {
  const { patient } = route.params;
  const { loading, getRecordsByType, getStats } = useClinicalRecords(patient.sus);

  const temHAS = patient.conditions?.includes('HAS');
  const temDM = patient.conditions?.includes('DM');
  const [tipoAtivo, setTipoAtivo] = useState(temHAS ? 'HAS' : 'DM');

  const registrosHAS = useMemo(() => getRecordsByType('HAS').slice(0, MAX_PONTOS).reverse(), [getRecordsByType]);
  const registrosDM = useMemo(() => getRecordsByType('DM').slice(0, MAX_PONTOS).reverse(), [getRecordsByType]);
  const statsHAS = getStats('HAS');
  const statsDM = getStats('DM');

  if (loading) return <LoadingSpinner />;

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(21, 101, 192, ${opacity})`,
    labelColor: () => COLORS.textSecondary,
    propsForDots: { r: '5', strokeWidth: '2' },
    propsForBackgroundLines: { stroke: COLORS.borderLight },
  };

  const renderHAS = () => {
    if (registrosHAS.length < 2) {
      return <EmptyState icone="stats-chart-outline" titulo="Dados insuficientes" subtitulo="Registre pelo menos 2 medições de pressão para ver o gráfico" />;
    }
    const labels = registrosHAS.map((r) => formatDataCurta(r.timestamp));
    const sistolicas = registrosHAS.map((r) => r.data.pressaoSistolica);
    const diastolicas = registrosHAS.map((r) => r.data.pressaoDiastolica);

    return (
      <>
        <Text style={styles.chartTitle}>Evolução da Pressão Arterial</Text>
        <LineChart
          data={{
            labels,
            datasets: [
              { data: sistolicas, color: () => COLORS.danger, strokeWidth: 2 },
              { data: diastolicas, color: () => COLORS.info, strokeWidth: 2 },
            ],
            legend: ['Sistólica', 'Diastólica'],
          }}
          width={LARGURA}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          fromZero={false}
          yAxisSuffix=" mmHg"
        />
        <View style={styles.legendaRow}>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.legendaText}>Sistólica</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaDot, { backgroundColor: COLORS.info }]} />
            <Text style={styles.legendaText}>Diastólica</Text>
          </View>
        </View>
        <View style={styles.refRow}>
          <Text style={styles.refText}>Referências: Normal &lt;120/80 | Estágio 1: 130-139/80-89 | Crise: ≥180/120</Text>
        </View>
        {statsHAS && (
          <View style={styles.statsGrid}>
            <StatBox titulo="Sistólica" stats={statsHAS.sistolica} unidade="mmHg" cor={COLORS.danger} />
            <StatBox titulo="Diastólica" stats={statsHAS.diastolica} unidade="mmHg" cor={COLORS.info} />
          </View>
        )}
      </>
    );
  };

  const renderDM = () => {
    const comJejum = registrosDM.filter((r) => r.data.glicemiaJejum != null);
    if (comJejum.length < 2) {
      return <EmptyState icone="stats-chart-outline" titulo="Dados insuficientes" subtitulo="Registre pelo menos 2 medições de glicemia para ver o gráfico" />;
    }
    const labels = comJejum.map((r) => formatDataCurta(r.timestamp));
    const valores = comJejum.map((r) => r.data.glicemiaJejum);

    return (
      <>
        <Text style={styles.chartTitle}>Evolução da Glicemia em Jejum</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: valores, color: () => '#E65100', strokeWidth: 2 }],
            legend: ['Glicemia Jejum'],
          }}
          width={LARGURA}
          height={220}
          chartConfig={{ ...chartConfig, color: () => '#E65100' }}
          bezier
          style={styles.chart}
          yAxisSuffix=" mg/dL"
        />
        <View style={styles.refRow}>
          <Text style={styles.refText}>Referências: Normal &lt;100 | Pré-Diabetes: 100-125 | Diabetes: ≥126 | Grave: ≥200</Text>
        </View>
        {statsDM?.glicemiaJejum && (
          <View style={styles.statsGrid}>
            <StatBox titulo="Glicemia Jejum" stats={statsDM.glicemiaJejum} unidade="mg/dL" cor="#E65100" />
          </View>
        )}
      </>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {temHAS && temDM && (
        <View style={styles.toggleRow}>
          {['HAS', 'DM'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, tipoAtivo === t && styles.toggleBtnAtivo]}
              onPress={() => setTipoAtivo(t)}
            >
              <Text style={[styles.toggleText, tipoAtivo === t && styles.toggleTextAtivo]}>
                {t === 'HAS' ? '❤️ Hipertensão' : '💧 Diabetes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {tipoAtivo === 'HAS' ? renderHAS() : renderDM()}
    </ScrollView>
  );
}

function StatBox({ titulo, stats, unidade, cor }) {
  return (
    <View style={[styles.statBox, { borderTopColor: cor, borderTopWidth: 3 }]}>
      <Text style={styles.statTitulo}>{titulo}</Text>
      <View style={styles.statRow}>
        <StatItem label="Média" valor={stats.media} unidade={unidade} />
        <StatItem label="Máx" valor={stats.max} unidade={unidade} />
        <StatItem label="Mín" valor={stats.min} unidade={unidade} />
      </View>
    </View>
  );
}

function StatItem({ label, valor, unidade }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statUnidade}>{unidade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  toggleRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnAtivo: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  toggleTextAtivo: { color: COLORS.white },
  chartTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  chart: { borderRadius: 12, marginBottom: 8 },
  legendaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaDot: { width: 10, height: 10, borderRadius: 5 },
  legendaText: { fontSize: 13, color: COLORS.textSecondary },
  refRow: { backgroundColor: COLORS.primaryLight, borderRadius: 8, padding: 10, marginBottom: 16 },
  refText: { fontSize: 11, color: COLORS.primary, lineHeight: 16 },
  statsGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statBox: { flex: 1, minWidth: 140, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statTitulo: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase' },
  statValor: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  statUnidade: { fontSize: 10, color: COLORS.textSecondary },
});
