import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatSUSMascarado = (sus) => {
  if (!sus || sus.length !== 15) return sus;
  return `***.****.****-${sus.slice(13)}`;
};

export const formatData = (dateStr) => {
  try {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
};

export const formatDataCurta = (dateStr) => {
  try {
    return format(new Date(dateStr), 'dd/MM/yy', { locale: ptBR });
  } catch {
    return dateStr;
  }
};

export const formatHora = (dateStr) => {
  try {
    return format(new Date(dateStr), 'HH:mm', { locale: ptBR });
  } catch {
    return '';
  }
};

export const formatGroupDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  } catch {
    return dateStr;
  }
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
