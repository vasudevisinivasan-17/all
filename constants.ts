
export const LETTER_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

export const INITIAL_TIME = 90;
export const GRID_SIZE_INITIAL = 5;

export const LETTER_DISTRIBUTION = "EEEEEEEEEEEEEEEEEEAAAAAAAAAAAAAIIIIIIIIIIIIIOOOOOOOOOOOOONNNNNNNNNNNRRRRRRRRRRTTTTTTTTTTLLLLLLLLSSSSSSSSSUDDDDDGGGGBBCCMMPPFFHHWWYYKJVXZQ".split("");

// Harder letters for higher levels
export const HARD_LETTER_DISTRIBUTION = "EEEEEEAAAAAIIIIIOOOOONNNRRRTTTLLSSSSUDGBCMPFHWYKKKKJJJVVVXXXXZZZZQQQQ".split("");

export const getRandomLetter = (level: number) => {
  const dist = level > 4 ? HARD_LETTER_DISTRIBUTION : LETTER_DISTRIBUTION;
  return dist[Math.floor(Math.random() * dist.length)];
};

export const getLevelConfig = (level: number) => {
  // Increased standard size to 5x5
  const size = 5;
  // Increased target score since 5x5 grid makes it easier to find words
  const targetScore = Math.floor(150 * Math.pow(1.8, level - 1));
  const timer = Math.max(30, 90 - (level - 1) * 10);
  const minWordLength = level >= 7 ? 4 : 3;
  const minWordsRequired = Math.max(3, level); 

  return {
    size,
    timer,
    targetScore,
    minWordLength,
    minWordsRequired,
  };
};
