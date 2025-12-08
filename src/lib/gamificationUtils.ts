// src/lib/gamificationUtils.ts
export const normalizeStatusKey = (statusName: string): string => {
  return statusName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '-') // substitui espaços por hífens (ex: "Beija flor" → "beija-flor")
    .replace(/[^a-z0-9-]/g, ''); // remove caracteres inválidos
};

// utils/gamification.ts
export const getStatusFromScore = (score: number, statuses: { start_score: number; name: string }[]): string => {
  if (!statuses?.length) return 'ovo';
  let current = 'ovo';
  const sorted = [...statuses].sort((a, b) => a.start_score - b.start_score);
  for (const s of sorted) {
    if (score >= s.start_score) current = s.name.toLowerCase();
    else break;
  }
  return current;
};
