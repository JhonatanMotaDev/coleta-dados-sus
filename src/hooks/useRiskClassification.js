import { useMemo } from 'react';
import { classifyHAS, classifyDMComposto } from '../utils/riskClassification';

export const useRiskClassification = (type, data) => {
  return useMemo(() => {
    if (!data) return null;
    if (type === 'HAS') {
      return classifyHAS(data.pressaoSistolica, data.pressaoDiastolica);
    }
    if (type === 'DM') {
      return classifyDMComposto(data);
    }
    return null;
  }, [type, data]);
};
