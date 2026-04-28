export const validateSUS = (sus) => /^\d{15}$/.test(sus);

export const validateBloodPressure = (s, d) => {
  const sistolica = Number(s);
  const diastolica = Number(d);
  if (isNaN(sistolica) || isNaN(diastolica)) return 'Valores inválidos';
  if (sistolica < 60 || sistolica > 300) return 'Sistólica fora do range fisiológico (60-300 mmHg)';
  if (diastolica < 40 || diastolica > 200) return 'Diastólica fora do range fisiológico (40-200 mmHg)';
  if (sistolica <= diastolica) return 'Sistólica deve ser maior que diastólica';
  return null;
};

export const validateHeartRate = (fc) => {
  const val = Number(fc);
  if (isNaN(val) || val < 30 || val > 250) return 'Frequência cardíaca fora do range (30-250 bpm)';
  return null;
};

export const validateGlucose = (value) => {
  const val = Number(value);
  if (isNaN(val) || val < 20 || val > 600) return 'Valor fora do range (20-600 mg/dL)';
  return null;
};

export const validateHbA1c = (value) => {
  const val = Number(value);
  if (isNaN(val) || val < 3.0 || val > 20.0) return 'Valor fora do range (3.0-20.0%)';
  return null;
};

export const validateNome = (nome) => {
  if (!nome || nome.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
  return null;
};
