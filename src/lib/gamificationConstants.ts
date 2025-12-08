// src/lib/gamificationConstants.ts
export const GAMIFICATION_COLORS: Record<string, string> = {
  ovo: '#E3CD98',
  pinguim: '#D2AD92',
  ema: '#C27588',
  papagaio: '#238F77',
  gaviao: '#51ADCC',
  sabia: '#B198CE',
  andorinha: '#993F92',
  'beija-flor': '#F77F00',
  falcao: '#D62828',
  albatroz: '#015885'
};

export const GAMIFICATION_ICONS: Record<string, string> = {
  ovo: '🥚',
  pinguim: '🐧',
  ema: '🐦',
  papagaio: '🦜',
  gaviao: '🦅',
  sabia: '🎶',
  andorinha: '🕊️',
  'beija-flor': '🌺',
  falcao: '🦅',
  albatroz: '🪶'
};

// Labels completas (opcional, se quiser exibir "Beija-flor" formatado)
export const GAMIFICATION_LABELS: Record<string, string> = {
  ovo: 'Ovo',
  pinguim: 'Pinguim',
  ema: 'Ema',
  papagaio: 'Papagaio',
  gaviao: 'Gavião',
  sabia: 'Sabiá',
  andorinha: 'Andorinha',
  'beija-flor': 'Beija-flor',
  falcao: 'Falcão',
  albatroz: 'Albatroz'
};

export const GAMIFICATION_LEVELS = [
  { name: 'Ovo', start_score: 0 },
  { name: 'Pinguim', start_score: 100 },
  { name: 'Ema', start_score: 200 },
  { name: 'Papagaio', start_score: 400 },
  { name: 'Gavião', start_score: 600 },
  { name: 'Sabiá', start_score: 900 },
  { name: 'Andorinha', start_score: 1200 },
  { name: 'Beija-flor', start_score: 1500 },
  { name: 'Falcão', start_score: 2000 },
  { name: 'Albatroz', start_score: 3000 }
].sort((a, b) => a.start_score - b.start_score);
