export function money(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function dateTime(v) {
  try { return new Date(v).toLocaleString(); } catch { return String(v ?? ''); }
}
