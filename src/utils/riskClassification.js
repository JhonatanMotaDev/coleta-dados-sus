import { HAS_CLASSIFICATION, DM_CLASSIFICATION } from '../constants/clinicalThresholds';

export const classifyHAS = (sistolica, diastolica) => {
  const s = Number(sistolica);
  const d = Number(diastolica);
  if (isNaN(s) || isNaN(d)) return null;
  for (const cls of HAS_CLASSIFICATION) {
    if (cls.condition(s, d)) return cls;
  }
  return HAS_CLASSIFICATION[HAS_CLASSIFICATION.length - 1];
};

const classifyByRange = (value, ranges) => {
  const v = Number(value);
  if (isNaN(v)) return null;
  for (const r of ranges) {
    if (v >= r.range[0] && v <= r.range[1]) return r;
  }
  return ranges[ranges.length - 1];
};

export const classifyGlicemiaJejum = (value) =>
  classifyByRange(value, DM_CLASSIFICATION.glicemiaJejum);

export const classifyGlicemiaPosPrandial = (value) =>
  classifyByRange(value, DM_CLASSIFICATION.glicemiaPosPrandial);

export const classifyHbA1c = (value) =>
  classifyByRange(value, DM_CLASSIFICATION.hba1c);

// Retorna a pior classificação entre as métricas de DM
const RISK_ORDER = ['Normal', 'Pré-Diabetes', 'Pré-Hipertensão', 'DM Controlado', 'HAS Estágio 1', 'DM Descontrolado', 'Diabetes', 'HAS Estágio 2', 'Hiperglicemia Grave', 'DM Crítico', 'Crise Hipertensiva'];

export const classifyDMComposto = (data) => {
  const classificacoes = [];
  if (data.glicemiaJejum) classificacoes.push(classifyGlicemiaJejum(data.glicemiaJejum));
  if (data.glicemiaPosPrandial) classificacoes.push(classifyGlicemiaPosPrandial(data.glicemiaPosPrandial));
  if (data.hemoglobinaGlicada) classificacoes.push(classifyHbA1c(data.hemoglobinaGlicada));

  const validas = classificacoes.filter(Boolean);
  if (validas.length === 0) return null;

  return validas.reduce((pior, atual) => {
    const indexPior = RISK_ORDER.indexOf(pior.label);
    const indexAtual = RISK_ORDER.indexOf(atual.label);
    return indexAtual > indexPior ? atual : pior;
  });
};

export const getRiskLevel = (label) => {
  const map = {
    'Normal': 'normal',
    'Pré-Hipertensão': 'pre',
    'Pré-Diabetes': 'pre',
    'HAS Estágio 1': 'estagio1',
    'DM Controlado': 'estagio1',
    'HAS Estágio 2': 'estagio2',
    'DM Descontrolado': 'estagio2',
    'Diabetes': 'estagio2',
    'Hiperglicemia Grave': 'crise',
    'DM Crítico': 'crise',
    'Crise Hipertensiva': 'crise',
  };
  return map[label] || 'normal';
};
