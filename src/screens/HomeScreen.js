import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { validateSUS, validateNome } from '../utils/validators';
import { usePatients } from '../hooks/usePatients';

export default function HomeScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [sus, setSus] = useState('');
  const [conditions, setConditions] = useState([]);
  const [erros, setErros] = useState({});
  const { savePatient, findPatientBySus, loading } = usePatients();

  const toggleCondition = (cond) => {
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const validar = () => {
    const novosErros = {};
    const erroNome = validateNome(nome);
    if (erroNome) novosErros.nome = erroNome;
    if (!validateSUS(sus)) novosErros.sus = 'SUS deve ter exatamente 15 dígitos numéricos';
    if (conditions.length === 0) novosErros.conditions = 'Selecione pelo menos uma condição';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async () => {
    if (!validar()) return;

    const existente = findPatientBySus(sus);
    if (existente) {
      Alert.alert(
        'Paciente já cadastrado',
        `${existente.nome} já está na lista. Deseja ir ao perfil?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver Perfil', onPress: () => navigation.navigate('PatientDetail', { patient: existente }) },
        ]
      );
      return;
    }

    const patient = { nome: nome.trim(), sus, conditions };
    const result = await savePatient(patient);
    if (result.success) {
      setNome(''); setSus(''); setConditions([]); setErros({});
      Alert.alert('Sucesso', 'Paciente cadastrado!', [
        {
          text: 'Abrir Formulários',
          onPress: () => navigation.navigate('PatientDetail', { patient }),
        },
        { text: 'OK' },
      ]);
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <Ionicons name="heart-circle" size={48} color={COLORS.white} />
        <Text style={styles.headerTitle}>ESF Saúde da Família</Text>
        <Text style={styles.headerSub}>Sistema de Apoio à Coleta de Dados</Text>
      </LinearGradient>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Cadastro de Paciente</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={[styles.input, erros.nome && styles.inputError]}
            placeholder="Digite o nome completo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />
          {erros.nome ? <Text style={styles.erro}>{erros.nome}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Número do Cartão SUS *</Text>
          <TextInput
            style={[styles.input, erros.sus && styles.inputError]}
            placeholder="000000000000000 (15 dígitos)"
            value={sus}
            onChangeText={(t) => setSus(t.replace(/\D/g, '').slice(0, 15))}
            keyboardType="numeric"
            maxLength={15}
          />
          <Text style={styles.hint}>{sus.length}/15 dígitos</Text>
          {erros.sus ? <Text style={styles.erro}>{erros.sus}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Condições Clínicas *</Text>
          <View style={styles.checkRow}>
            {['HAS', 'DM'].map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[styles.checkBox, conditions.includes(cond) && styles.checkBoxActive]}
                onPress={() => toggleCondition(cond)}
              >
                <Ionicons
                  name={conditions.includes(cond) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={conditions.includes(cond) ? COLORS.primary : COLORS.textSecondary}
                />
                <Text style={[styles.checkLabel, conditions.includes(cond) && styles.checkLabelActive]}>
                  {cond === 'HAS' ? 'Hipertensão (HAS)' : 'Diabetes (DM)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {erros.conditions ? <Text style={styles.erro}>{erros.conditions}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Ionicons name="person-add" size={20} color={COLORS.white} />
          <Text style={styles.btnText}>Cadastrar Paciente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('PatientList')}
        >
          <Ionicons name="list" size={20} color={COLORS.primary} />
          <Text style={styles.btnSecondaryText}>Ver Lista de Pacientes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.white, marginTop: 8 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.textPrimary,
  },
  inputError: { borderColor: COLORS.danger },
  hint: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, textAlign: 'right' },
  erro: { fontSize: 12, color: COLORS.danger, marginTop: 4 },
  checkRow: { gap: 10 },
  checkBox: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
  },
  checkBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  checkLabel: { fontSize: 15, color: COLORS.textSecondary, marginLeft: 10 },
  checkLabelActive: { color: COLORS.primary, fontWeight: '600' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, marginTop: 8, gap: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  btnSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: 14, padding: 14, marginTop: 12, gap: 8,
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
});
