const recovery = {
  sleep: [
    "😴 Sleep 7-9 hours for optimal muscle recovery and growth",
    "🌙 Poor sleep increases cortisol and reduces muscle gains",
  ],
  rest: [
    "🧘 Take at least 1-2 rest days per week for recovery",
    "♻️ Active recovery: light walking or stretching on rest days",
  ],
};

const tips = [
  '💧 Drink 2-3L water daily',
  '😴 Sleep 7-8 hours for muscle recovery',
  '🥗 Eat protein after workouts',
  '🧘 Warm up before every session',
  '📊 Track your progress weekly',
  '🍽 Don\'t skip breakfast on workout days',
  '🏃 Consistency beats intensity every time',
  '💪 Progressive overload is the key to growth',
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const checkRules = (message) => {
  const text = message.toLowerCase().trim();

  if (/^(hi|hello|hey|sup|yo|what'?s up|wassup|good morning|good evening|howdy)[\s!?.]*$/.test(text)) {
    return "👋 Hey! I'm your AI fitness coach. Ask me anything about workouts, nutrition, recovery, or your fitness goals!";
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount <= 7) {
    if (/\bsleep\b/.test(text) && !/workout|exercise|muscle|gain|lose|build/.test(text)) {
      return getRandom(recovery.sleep);
    }
    if (/\b(rest|recover|recovery)\b/.test(text) && !/exercise|set|rep|workout|between/.test(text)) {
      return getRandom(recovery.rest);
    }
  }

  return null;
};

module.exports = { checkRules, tips };