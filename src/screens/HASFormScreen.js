import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { validateBloodPressure, validateHeartRate } from '../utils/validators';
import { classifyHAS } from '../utils/riskClassification';
import { HAS_ORIENTATIONS } from '../constants/clinicalThresholds';
import { useClinicalRecords } from '../hooks/useClinicalRecords';
import RiskBadge from '../components/RiskBadge';

export default function HASFormScreen({ route, navigation }) {
  const { patient } = route.params;
  const { addRecord } = useClinicalRecords(patient.sus);

  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');
  const [fc, setFc] = useState('');
  const [obs, setObs] = useState('');
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);

  const classificacaoAtual = useCallback(() => {
    if (sistolica && diastolica) return classifyHAS(sistolica, diastolica);
    return null;
  }, [sistolica, diastolica]);

  const cls = classificacaoAtual();

  const validar = () => {
    const novosErros = {};
    if (!sistolica) { novosErros.sistolica = 'Campo obrigatório'; }
    if (!diastolica) { novosErros.diastolica = 'Campo obrigatório'; }
    if (!fc) { novosErros.fc = 'Campo obrigatório'; }

    if (sistolica && diastolica) {
      const erroPressao = validateBloodPressure(sistolica, diastolica);
      if (erroPressao) novosErros.pressao = erroPressao;
    }
    if (fc) {
      const erroFC = validateHeartRate(fc);
      if (erroFC) novosErros.fc = erroFC;
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validar()) return;
    setSalvando(true);

    const s = Number(sistolica);
    const d = Number(diastolica);
    const classificacao = classifyHAS(s, d);

    // Alertas críticos
    if (s >= 180 || d >= 120) {
      Alert.alert(
        '🚨 CRISE HIPERTENSIVA',
        'Encaminhar imediatamente para serviço de emergência!\nAcionar SAMU: 192',
        [{ text: 'Entendido', style: 'destructive' }]
      );
    } else if (Number(fc) > 100) {
      Alert.alert('⚠️ Taquicardia', 'FC > 100 bpm — Investigar causa');
    }

    const result = await addRecord({
      type: 'HAS',
      data: {
        pressaoSistolica: s,
        pressaoDiastolica: d,
        frequenciaCardiaca: Number(fc),
        observacoes: obs,
      },
      riskLevel: classificacao?.level || 'normal',
      riskColor: classificacao?.color || COLORS.riskNormal,
      riskLabel: classificacao?.label || 'Normal',
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
    setSistolica(''); setDiastolica(''); setFc(''); setObs(''); setErros({});
    navigation.goBack();
  };

  const orientacoes = ultimoRegistro
    ? HAS_ORIENTATIONS(ultimoRegistro.data.pressaoSistolica, ultimoRegistro.data.pressaoDiastolica)
    : [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.pacienteInfo}>
          <Ionicons name="person-circle" size={24} color={COLORS.primary} />
          <Text style={styles.pacienteNome}>{patient.nome}</Text>
        </View>

        {/* Classificação em tempo real */}
        {cls && (
          <View style={[styles.classBox, { borderColor: cls.color, backgroundColor: cls.color + '15' }]}>
            <Text style={styles.classLabel}>Classificação atual:</Text>
            <RiskBadge label={cls.label} color={cls.color} />
          </View>
        )}

        <Campo
          label="Pressão Sistólica (mmHg) *"
          value={sistolica}
          onChangeText={setSistolica}
          placeholder="Ex: 120"
          erro={erros.sistolica || erros.pressao}
        />
        <Campo
          label="Pressão Diastólica (mmHg) *"
          value={diastolica}
          onChangeText={setDiastolica}
          placeholder="Ex: 80"
          erro={erros.diastolica}
        />
        <Campo
          label="Frequência Cardíaca (bpm) *"
          value={fc}
          onChangeText={setFc}
          placeholder="Ex: 72"
          erro={erros.fc}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Relatos do paciente, sintomas..."
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

      {/* Modal de resultado */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>✅ Registro Salvo</Text>
            {ultimoRegistro && (
              <>
                <View style={styles.modalMetricas}>
                  <Text style={styles.modalPA}>
                    {ultimoRegistro.data.pressaoSistolica}/{ultimoRegistro.data.pressaoDiastolica} mmHg
                  </Text>
                  <Text style={styles.modalFC}>FC: {ultimoRegistro.data.frequenciaCardiaca} bpm</Text>
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

function Campo({ label, value, onChangeText, placeholder, erro }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, erro && styles.inputError]}
        value={value}
        onChangeText={(t) => onChangeText(t.replace(/[^0-9.]/g, ''))}
        placeholder={placeholder}
        keyboardType="numeric"
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  pacienteInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, backgroundColor: COLORS.primaryLight, padding: 12, borderRadius: 12 },
  pacienteNome: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
  classBox: { borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  classLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 18, color: COLORS.textPrimary },
  inputError: { borderColor: COLORS.danger },
  textArea: { fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  erro: { fontSize: 12, color: COLORS.danger, marginTop: 4 },
  btnSalvar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.danger, borderRadius: 14, padding: 16, marginTop: 8, gap: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  modalMetricas: { marginBottom: 12 },
  modalPA: { fontSize: 32, fontWeight: '700', color: COLORS.textPrimary },
  modalFC: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  orientacoesTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 8 },
  orientacaoItem: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 4 },
  btnFechar: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  btnFecharText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
