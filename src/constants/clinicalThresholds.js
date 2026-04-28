export const HAS_CLASSIFICATION = [
  {
    label: 'Normal',
    color: '#4CAF50',
    level: 'normal',
    condition: (s, d) => s < 120 && d < 80,
  },
  {
    label: 'Pré-Hipertensão',
    color: '#8BC34A',
    level: 'pre',
    condition: (s, d) => s >= 120 && s <= 129 && d < 80,
  },
  {
    label: 'HAS Estágio 1',
    color: '#FFC107',
    level: 'estagio1',
    condition: (s, d) => (s >= 130 && s <= 139) || (d >= 80 && d <= 89),
  },
  {
    label: 'HAS Estágio 2',
    color: '#FF5722',
    level: 'estagio2',
    condition: (s, d) => (s >= 140 && s <= 179) || (d >= 90 && d <= 119),
  },
  {
    label: 'Crise Hipertensiva',
    color: '#B71C1C',
    level: 'crise',
    condition: (s, d) => s >= 180 || d >= 120,
  },
];

export const DM_CLASSIFICATION = {
  glicemiaJejum: [
    { label: 'Normal', color: '#4CAF50', range: [0, 99] },
    { label: 'Pré-Diabetes', color: '#FFC107', range: [100, 125] },
    { label: 'Diabetes', color: '#FF5722', range: [126, 199] },
    { label: 'Hiperglicemia Grave', color: '#B71C1C', range: [200, Infinity] },
  ],
  glicemiaPosPrandial: [
    { label: 'Normal', color: '#4CAF50', range: [0, 139] },
    { label: 'Pré-Diabetes', color: '#FFC107', range: [140, 199] },
    { label: 'Diabetes', color: '#FF5722', range: [200, Infinity] },
  ],
  hba1c: [
    { label: 'Normal', color: '#4CAF50', range: [0, 5.6] },
    { label: 'Pré-Diabetes', color: '#FFC107', range: [5.7, 6.4] },
    { label: 'DM Controlado', color: '#FF9800', range: [6.5, 7.0] },
    { label: 'DM Descontrolado', color: '#FF5722', range: [7.1, 8.9] },
    { label: 'DM Crítico', color: '#B71C1C', range: [9.0, Infinity] },
  ],
};

export const HAS_ORIENTATIONS = (s, d) => {
  if (s >= 180 || d >= 120) {
    return [
      '⚠️ ENCAMINHAR IMEDIATAMENTE para serviço de emergência',
      'Não deixar paciente ir sozinho',
      'Registrar horário e acionar SAMU se necessário (192)',
    ];
  }
  if (s >= 140 || d >= 90) {
    return [
      'Verificar adesão medicamentosa',
      'Orientar redução de sal (< 5g/dia)',
      'Recomendar atividade física leve',
      'Agendar consulta médica em breve',
    ];
  }
  if (s >= 130 || d >= 80) {
    return [
      'Monitorar pressão regularmente',
      'Orientar mudanças no estilo de vida',
      'Reduzir consumo de sódio e álcool',
      'Praticar atividade física moderada',
    ];
  }
  if (s >= 120 && s <= 129) {
    return [
      'Pressão levemente elevada — monitorar',
      'Manter hábitos saudáveis',
      'Evitar estresse e sedentarismo',
    ];
  }
  return [
    'Pressão arterial dentro dos limites normais',
    'Manter hábitos saudáveis',
    'Continuar monitoramento periódico',
  ];
};

export const DM_ORIENTATIONS = (glicemiaJejum, hba1c) => {
  if (glicemiaJejum !== null && glicemiaJejum <= 70) {
    return [
      '🚨 HIPOGLICEMIA: Oferecer 15g de carboidrato de absorção rápida',
      'Reavaliar glicemia em 15 minutos',
      'Se inconsciente: acionar SAMU (192)',
    ];
  }
  if (glicemiaJejum !== null && glicemiaJejum >= 300) {
    return [
      '🚨 HIPERGLICEMIA GRAVE: Avaliar sinais de cetoacidose',
      'Verificar hidratação do paciente',
      'Encaminhar para avaliação médica urgente',
    ];
  }
  if (hba1c !== null && hba1c > 9) {
    return [
      'Diabetes descompensado — revisar tratamento',
      'Verificar adesão à medicação',
      'Orientar dieta com baixo índice glicêmico',
      'Agendar consulta médica com urgência',
    ];
  }
  if (hba1c !== null && hba1c >= 7.1) {
    return [
      'Glicemia acima do alvo — ajuste necessário',
      'Reforçar orientações alimentares',
      'Verificar uso correto da medicação',
      'Agendar retorno em 30 dias',
    ];
  }
  return [
    'Glicemia dentro dos parâmetros aceitáveis',
    'Manter dieta e atividade física',
    'Continuar monitoramento regular',
  ];
};
