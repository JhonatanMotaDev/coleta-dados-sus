import React, { useState, useMemo } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet,
  Share, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subDays } from 'date-fns';
import { COLORS } from '../constants/colors';
import { useClinicalRecords } from '../hooks/useClinicalRecords';
import RiskBadge from '../components/RiskBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatGroupDate, formatHora, formatData } from '../utils/formatters';

const FILTROS_TIPO = ['Todos', 'HAS', 'DM'];
const FILTROS_PERIODO = [
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: '90 dias', dias: 90 },
  { label: 'Tudo', dias: null },
];

export default function HistoryScreen({ route, navigation }) {
  const { patient } = route.params;
  const { records, loading, loadRecords, deleteRecord } = useClinicalRecords(patient.sus);
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [periodoFiltro, setPeriodoFiltro] = useState(null);
  const [expandidos, setExpandidos] = useState({});

  const registrosFiltrados = useMemo(() => {
    let lista = [...records];
    if (tipoFiltro !== 'Todos') lista = lista.filter((r) => r.type === tipoFiltro);
    if (periodoFiltro) {
      const limite = subDays(new Date(), periodoFiltro);
      lista = lista.filter((r) => new Date(r.timestamp) >= limite);
    }
    return lista;
  }, [records, tipoFiltro, periodoFiltro]);

  const secoes = useMemo(() => {
    const grupos = {};
    for (const r of registrosFiltrados) {
      const chave = r.timestamp.split('T')[0];
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(r);
    }
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([data, items]) => ({ title: formatGroupDate(data + 'T12:00:00'), data: items }));
  }, [registrosFiltrados]);

  const toggleExpandir = (id) => setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = (record) => {
    Alert.alert('Excluir Registro', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteRecord(record.id) },
    ]);
  };

  const handleExportar = async () => {
    const linhas = registrosFiltrados.map((r) => {
      const base = `[${formatData(r.timestamp)}] ${r.type} — ${r.riskLabel}`;
      if (r.type === 'HAS') {
        return `${base}\n  PA: ${r.data.pressaoSistolica}/${r.data.pressaoDiastolica} mmHg | FC: ${r.data.frequenciaCardiaca} bpm${r.data.observacoes ? '\n  Obs: ' + r.data.observacoes : ''}`;
      }
      const campos = [];
      if (r.data.glicemiaJejum) campos.push(`Jejum: ${r.data.glicemiaJejum} mg/dL`);
      if (r.data.glicemiaPosPrandial) campos.push(`Pós-Prandial: ${r.data.glicemiaPosPrandial} mg/dL`);
      if (r.data.hemoglobinaGlicada) campos.push(`HbA1c: ${r.data.hemoglobinaGlicada}%`);
      return `${base}\n  ${campos.join(' | ')}${r.data.observacoes ? '\n  Obs: ' + r.data.observacoes : ''}`;
    });

    const texto = `HISTÓRICO CLÍNICO — ${patient.nome}\nSUS: ${patient.sus}\n\n${linhas.join('\n\n')}`;
    await Share.share({ message: texto, title: `Histórico — ${patient.nome}` });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* Filtros tipo */}
      <View style={styles.filtrosRow}>
        {FILTROS_TIPO.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBtn, tipoFiltro === f && styles.filtroBtnAtivo]}
            onPress={() => setTipoFiltro(f)}
          >
            <Text style={[styles.filtroText, tipoFiltro === f && styles.filtroTextAtivo]}>{f}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportar}>
          <Ionicons name="share-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtros período */}
      <View style={styles.filtrosRow}>
        {FILTROS_PERIODO.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filtroBtn, periodoFiltro === f.dias && styles.filtroBtnAtivo]}
            onPress={() => setPeriodoFiltro(f.dias)}
          >
            <Text style={[styles.filtroText, periodoFiltro === f.dias && styles.filtroTextAtivo]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={secoes}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <RegistroItem
            record={item}
            expandido={expandidos[item.id]}
            onToggle={() => toggleExpandir(item.id)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icone="time-outline"
            titulo="Nenhum registro encontrado"
            subtitulo="Ajuste os filtros ou registre uma nova medição"
          />
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRecords} />}
        contentContainerStyle={secoes.length === 0 ? { flex: 1 } : { paddingBottom: 40 }}
      />
    </View>
  );
}

function RegistroItem({ record, expandido, onToggle, onDelete }) {
  const isHAS = record.type === 'HAS';
  const resumo = isHAS
    ? `${record.data.pressaoSistolica}/${record.data.pressaoDiastolica} mmHg | FC: ${record.data.frequenciaCardiaca} bpm`
    : [
        record.data.glicemiaJejum && `Jejum: ${record.data.glicemiaJejum}`,
        record.data.glicemiaPosPrandial && `Pós: ${record.data.glicemiaPosPrandial}`,
        record.data.hemoglobinaGlicada && `HbA1c: ${record.data.hemoglobinaGlicada}%`,
      ].filter(Boolean).join(' | ');

  return (
    <TouchableOpacity style={styles.item} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.itemHeader}>
        <View style={[styles.typeBadge, { backgroundColor: isHAS ? COLORS.dangerLight : '#FFF3E0' }]}>
          <Text style={[styles.typeText, { color: isHAS ? COLORS.danger : '#E65100' }]}>{record.type}</Text>
        </View>
        <Text style={styles.hora}>{formatHora(record.timestamp)}</Text>
        <View style={{ flex: 1 }} />
        <RiskBadge label={record.riskLabel} color={record.riskColor} size="small" />
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
        <Ionicons name={expandido ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.resumo}>{resumo}</Text>
      {expandido && (
        <View style={styles.detalhes}>
          {isHAS ? (
            <>
              <DetalheRow label="Sistólica" valor={`${record.data.pressaoSistolica} mmHg`} />
              <DetalheRow label="Diastólica" valor={`${record.data.pressaoDiastolica} mmHg`} />
              <DetalheRow label="Freq. Cardíaca" valor={`${record.data.frequenciaCardiaca} bpm`} />
            </>
          ) : (
            <>
              {record.data.glicemiaJejum != null && <DetalheRow label="Glicemia Jejum" valor={`${record.data.glicemiaJejum} mg/dL`} />}
              {record.data.glicemiaPrePrandial != null && <DetalheRow label="Pré-Prandial" valor={`${record.data.glicemiaPrePrandial} mg/dL`} />}
              {record.data.glicemiaPosPrandial != null && <DetalheRow label="Pós-Prandial" valor={`${record.data.glicemiaPosPrandial} mg/dL`} />}
              {record.data.hemoglobinaGlicada != null && <DetalheRow label="HbA1c" valor={`${record.data.hemoglobinaGlicada}%`} />}
            </>
          )}
          {record.data.observacoes ? <DetalheRow label="Observações" valor={record.data.observacoes} /> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

function DetalheRow({ label, valor }) {
  return (
    <View style={styles.detalheRow}>
      <Text style={styles.detalheLabel}>{label}:</Text>
      <Text style={styles.detalheValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filtrosRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: 'center' },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filtroBtnAtivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filtroText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  filtroTextAtivo: { color: COLORS.white, fontWeight: '700' },
  exportBtn: { marginLeft: 'auto', padding: 6 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.background },
  item: { backgroundColor: COLORS.surface, marginHorizontal: 16, marginVertical: 4, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 11, fontWeight: '700' },
  hora: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  deleteBtn: { padding: 2 },
  resumo: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  detalhes: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  detalheRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  detalheLabel: { fontSize: 13, color: COLORS.textSecondary },
  detalheValor: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
});
