// ALL user-facing text lives here. Edit freely — nothing is hard-coded elsewhere.

export const CONTENT = {
  ui: {
    continue: 'continue →',
    nextStep: 'next step ↓',
    next: 'next →',
    tapToOpen: 'tap to open',
    skip: 'skip ⏭',
    play: '▶ play',
    pause: '⏸ pause',
    openWhen: 'open when…',
    opened: 'opened',
  },

  // Screen-reader-only labels (never shown visually)
  a11y: {
    close: 'close',
    envelope: 'envelope',
    petal: 'petal',
    star: 'star',
    wheelUp: 'up',
    wheelDown: 'down',
    wheels: ['day', 'month', 'year'],
    lock: 'combination lock',
    audioDisc: 'music',
    starMap: 'star map',
  },

  opening: {
    names: ['Jackie…', 'Wanjiru…', 'kaschana kangu…', 'ma chérie…', 'my lady…', 'mamaa.'],
    finalLines: ['Okay, all of you.', 'Come in.'],
    button: 'come in →',
  },

  lock: {
    hint: 'the day we became us.',
    button: 'open',
    wrong: [
      'Mamaa. Come on. You know this one.',
      "Wrong. I'm telling your mum.",
      'Close… but no. Think January.',
    ],
    escape: 'let me in anyway 🙈',
    combo: { dd: 10, mm: 1, yyyy: 2026 },
  },

  vault: {
    title: 'Seven reasons. There are more.',
    reasons: [
      "You have more energy at 7am than I have the whole week. I don't know where you keep it, but I want some.",
      "You're beautiful and you don't even try. You just walk in and everything changes.",
      'You work so hard. Financial engineering is not easy and you still show up every single day.',
      "You draw. You make things with your hands that didn't exist before. I've seen the card. I know.",
      "Our walks. I don't care where we're going. I'd walk it twice if it's with you.",
      'When you\'re hungry, you become a whole different person. I find it so cute. (I also carry snacks now. Coincidence.)',
      'Your mum likes me. That means you told her good things about me. That means you like me. I did the maths.',
    ],
  },

  flower: {
    title: "Je t'aime…",
    cycle: ['un peu', 'beaucoup', 'passionnément', 'à la folie', 'pas du tout'],
    petals: 9,
    after: '(look it up 😌)',
  },

  constellation: {
    title: 'Our walk',
    subtitle: 'tap each star',
    stars: [
      { date: '10 January 2026', sketch: 'bench', text: 'The day we started.' },
      { date: '', sketch: 'footprints', text: 'Our walks. Kilometres of talking about nothing. Best kilometres of my life.' },
      { date: '', sketch: 'cookie', text: 'I learned early: never let you go hungry, and never take the last Oreo.' },
      { date: '', sketch: 'card', text: 'Your card. Tu as gagné mon cœur. You still are.' },
      {
        date: '23 September 2026',
        sketch: 'star',
        dim: true,
        text: "The day you asked for a break. I won't pretend it didn't hurt. But it showed me exactly how much of my life you fill. All of it.",
      },
      { date: 'Today', sketch: 'envelope', text: 'No reason. Just because.' },
    ],
  },

  derivation: {
    header: 'A derivation, for the financial engineer',
    label: '(Cira, MATH 101: Applied Love)',
    blocks: [
      {
        title: 'Model',
        items: [
          { t: 'text', v: 'Let L_t be my love for you, with t = 0 on 10 January 2026. Like any serious asset, it follows geometric Brownian motion:' },
          { t: 'math', v: 'dL_t = \\mu L_t\\,dt + \\sigma L_t\\,dW_t' },
          { t: 'text', v: 'where μ is the drift (how much I fall for you every day) and σ is the volatility (our arguments, your hunger moods, 23 September).' },
        ],
      },
      {
        title: "Applying Itô's lemma to f(L) = ln L",
        items: [
          { t: 'math', v: 'd(\\ln L_t) = \\frac{1}{L_t}\\,dL_t - \\frac{1}{2}\\frac{1}{L_t^2}(dL_t)^2 = \\left(\\mu - \\tfrac{1}{2}\\sigma^2\\right)dt + \\sigma\\,dW_t' },
          { t: 'text', v: 'so' },
          { t: 'math', v: 'L_t = L_0 \\exp\\!\\left[\\left(\\mu - \\tfrac{1}{2}\\sigma^2\\right)t + \\sigma W_t\\right], \\qquad \\mathbb{E}[L_t] = L_0\\,e^{\\mu t}' },
        ],
      },
      {
        title: 'Interpretation',
        items: [
          { t: 'text', v: 'Expected love grows exponentially. In the long run,' },
          { t: 'math', v: '\\frac{\\ln L_t}{t} \\to \\mu - \\tfrac{1}{2}\\sigma^2 \\quad \\text{almost surely,}' },
          { t: 'text', v: 'so we keep growing as long as μ > σ²/2. The bad days cost us something, but my drift is bigger. ∎' },
        ],
      },
      { title: '', items: [{ t: 'chart' }] },
      {
        title: 'Corollary (valuation)',
        items: [
          { t: 'text', v: "You're a perpetuity paying C in happiness every period. Present value:" },
          { t: 'math', v: 'PV = \\sum_{k=1}^{\\infty}\\frac{C}{(1+r)^k} = \\frac{C}{r}' },
          { t: 'text', v: "I don't discount future you, so r → 0⁺ and PV → ∞. You're priceless, and I can prove it." },
        ],
      },
    ],
    chart: {
      yLabel: 'L_t',
      driftLabel: 'drift',
      dipLabel: '23 Sep',
      caption: 'fig. 1: us. wobbly, but going up.',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
  },

  quiz: {
    title: 'How well do you know us?',
    questions: [
      {
        q: "What's our best activity?",
        options: ['Walking', 'Arguing', 'Eating your food'],
        correct: [0],
        right: 'Correct. Next walk is on me.',
        wrong: 'Hmm. Try again, my lady.',
      },
      {
        q: 'What happens when Jackie skips a meal?',
        options: ['Nothing', 'A little grumpy', 'The world ends'],
        correct: [2],
        right: "I've seen it. I'm still recovering.",
        wrong: 'Be serious, mamaa.',
      },
      {
        q: 'The only acceptable biscuit?',
        options: ['Oreo', 'Digestive', "What's a biscuit"],
        correct: [0],
        right: 'Obviously.',
        wrong: 'Who are you and what have you done with my girl?',
      },
      {
        q: 'Who in your family is my biggest fan?',
        options: ['Your mum', 'Your little brother', 'Nobody'],
        correct: [0],
        right: 'She has great taste. Like her daughter.',
        wrong: 'Ouch. Try again.',
      },
      {
        q: 'Who in your family has no idea I exist?',
        options: ['Your mum', 'Your little brother', 'Everyone knows you'],
        correct: [1],
        right: "Tell him Dennis is cool. Tell him Dennis is very cool. Please. I'm begging.",
        wrong: 'I wish. Try again.',
      },
      {
        q: "Who's the only guy allowed to call you ma chérie?",
        options: ['Dennis', 'Cira', 'also Dennis', 'that guy 👀'],
        correct: [0, 1, 2],
        right: 'Good answer. Correct answer. The only answer.',
        wrong: 'Excuse me??? Try again 😤',
      },
    ],
    score: { big: '100%.', small: 'Obviously.' },
  },

  letter: {
    paragraphs: [
      'Wanjiru,',
      "I don't have a reason for this one. No gift to thank you for, no date to celebrate. I just love you, and I wanted you to have a place you can come back to and see it.",
      "Since the 10th of January I've learned a lot about you. You wake up with energy I'll never have. You work harder than anyone I know. You draw things that make me stop and stare. You get hungry and the whole world has to know about it. And you walk next to me like it's normal, when for me it still isn't.",
      "The last few weeks haven't been easy. I'm not going to pretend they were. But I know what I want, and it's still you. It was you in January, it was you in September, and it's you today.",
      "And thank you for the card. I've read it more times than I'll admit. Merci, mon cœur.",
      'So this is me saying it plainly. I love you. Not because of anything. Just because.',
      "Je t'aime à la folie, kaschana kangu.",
    ],
    signature: 'Your Cira',
  },

  finale: {
    lines: ['Tu as gagné mon cœur.', 'Et tu le gardes.'],
    question: 'Do you love me too?',
    yes: 'Oui',
    no: 'Non',
    noTired: 'Non (nice try)',
    after: 'Je le savais. 🤍',
  },

  hub: {
    sections: [
      { scene: 'vault', label: 'Vault' },
      { scene: 'flower', label: 'Flower' },
      { scene: 'constellation', label: 'Our walk' },
      { scene: 'derivation', label: 'The derivation' },
      { scene: 'quiz', label: 'Quiz' },
      { scene: 'letter', label: 'The letter' },
      { scene: 'finale', label: 'Finale' },
    ],
    restart: 'start from the beginning',
    startOver: '↺ start over',
  },

  openWhen: [
    { label: 'Open when you miss me', note: "I'm probably thinking about you right now. Text me. I'll reply faster than you expect." },
    { label: "Open when you've had a bad day", note: 'Step one: eat something. Step two: call me. In that order.' },
    { label: "Open when you can't sleep", note: "Count Oreos. Don't eat them. Okay, eat one." },
    { label: 'Open when exams are killing you', note: "You derive Itô's lemma. You can survive one paper. I believe in you more than you do." },
    { label: 'Open when you need a laugh', note: "Remember your brother still doesn't know who I am. I'm a ghost in your family. Your mum's favourite ghost, though." },
    { label: 'Open when you doubt us', note: 'Go back to the 10th of January star. Then read the derivation again. The maths doesn\'t lie.' },
  ],
};
