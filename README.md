# 🏥 ESF Saúde da Família — Sistema de Apoio à Coleta de Dados

Aplicativo mobile desenvolvido para suporte a agentes e profissionais de saúde na **Atenção Primária (ESF)**, com foco no acompanhamento de pacientes com **Hipertensão Arterial Sistêmica (HAS)** e **Diabetes Mellitus (DM)**.

> Desenvolvido na disciplina **Inovação e Tecnologia**
> Prof. Claudio Janes, Wille e Renato — **Grupo B**

---

## 📱 Telas do Aplicativo

| Tela | Descrição |
|------|-----------|
| **Home** | Cadastro de paciente com validação do Cartão SUS |
| **Lista de Pacientes** | Todos os pacientes com busca e último risco registrado |
| **Perfil do Paciente** | Dashboard com últimas medições e estatísticas |
| **Formulário HAS** | Registro de pressão arterial com classificação em tempo real |
| **Formulário DM** | Registro de glicemia e HbA1c com classificação por métrica |
| **Histórico** | Registros agrupados por data com filtros e exportação |
| **Gráficos** | Evolução temporal das medições com estatísticas |

---

## 🧱 Stack Técnica

- **React Native** via Expo SDK 54
- **Expo Go** — sem build nativo necessário
- **AsyncStorage** — banco de dados local
- **React Navigation v6** — navegação Stack
- **react-native-chart-kit** — gráficos de evolução
- **date-fns** — datas em pt-BR
- **expo-linear-gradient** — visual

---

## 🏃 Como Rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado
- App **Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Celular e PC na **mesma rede Wi-Fi**

### Instalação

```bash
git clone https://github.com/JhonatanMotaDev/coleta-dados-sus.git
cd coleta-dados-sus
npm install
```

### Executar

```bash
npx expo start --offline --clear
```

Escaneie o QR code com o **Expo Go** no celular.

---

## 🏥 Lógica Clínica

### Classificação de Pressão Arterial (SBC/AHA 2023)

| Classificação | Sistólica | Diastólica | Cor |
|---------------|-----------|------------|-----|
| Normal | < 120 | < 80 | 🟢 Verde |
| Pré-Hipertensão | 120–129 | < 80 | 🟡 Verde-amarelo |
| HAS Estágio 1 | 130–139 | 80–89 | 🟡 Amarelo |
| HAS Estágio 2 | 140–179 | 90–119 | 🟠 Laranja |
| Crise Hipertensiva | ≥ 180 | ≥ 120 | 🔴 Vermelho |

### Classificação de Glicemia (ADA 2024)

| Classificação | Jejum (mg/dL) | HbA1c (%) | Cor |
|---------------|---------------|-----------|-----|
| Normal | < 100 | < 5.7 | 🟢 Verde |
| Pré-Diabetes | 100–125 | 5.7–6.4 | 🟡 Amarelo |
| Diabetes | 126–199 | 6.5–7.0 | 🟠 Laranja |
| DM Descontrolado | — | 7.1–8.9 | 🔴 Vermelho |
| Hiperglicemia Grave | ≥ 200 | ≥ 9.0 | 🔴 Vermelho escuro |

### Alertas Automáticos

- 🚨 PA Sistólica ≥ 180 → **Crise Hipertensiva — Acionar SAMU (192)**
- 🚨 Glicemia ≤ 70 → **Hipoglicemia — Intervenção imediata**
- 🚨 Glicemia ≥ 300 → **Hiperglicemia Grave — Avaliar cetoacidose**
- ⚠️ HbA1c > 9% → **Diabetes descompensado — Revisar tratamento**
- ⚠️ FC > 100 bpm → **Taquicardia — Investigar causa**

---

## 🗂️ Estrutura do Projeto

```
/
├── App.js
└── src/
    ├── navigation/
    │   └── AppNavigator.js
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── PatientListScreen.js
    │   ├── PatientDetailScreen.js
    │   ├── HASFormScreen.js
    │   ├── DMFormScreen.js
    │   ├── HistoryScreen.js
    │   └── ChartScreen.js
    ├── components/
    │   ├── PatientCard.js
    │   ├── ClinicalBadge.js
    │   ├── MetricCard.js
    │   ├── RiskBadge.js
    │   ├── EmptyState.js
    │   └── LoadingSpinner.js
    ├── hooks/
    │   ├── usePatients.js
    │   ├── useClinicalRecords.js
    │   └── useRiskClassification.js
    ├── utils/
    │   ├── riskClassification.js
    │   ├── formatters.js
    │   ├── validators.js
    │   └── storageKeys.js
    └── constants/
        ├── clinicalThresholds.js
        ├── colors.js
        └── typography.js
```

---

## 💾 Modelo de Dados

Os dados são armazenados localmente via **AsyncStorage**:

```
esf:patients              → lista de pacientes
esf:records:{susNumber}   → registros clínicos por paciente
```

---

## 👥 Equipe

| Nome | GitHub |
|------|--------|
| Jhonatan Mota | [@JhonatanMotaDev](https://github.com/JhonatanMotaDev) |
| Wanderson Rodrigues | [@WandersonRodrigues](https://github.com/WandersonRodrigues) |
| Marcelo Bastos | [@MarceloBastos](https://github.com/MarceloBastos) |
---

## 📄 Licença

Este projeto é de uso acadêmico — disciplina Inovação e Tecnologia.
