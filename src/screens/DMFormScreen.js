import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { validateGlucose, validateHbA1c } from '../utils/validators';
import {
  classifyGlicemiaJejum,
  classifyGlicemiaPosPrandial,
  classifyHbA1c,
  classifyDMComposto,
} from '../utils/riskClassification';
import { DM_ORIENTATIONS } from '../constants/clinicalThresholds';
import { useClinicalRecords } from '../hooks/useClinicalRecords';
import RiskBadge from '../components/RiskBadge';

export default function DMFormScreen({ route, navigation }) {
  const { patient } = route.params;
  const { addRecord } = useClinicalRecords(patient.sus);

  const [jejum, setJejum] = useState('');
  const [prePrandial, setPrePrandial] = useState('');
  const [posPrandial, setPosPrandial] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [obs, setObs] = useState('');
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);

  const clsJejum = jejum ? classifyGlicemiaJejum(jejum) : null;
  const clsPos = posPrandial ? classifyGlicemiaPosPrandial(posPrandial) : null;
  const clsHba1c = hba1c ? classifyHbA1c(hba1c) : null;

  const validar = () => {
    const novosErros = {};
    if (!jejum && !posPrandial && !hba1c) {
      novosErros.geral = 'Preencha pelo menos um campo de glicemia ou HbA1c';
    }
    if (jejum && validateGlucose(jejum)) novosErros.jejum = validateGlucose(jejum);
    if (prePrandial && validateGlucose(prePrandial)) novosErros.prePrandial = validateGlucose(prePrandial);
    if (posPrandial && validateGlucose(posPrandial)) novosErros.posPrandial = validateGlucose(posPrandial);
    if (hba1c && validateHbA1c(hba1c)) novosErros.hba1c = validateHbA1c(hba1c);
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validar()) return;
    setSalvando(true);

    const dadosGlicemia = {
      glicemiaJejum: jejum ? Number(jejum) : null,
      glicemiaPrePrandial: prePrandial ? Number(prePrandial) : null,
      glicemiaPosPrandial: posPrandial ? Number(posPrandial) : null,
      hemoglobinaGlicada: hba1c ? Number(hba1c) : null,
      observacoes: obs,
    };

    const composto = classifyDMComposto(dadosGlicemia);

    // Alertas críticos
    if (jejum && Number(jejum) <= 70) {
      Alert.alert('🚨 HIPOGLICEMIA', 'Oferecer 15g de carboidrato de absorção rápida!\nReavaliar em 15 minutos.\nSe inconsciente: SAMU 192', [{ text: 'Entendido', style: 'destructive' }]);
    } else if (jejum && Number(jejum) >= 300) {
      Alert.alert('🚨 HIPERGLICEMIA GRAVE', 'Avaliar sinais de cetoacidose!\nEncaminhar para avaliação médica urgente.', [{ text: 'Entendido', style: 'destructive' }]);
    } else if (hba1c && Number(hba1c) > 9) {
      Alert.alert('⚠️ Diabetes Descompensado', 'HbA1c > 9% — Revisar tratamento urgentemente.');
    }

    const result = await addRecord({
      type: 'DM',
      data: dadosGlicemia,
      riskLevel: composto?.level || 'normal',
      riskColor: composto?.color || COLORS.riskNormal,
      riskLabel: composto?.label || 'Normal',
    });

    setSalvando(false);
    if (result.success) {
      setUltimoRegistro(result.record);
      setModalVisible(true);
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const fecharModal = () => {
    setModalVisible(false);
    setJejum(''); setPrePrandial(''); setPosPrandial(''); setHba1c(''); setObs(''); setErros({});
    navigation.goBack();
  };

  const orientacoes = ultimoRegistro
    ? DM_ORIENTATIONS(ultimoRegistro.data.glicemiaJejum, ultimoRegistro.data.hemoglobinaGlicada)
    : [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.pacienteInfo}>
          <Ionicons name="person-circle" size={24} color="#E65100" />
          <Text style={[styles.pacienteNome, { color: '#E65100' }]}>{patient.nome}</Text>
        </View>

        {erros.geral ? <Text style={styles.erroGeral}>{erros.geral}</Text> : null}

        <CampoGlicemia label="Glicemia em Jejum (mg/dL)" value={jejum} onChangeText={setJejum} placeholder="Ex: 95" erro={erros.jejum} classificacao={clsJejum} />
        <CampoGlicemia label="Glicemia Pré-Prandial (mg/dL)" value={prePrandial} onChangeText={setPrePrandial} placeholder="Ex: 110" erro={erros.prePrandial} />
        <CampoGlicemia label="Glicemia Pós-Prandial (mg/dL)" value={posPrandial} onChangeText={setPosPrandial} placeholder="Ex: 140" erro={erros.posPrandial} classificacao={clsPos} />
        <CampoGlicemia label="Hemoglobina Glicada HbA1c (%)" value={hba1c} onChangeText={setHba1c} placeholder="Ex: 6.5" erro={erros.hba1c} classificacao={clsHba1c} decimal />

        <View style={styles.field}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Medicações em uso, sintomas..."
            value={obs}
            onChangeText={setObs}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.btnSalvar, salvando && styles.btnDisabled]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Ionicons name="save" size={20} color={COLORS.white} />
          <Text style={styles.btnText}>{salvando ? 'Salvando...' : 'Salvar Registro'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>✅ Registro Salvo</Text>
            {ultimoRegistro && (
              <>
                <View style={styles.modalMetricas}>
                  {ultimoRegistro.data.glicemiaJejum != null && (
                    <Text style={styles.modalValor}>Jejum: {ultimoRegistro.data.glicemiaJejum} mg/dL</Text>
                  )}
                  {ultimoRegistro.data.glicemiaPosPrandial != null && (
                    <Text style={styles.modalValor}>Pós-Prandial: {ultimoRegistro.data.glicemiaPosPrandial} mg/dL</Text>
                  )}
                  {ultimoRegistro.data.hemoglobinaGlicada != null && (
                    <Text style={styles.modalValor}>HbA1c: {ultimoRegistro.data.hemoglobinaGlicada}%</Text>
                  )}
                </View>
                <RiskBadge label={ultimoRegistro.riskLabel} color={ultimoRegistro.riskColor} />
                <Text style={styles.orientacoesTitle}>Orientações:</Text>
                {orientacoes.map((o, i) => (
                  <Text key={i} style={styles.orientacaoItem}>• {o}</Text>
                ))}
              </>
            )}
            <TouchableOpacity style={styles.btnFechar} onPress={fecharModal}>
              <Text style={styles.btnFecharText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function CampoGlicemia({ label, value, onChangeText, placeholder, erro, classificacao, decimal }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputFlex, erro && styles.inputError, classificacao && { borderColor: classificacao.color }]}
          value={value}
          onChangeText={(t) => onChangeText(decimal ? t.replace(/[^0-9.]/g, '') : t.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          keyboardType="numeric"
        />
        {classificacao && <RiskBadge label={classificacao.label} color={classificacao.color} size="small" />}
      </View>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  pacienteInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: '#FFF3E0', padding: 12, borderRadius: 12 },
  pacienteNome: { fontSize: 15, fontWeight: '600' },
  erroGeral: { fontSize: 13, color: COLORS.danger, backgroundColor: COLORS.dangerLight, padding: 12, borderRadius: 10, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputFlex: { flex: 1 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 18, color: COLORS.textPrimary },
  inputError: { borderColor: COLORS.danger },
  textArea: { fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  erro: { fontSize: 12, color: COLORS.danger, marginTop: 4 },
  btnSalvar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E65100', borderRadius: 14, padding: 16, marginTop: 8, gap: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  modalMetricas: { marginBottom: 12 },
  modalValor: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 28 },
  orientacoesTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 8 },
  orientacaoItem: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 4 },
  btnFechar: { backgroundColor: '#E65100', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  btnFecharText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
