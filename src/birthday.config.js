// ============================================================
//  EDIT YOUR DETAILS HERE — everything on the site updates!
// ============================================================
export const HER_NAME = "Anjali"; // 👈 her name
export const YOUR_NAME = "Pa rum pum pum pum"; // 👈 your signature

export const PHOTOS = [
  // How to add her pics:
  //   1) Drop the image file into the "public" folder of this project
  //   2) Put its name here, e.g.  "/sister1.jpg"
  //   (a full internet URL like "https://..." works too)
  null, // polaroid slot 1
  null, // polaroid slot 2
  null, // polaroid slot 3
];

/* page 1 — THE FILM (the hero, the main event)
   👉 drop your video into the "public" folder with this exact name,
   e.g.  public/birthday.mp4
   A full internet URL works too: "https://.../her-film.mp4"        */
export const VIDEO = {
  src: "/birthday.mp4", // 👈 the file name (or a full URL)
  poster: null, // optional still shown before play, e.g. "/frame.jpg"
  tagline: "made this for you, obviously",
  caption: `a birthday film for ${HER_NAME}`,
  credit: "one sibling · one edit · no budget",
};

/* ============================================================
   THE INTRO — the movie-ad style opening cards
   (green approval band → studio card → title → billing block)
============================================================ */
export const INTRO = {
  /* card 1 — the green preview band */
  bandTop: "the following preview has been approved for",
  bandMid: "appropriate audiences",
  bandBy: "by the birthday picture association of america",
  bandRate: "rated pg · presented with gift",

  /* card 2 — the studio ident */
  studioSub: "in association with one very proud sibling",
  studio: YOUR_NAME,
  presents: "presents",

  /* card 3 — the title */
  kicker: "a birthday picture",
  title: `A FILM FOR ${HER_NAME}`,
  sub: "in one copy only · no reprints · showing today",

  /* card 4 — the billing block, all caps, tiny, serious */
  billing: `STARRING ${HER_NAME} AS HERSELF — AND ALSO AS THE MAIN CHARACTER IN EVERY ROOM · CHILDISH SINCE LAUNCH DAY · SNAPS HER FINGERS UNTIL SOMEBODY LOOKS UP · TALKS IN THE THIRD PERSON WHEN THE MOOD STRIKES · REPEATS THE JOKE UNTIL IT LANDS, THEN LAUGHS AT IT HERSELF · REWINDS SCENES TO WATCH HER OWN BEST MOMENT AGAIN · BORROWS THINGS AND CALLS THEM HERS NOW · DIRECTED BY WHICHEVER MOOD SHE IS IN · SUPPORTING CAST: THE LAST PRAWN · SOUND MIXED WITH ONE SNAP, ONE SIGH AND A LOT OF LAUGHING · HAIR AND MAKE-UP: THE HOSPITAL MIRROR · CAKE DEPARTMENT: HER, ALREADY EATING IT · FILMED ON LOCATION WHEREVER ALL THE ATTENTION HAPPENS TO BE · © THIS YEAR, THE DEPARTMENT OF SIBLINGS — ALL RIGHTS RESERVED`,
  endLine: "now showing · the main character's birthday cut",

  skip: "skip intro",
};

/* ============================================================
   THE BOOK — pages 2 to 6 read from here.
   Short, honest sentences beat long ones. Add or delete freely.
============================================================ */

/* page 2 — the letter (paragraphs, in order) */
export const LETTER = {
  hello: "hey you,",
  paragraphs: [
    "I am not good at saying this out loud, so I did the sensible thing and made an entire book about it. The funny pages are a cover. This one isn't.",
    "Here it is, plainly: I have watched you walk into the hardest years of your life — the exams, the shifts, the weeks you slept in your notes — and you kept showing up. Not dramatically. Just steadily, the way you do everything.",
    "You have always been the person who remembers what everyone else likes. I still think about the last prawn on the plate, offered over like it was nothing, because you knew I wanted it.",
    "And somehow, between all of that, you managed to become the funniest person in every room you walk into. I have no idea how you do both. I have stopped trying to keep up.",
    "So: happy birthday. No spell, no certificate, no committee. Just me saying the thing I usually say badly — I am glad you're mine, and I am proud of you.",
  ],
  bye: "love, always —",
};

/* page 4 — the exhibit cards (tap to flip) */
export const EXHIBITS = [
  {
    tag: "EXHIBIT A",
    emoji: "🍤",
    title: "Prawns",
    front: "Will reorder them, will share them, will talk about them for a week.",
    back: "Every restaurant we go to knows the order. This is a documented pattern.",
  },
  {
    tag: "EXHIBIT B",
    emoji: "🩺",
    title: "Medical school",
    front: "Chose the hardest thing on purpose, then actually did it.",
    back: "Reads about bones at midnight and still asks how my day was.",
  },
  {
    tag: "EXHIBIT C",
    emoji: "🎬",
    title: "Movies & series",
    front: '"One more episode," she says. Every single time.',
    back: "The record for 'one more episode' remains, to this day, unbroken.",
  },
  {
    tag: "EXHIBIT D",
    emoji: "🔊",
    title: "The laugh",
    front: "Loud enough to fix a bad day from three rooms away.",
    back: "Cannot be faked, cannot be ignored, works on everyone.",
  },
  {
    tag: "EXHIBIT E",
    emoji: "🫖",
    title: "The advice",
    front: "Says the thing you didn't want to hear. Gently. Then you do it.",
    back: "Being right is apparently a personality. It is annoyingly useful.",
  },
];

/* page 5 — sticky notes, dealt one at a time (shuffled each visit) */
export const NOTES = [
  "proud of you. said quietly, meant loudly.",
  "you were always the brave one.",
  "rest is part of the job, doctor.",
  "I would pick you again. every time.",
  "eat something. love, me.",
  "the best plot twist in this family was you.",
  "you are allowed to be tired. still proud.",
];

/* page 3 — polaroid captions (a few extra rotate in) */
export const CAPTIONS = [
  "exhibit A: the face when the prawns arrive",
  "exhibit B: three hours of sleep, still glowing",
  "exhibit C: mid-sentence, almost certainly right",
  "exhibit D: the laugh, in its natural habitat",
  "exhibit E: pretending she hasn't rewatched it",
  "exhibit F: cake-adjacent, deeply content",
];

/* page 6 — the last page */
export const CLOSING = {
  head: "that's the book.",
  body: "Everything in it was a joke except the last page, which was completely serious. Happy birthday — eat the prawns, finish the series, sleep sometimes, and call me when the shift ends.",
  meta: "bound by hand · one copy only · no reprints",
};

/* ---- per-visit shuffle (do not edit below this line) ---- */
function shuffle(pool) {
  return [...pool].sort(() => Math.random() - 0.5);
}

function pickN(pool, n) {
  return shuffle(pool).slice(0, n);
}

export const SHOW = {
  captions: pickN(CAPTIONS, Math.min(3, CAPTIONS.length)),
  notes: shuffle(NOTES),
};
