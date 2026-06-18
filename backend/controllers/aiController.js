const asyncHandler = require('express-async-handler');
const { OpenAI }   = require('openai');
const User         = require('../models/User');
const { checkRules, tips } = require('../utils/ruleEngine');

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Smart keyword-based fallback ──────────────────────────────────────────
// Returns a real, detailed fitness answer based on what the user asked.
// Used when the AI API is rate-limited, down, or key is invalid.
const getSmartFallback = (message) => {
  const text = message.toLowerCase();

  const topics = [
    {
      keywords: ['chest', 'bench', 'pec', 'tricep', 'push up', 'pushup'],
      reply: `💪 **Chest & Triceps Workout**\n\n- Bench Press: 4×8\n- Incline Dumbbell Press: 3×10\n- Cable Flyes: 3×12\n- Tricep Dips: 3×12\n- Overhead Tricep Extension: 3×15\n\nRest 60–90 sec between sets. Add 2.5kg each week when you hit the top of your rep range.`,
    },
    {
      keywords: ['back', 'lat', 'pull', 'row', 'deadlift', 'bicep'],
      reply: `🏋️ **Back & Biceps Workout**\n\n- Deadlift: 4×5\n- Pull-Ups: 4×8\n- Bent-Over Row: 3×10\n- Seated Cable Row: 3×12\n- Barbell Curl: 3×12\n\nFocus on squeezing your lats at the top of each pull. Keep core tight on deadlifts.`,
    },
    {
      keywords: ['leg', 'squat', 'quad', 'hamstring', 'glute', 'calf', 'lunge'],
      reply: `🦵 **Leg Day Workout**\n\n- Barbell Squat: 4×8\n- Romanian Deadlift: 3×10\n- Leg Press: 3×12\n- Walking Lunges: 3×12 each\n- Calf Raises: 4×20\n\nGo below parallel on squats for full glute activation. Stretch hip flexors before training.`,
    },
    {
      keywords: ['shoulder', 'delt', 'lateral raise', 'overhead press', 'arnold'],
      reply: `💪 **Shoulder Workout**\n\n- Overhead Press: 4×8\n- Lateral Raises: 4×15\n- Front Raises: 3×12\n- Face Pulls: 3×15\n- Arnold Press: 3×10\n\nDon't go too heavy on lateral raises — control beats weight here. Always warm up your rotator cuff.`,
    },
    {
      keywords: ['abs', 'core', 'six pack', 'plank', 'crunch', 'stomach'],
      reply: `🔥 **Core Workout**\n\n- Plank: 3×60 sec\n- Hanging Leg Raises: 3×15\n- Cable Crunches: 3×20\n- Russian Twists: 3×20\n- Ab Wheel Rollout: 3×10\n\nAbs are revealed in the kitchen — keep your diet in check. Train core 3× per week.`,
    },
    {
      keywords: ['protein', 'diet', 'food', 'eat', 'meal', 'nutrition', 'calorie', 'macro'],
      reply: `🥗 **Nutrition Guide**\n\n**Daily targets:**\n- Protein: 2–2.5g per kg bodyweight\n- Carbs: 4–5g per kg bodyweight\n- Fat: 0.8–1g per kg bodyweight\n\n**Best protein sources:** Chicken, eggs, Greek yogurt, tuna, paneer, lentils\n\nEat a protein-rich meal within 1 hour post-workout. Spread protein across 4–5 meals daily.`,
    },
    {
      keywords: ['fat', 'weight loss', 'lose weight', 'cut', 'slim', 'cardio', 'burn fat'],
      reply: `🔥 **Fat Loss Guide**\n\n- Create a 300–500 kcal daily deficit\n- Target 0.5–1kg loss per week\n- Keep protein at 2g/kg to preserve muscle\n- Do 30–45 min moderate cardio 4× per week\n\nAvoid crash dieting — it kills metabolism and burns muscle. Slow and steady wins.`,
    },
    {
      keywords: ['muscle', 'gain', 'bulk', 'mass', 'build', 'grow', 'hypertrophy'],
      reply: `💪 **How to Build Muscle**\n\n**3 pillars:**\n1. **Progressive overload** — increase weight or reps weekly\n2. **Protein** — 2–2.5g per kg bodyweight daily\n3. **Recovery** — 7–9 hours sleep, 48h rest per muscle group\n\nTrain 3–5 sets of 6–12 reps per exercise. Eat at a 200–300 kcal surplus to fuel growth.`,
    },
    {
      keywords: ['sleep', 'recover', 'recovery', 'rest day'],
      reply: `😴 **Recovery & Sleep**\n\n70% of muscle growth happens during sleep — this is when growth hormone is released.\n\n- Sleep: 7–9 hours per night\n- Rest between sessions: 48h per muscle group\n- Active recovery: light walking or stretching on rest days\n\nAvoid screens 30 min before bed. Keep a consistent sleep schedule even on weekends.`,
    },
    {
      keywords: ['plan', 'week', 'schedule', 'program', 'routine', 'split', '7 day', 'weekly'],
      reply: `📅 **Weekly Workout Split**\n\n- **Mon:** Chest & Triceps\n- **Tue:** Back & Biceps\n- **Wed:** Rest / Active Recovery\n- **Thu:** Legs & Glutes\n- **Fri:** Shoulders & Abs\n- **Sat:** Full Body or Weak Points\n- **Sun:** Rest\n\nStick to this for 8–12 weeks minimum. Consistency beats perfection every time.`,
    },
    {
      keywords: ['supplement', 'creatine', 'whey', 'protein powder', 'pre workout', 'bcaa'],
      reply: `💊 **Supplements Worth Taking**\n\n**Tier 1 (proven):**\n- **Creatine Monohydrate** — 5g/day, best supplement for strength\n- **Whey Protein** — convenient way to hit protein targets\n- **Vitamin D3** — essential if you're mostly indoors\n\n**Tier 2 (optional):**\n- Omega-3 Fish Oil — reduces inflammation\n- Magnesium Glycinate — improves sleep quality\n\n**Skip:** Fat burners, BCAAs (if eating enough protein), anything with wild claims.`,
    },
    {
      keywords: ['warm up', 'warmup', 'stretch', 'mobility', 'flexible', 'before workout'],
      reply: `🧘 **10-Min Warm-Up Routine**\n\n1. 3 min light cardio (jumping jacks or jog)\n2. Arm circles — 10 forward, 10 backward\n3. Hip circles — 10 each direction\n4. Leg swings — 10 each leg\n5. Bodyweight squats — 15 reps\n6. Push-ups — 10 reps\n\nA proper warm-up reduces injury risk and improves performance by up to 20%.`,
    },
    {
      keywords: ['water', 'hydrat', 'drink'],
      reply: `💧 **Hydration Guide**\n\n- **Daily target:** 2–3 litres of water\n- **During workout:** 500ml per hour of exercise\n- **Post-workout:** Add electrolytes if you sweat heavily\n\nDehydration of just 2% reduces performance by up to 10%. Drink a glass of water first thing every morning.`,
    },
  ];

  for (const topic of topics) {
    if (topic.keywords.some(kw => text.includes(kw))) {
      return topic.reply;
    }
  }

  // Generic fallback if no topic matched
  return `💡 **Fitness Tip**\n\n${getRandom(tips)}\n\n*Ask me about workouts, nutrition, fat loss, muscle gain, or recovery for detailed advice!*`;
};

// ── Try multiple free OpenRouter models in order ──────────────────────────
// If the first model is rate-limited, automatically tries the next one.
const FREE_MODELS = [
  'google/gemma-4-31b-it:free',           // Best quality (Google, 262K ctx)
  'nvidia/nemotron-3-super-120b-a12b:free', // NVIDIA 120B (1M ctx)
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-120b:free',
];

const tryModels = async (openai, messages) => {
  let lastError = null;

  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens:  600,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content;
      if (reply) {
        console.log(`✅ Success with model: ${model}`);
        return { reply, model };
      }
    } catch (err) {
      console.warn(`❌ Model ${model} failed: ${err.message}`);
      lastError = err;

      // Only continue to next model on rate-limit or provider errors
      const status = err?.status || err?.response?.status;
      if (status !== 429 && status !== 503 && status !== 502) {
        throw err; // Auth/config errors — no point trying other models
      }
    }
  }

  throw lastError || new Error('All models failed');
};

// ── Controller ────────────────────────────────────────────────────────────
const chatAI = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  // Validate
  if (!message)              { res.status(400); throw new Error('Message required'); }
  if (message.length > 1000) { res.status(400); throw new Error('Message too long'); }

  // Fetch user
  const user = await User.findById(req.user.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  // ── 1. Rule engine ────────────────────────────────────────────────────
  const ruleResponse = checkRules(message);
  if (ruleResponse) {
    return res.json({
      source: 'rule',
      reply:  `${ruleResponse}\n\n💡 Tip: ${getRandom(tips)}`,
    });
  }

  // ── 2. No API key → smart fallback ───────────────────────────────────
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('OPENROUTER_API_KEY not set — using smart fallback');
    return res.json({
      source: 'rule',
      reply:  getSmartFallback(message),
    });
  }

  // ── 3. Build messages ─────────────────────────────────────────────────
  const systemPrompt = `You are an expert AI fitness coach and nutritionist named FitAI.

User Profile:
- Name: ${user.name || 'User'}
- Fitness Goal: ${user.fitnessGoal || 'General Health'}
- Weight: ${user.weight ? user.weight + 'kg' : 'Not set'}
- Height: ${user.height ? user.height + 'cm' : 'Not set'}
- Age: ${user.age || 'Not set'}
- Gender: ${user.gender || 'Not set'}

Instructions:
- Be friendly, motivating, and specific
- Give exact exercises with sets/reps for workout questions
- Give exact foods/quantities for nutrition questions
- Keep responses to 2-4 short paragraphs
- Personalise advice for their goal: ${user.fitnessGoal || 'General Health'}
- Use the user's name occasionally
- Never give vague or generic answers`;

  const builtMessages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map(msg => ({
      role:    msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  // ── 4. Try AI models with automatic fallback ──────────────────────────
  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey:  process.env.OPENROUTER_API_KEY,
    });

    const { reply, model } = await tryModels(openai, builtMessages);
    console.log(`AI response from ${model}`);

    return res.json({ source: 'ai', reply });

  } catch (error) {
    const status = error?.status || error?.response?.status;
    console.error(`All AI models failed. Status: ${status}, Message: ${error.message}`);

    // ── 5. ALL models failed → smart keyword fallback ─────────────────
    // User still gets a real, useful fitness answer instead of an error.
    const smartReply = getSmartFallback(message);

    let suffix = '';
    if (status === 429) {
      suffix = '\n\n*⏱ AI is rate-limited right now — try again in ~30 seconds for a personalised response.*';
    } else if (status === 401 || status === 403) {
      suffix = '\n\n*🔑 Check your OPENROUTER_API_KEY in the .env file.*';
    }

    // Return as 'rule' source so frontend shows ⚡ Rule-based, not red Fallback
    return res.json({
      source: 'rule',
      reply:  smartReply + suffix,
    });
  }
});

module.exports = { chatAI };
