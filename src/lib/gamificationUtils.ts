// src/lib/gamificationUtils.ts

export const normalizeStatusKey = (statusName: string): string => {
  if (!statusName) return 'ovo';
  return statusName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

interface GameStatus {
  start_score: number;
  name: string;
}

export const getStatusDetails = (score: number, sortedStatuses: GameStatus[]) => {
  if (!sortedStatuses?.length) return { current: 'ovo', next: null, limit: null };

  let currentStatus = sortedStatuses[0];
  let nextStatus = null;

  // Itera para encontrar o nível atual e o próximo
  for (let i = 0; i < sortedStatuses.length; i++) {
    if (score >= sortedStatuses[i].start_score) {
      currentStatus = sortedStatuses[i];
      nextStatus = sortedStatuses[i + 1] || null; // Se não tiver próximo, é o nível máximo
    } else {
      break; // Passou do score atual, para o loop
    }
  }

  return {
    name: currentStatus.name, // Nome original do banco (ex: "Gavião Real")
    currentStart: currentStatus.start_score,
    nextStart: nextStatus ? nextStatus.start_score : null // Pontos para o próximo nível
  };
};
