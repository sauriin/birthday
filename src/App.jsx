import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COUNTDOWN_ENABLED, GTA, HER_NAME, INTRO, UNLOCK_AT, VIDEO } from "./birthday.config";

/* ================= soft projector click ================= */
let audioCtx = null;
function tick(freq = 520) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + 0.09);
    g.gain.setValueAtTime(0.06, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.13);
  } catch {
    /* silent page */
  }
}

function fmt(s) {
  if (!isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/* ================= the countdown ================= */
const TARGET = new Date(UNLOCK_AT).getTime();

function diff(target) {
  const ms = target - Date.now();
  if (!isFinite(ms) || ms <= 0) return { done: true, d: 0, h: 0, m: 0, s: 0 };
  const total = Math.floor(ms / 1000);
  return {
    done: false,
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function useCountdown(target) {
  const [left, setLeft] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="title text-[clamp(30px,8.5vw,52px)] font-black leading-none tabular-nums text-ink">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 text-[7px] uppercase tracking-[0.3em] text-ink/45 sm:text-[8px]">{label}</span>
    </div>
  );
}

function Countdown({ left }) {
  const when = new Date(UNLOCK_AT);
  const dateLabel = isFinite(when.getTime())
    ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(when)
    : `${UNLOCK_AT}`;

  return (
    <main className="no-scrollbar relative min-h-[100dvh] w-full overflow-y-auto bg-[#d9c9a8] font-body">
      {/* paper grain over everything */}
      <div className="grain pointer-events-none fixed inset-0 z-0 opacity-60" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full max-w-[640px]"
        >
          {/* the ticket */}
          <div className="relative bg-paper shadow-[0_36px_90px_rgba(52,36,16,0.4)]">
            {/* red marquee top */}
            <div className="bg-[#8f2f26] px-5 py-2.5 text-center text-[8px] uppercase tracking-[0.42em] text-paper sm:text-[9px]">
              one night only · by invitation
            </div>

            <div className="px-5 pb-7 pt-6 sm:px-10 sm:pb-9 sm:pt-8">
              <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.3em] text-ink/40 sm:text-[9px]">
                <span>the birthday picture co.</span>
                <span className="tabular-nums">no. 001</span>
              </div>

              <p className="mt-7 text-center text-[9px] uppercase tracking-[0.5em] text-ink/55 sm:text-[10px]">
                the premiere of
              </p>
              <h1 className="title mt-2 text-center text-[clamp(2.6rem,11vw,4.4rem)] font-black leading-[0.92] text-ink">
                {HER_NAME}
              </h1>
              <p className="hand mt-1 text-center text-[clamp(21px,4.4vw,29px)] leading-tight text-[#8f2f26]">
                starts in a moment — well, in this many
              </p>

              {/* the perforated countdown strip */}
              <div className="relative mt-7 border-y border-dashed border-ink/25 py-5 sm:py-6">
                <div className="flex items-start divide-x divide-ink/10">
                  <Unit value={left.d} label="days" />
                  <Unit value={left.h} label="hours" />
                  <Unit value={left.m} label="minutes" />
                  <Unit value={left.s} label="seconds" />
                </div>
                <span className="ticket-notch -left-3 top-1/2 -translate-y-1/2" />
                <span className="ticket-notch -right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="text-center sm:text-left">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-ink/40">opening night</p>
                  <p className="title mt-0.5 text-[clamp(15px,3.4vw,19px)] text-ink">{dateLabel}</p>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-ink/45">midnight · doors at eleven</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-ink/40">admit</p>
                  <p className="title mt-0.5 text-[clamp(15px,3.4vw,19px)] text-ink">one · you</p>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-ink/45">seat: the good one</p>
                </div>
              </div>

              <div className="barcode mt-6 h-9 w-full opacity-75" />

              <p className="mt-3 text-center text-[7px] uppercase tracking-[0.3em] text-ink/40 sm:text-[8px]">
                no peeking till then · one copy only · no reprints · be early
              </p>
            </div>
          </div>

          {/* the rubber stamp */}
          <div className="pointer-events-none absolute -right-2 -top-4 z-10 rotate-[-13deg] sm:-right-6 sm:-top-6">
            <div className="stamp flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full border-[2.5px] border-[#8f2f26]/80 text-center sm:h-[88px] sm:w-[88px]">
              <span className="text-[6px] uppercase tracking-[0.2em] text-[#8f2f26] sm:text-[7px]">approved</span>
              <span className="title text-[13px] font-black uppercase leading-none text-[#8f2f26] sm:text-[15px]">
                for
              </span>
              <span className="text-[6px] uppercase tracking-[0.18em] text-[#8f2f26] sm:text-[7px]">birthdays</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

/* ================= the fake gta 6 release ================= */
const GTA_HOLDS = [2400, 8000, 3800]; // ms: boot → trailer → wrong file (then it cuts to the birthday)

function GtaTease({ onDone }) {
  const [beat, setBeat] = useState(0);
  const doneRef = useRef(false);
  // keep the latest callback, but stay stable so the beat timer is never torn down
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (beat >= GTA_HOLDS.length) {
      const t = setTimeout(finish, 420);
      return () => clearTimeout(t);
    }
    tick(beat === 0 ? 460 : beat === 1 ? 180 : 90);
    const t = setTimeout(() => setBeat((b) => b + 1), GTA_HOLDS[beat]);
    return () => clearTimeout(t);
  }, [beat, finish]);

  const card = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0b0708]">
      {/* red curtains either side of the hall */}
      <div className="curtain pointer-events-none absolute inset-y-0 left-0 z-10 w-[5vw] min-w-[22px] opacity-90" />
      <div className="curtain pointer-events-none absolute inset-y-0 right-0 z-10 w-[5vw] min-w-[22px] opacity-90" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(255,79,163,0.16) 0%, rgba(255,138,76,0.08) 38%, rgba(0,0,0,0) 74%)",
        }}
      />

      {/* the marquee strip */}
      <div className="safe-top relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-[#d9b25f]/20 bg-black/40 px-4 py-2 sm:px-8">
        <span className="text-[7px] uppercase tracking-[0.34em] text-[#d9b25f]/65 sm:text-[9px]">
          {GTA.studio}
        </span>
        <span className="flex items-center gap-2 text-[7px] uppercase tracking-[0.3em] text-white/70 sm:text-[9px]">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff2d55]" />
          live premiere
        </span>
      </div>

      <div className="relative z-20 flex flex-1 items-center justify-center overflow-hidden px-2 py-3 sm:px-6 sm:py-5">
        <AnimatePresence mode="wait">
          {/* 1 · the boot screen */}
          {beat === 0 && (
            <motion.div key="boot" {...card} className="relative w-full max-w-[440px] text-center">
              <div className="reel mx-auto h-16 w-16 rounded-full border-[3px] border-white/10 border-t-[#ff9a3c]" />
              <p className="title mt-6 text-[clamp(20px,5vw,26px)] leading-tight text-white/85">{GTA.bootLine}</p>
              <div className="mx-auto mt-5 h-[3px] w-full max-w-[280px] overflow-hidden bg-white/10">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full bg-[linear-gradient(90deg,#ff4fa3,#ff9a3c,#ffd166)]"
                />
              </div>
              <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-white/30">{GTA.bootNote}</p>
            </motion.div>
          )}

          {/* 2 · the trailer, straight off Rockstar's channel */}
          {beat === 1 && (
            <motion.div
              key="trailer"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative max-h-full w-full max-w-[min(95vw,980px)]"
            >
              <div className="stage-16x9 relative w-full overflow-hidden bg-black shadow-[0_30px_100px_rgba(0,0,0,0.9)] ring-1 ring-[#d9b25f]/30">
                {/* the still, so it never looks broken while the player loads */}
                <img src={GTA.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
                <iframe
                  title={GTA.premiere}
                  src={`https://www.youtube.com/embed/${GTA.youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${GTA.youtubeId}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  frameBorder="0"
                />

                {/* grade + scanlines */}
                <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.8) 100%)",
                  }}
                />

                {/* premiere chrome */}
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                  <div className="flex items-center justify-between px-3 pt-2.5 sm:px-4">
                    <span className="text-[7px] uppercase tracking-[0.3em] text-white/70 sm:text-[9px]">
                      trailer one · 01:31
                    </span>
                    <span className="text-[7px] tabular-nums tracking-[0.2em] text-white/60 sm:text-[9px]">
                      {GTA.timecode}
                    </span>
                  </div>

                  {/* title block, bottom-left like a real trailer card */}
                  <div className="px-4 pb-7 text-left sm:px-7 sm:pb-9">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.7 }}
                      className="text-[6px] uppercase tracking-[0.46em] text-white/65 sm:text-[9px]"
                    >
                      {GTA.premiere}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      className="title mt-1 text-[clamp(13px,2.8vw,24px)] font-black uppercase leading-none tracking-[0.14em] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)]"
                    >
                      {GTA.titleTop}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5, duration: 0.9 }}
                      className="title text-[clamp(36px,min(13vw,15dvh),92px)] font-black italic leading-[0.85]"
                      style={{
                        backgroundImage: "linear-gradient(180deg,#ff6b9d 0%,#ff8a4c 55%,#ffd166 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        filter: "drop-shadow(0 0 30px rgba(255,79,163,0.5))",
                      }}
                    >
                      {GTA.vi}
                    </motion.div>
                  </div>
                </div>

                {/* the premiere ticker */}
                <div className="short-hide absolute inset-x-0 bottom-0 px-3 pb-2.5 sm:px-4">
                  <div className="flex items-end justify-between gap-3 pb-1.5 text-[7px] uppercase tracking-[0.24em] text-white/60 sm:text-[9px]">
                    <span>{GTA.trailerCaption}</span>
                    <span className="shrink-0">{GTA.muteNote}</span>
                  </div>
                  <div className="h-[2px] w-full bg-white/20">
                    <motion.div
                      initial={{ width: "3%" }}
                      animate={{ width: "42%" }}
                      transition={{ duration: 7.6, ease: "linear" }}
                      className="h-full bg-[linear-gradient(90deg,#ff4fa3,#ff9a3c)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3 · the glitch — wrong file */}
          {beat === 2 && (
            <motion.div
              key="glitch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative max-h-full w-full max-w-[min(95vw,980px)]"
            >
              <div className="stage-16x9 relative w-full overflow-hidden bg-black ring-1 ring-[#ff2d55]/40">
                <img src={GTA.poster} alt="" className="glitch-slice glitch-base" />
                <img src={GTA.poster} alt="" className="glitch-slice glitch-red" />
                <img src={GTA.poster} alt="" className="glitch-slice glitch-cyan" />
                <span className="glitch-tear t1" />
                <span className="glitch-tear t2" />
                <span className="glitch-tear t3" />
                <div className="scanlines absolute inset-0 opacity-60" />

                <div className="absolute inset-0 flex flex-col justify-between px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="glitch-text text-[clamp(19px,min(6vw,7dvh),50px)] font-black uppercase leading-none tracking-[0.16em] text-white">
                      {GTA.glitchTop}
                    </p>
                    <span className="mt-1 shrink-0 border border-[#ff2d55]/50 px-2 py-0.5 text-[7px] uppercase tracking-[0.24em] text-[#ff2d55] sm:text-[9px]">
                      {GTA.glitchMid}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1 border-l-2 border-[#ff2d55]/60 pl-3 font-mono text-[7px] uppercase tracking-[0.14em] text-white/70 sm:text-[9px]">
                      {GTA.glitchLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6, duration: 0.4 }}
                      className="shrink-0 font-mono text-[7px] uppercase tracking-[0.24em] text-[#ffd166] sm:text-[9px]"
                    >
                      {GTA.glitchFix}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the bottom rail */}
      <div className="safe-bottom relative z-20 flex shrink-0 items-center justify-between gap-3 border-t border-[#d9b25f]/15 bg-black/40 px-4 py-2 sm:px-8">
        <p className="text-[7px] uppercase tracking-[0.28em] text-white/35 sm:text-[9px]">
          a rockstar production · allegedly
        </p>
        <button
          onClick={finish}
          className="press cursor-pointer border border-white/20 px-2.5 py-1 text-[8px] uppercase tracking-[0.2em] text-white/60 hover:border-white/60 hover:text-white sm:text-[10px]"
        >
          {GTA.skip} ›
        </button>
      </div>
    </div>
  );
}

/* ================= the movie-ad intro ================= */
const HOLDS = [5000, 5000, 5000, 5000]; // ms on each card — 5s, so there's time to read

function Intro({ onDone }) {
  const [beat, setBeat] = useState(0);
  const doneRef = useRef(false);
  // same trick as the tease: a stable finish keeps the card timer alive
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (beat >= HOLDS.length) {
      const t = setTimeout(finish, 450);
      return () => clearTimeout(t);
    }
    tick(beat === 0 ? 300 : 540);
    const t = setTimeout(() => setBeat((b) => b + 1), HOLDS[beat]);
    return () => clearTimeout(t);
  }, [beat, finish]);

  const card = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <div className="no-scrollbar fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#dccdaa] text-ink">
      <div className="grain pointer-events-none fixed inset-0 z-0 opacity-60" />

      {/* the film strip runs along the top and bottom of the programme */}
      <div className="filmstrip relative z-10 h-4 w-full shrink-0" />

      <div className="relative z-10 flex flex-1 flex-col px-4 py-4 sm:px-10 sm:py-6">
        <div className="flex items-center justify-between gap-3 text-[7px] uppercase tracking-[0.32em] text-ink/45 sm:text-[9px]">
          <span className="hidden sm:inline">a birthday picture · programme</span>
          <span className="sm:hidden">the programme</span>
          <span className="tabular-nums">
            0{Math.min(beat + 1, HOLDS.length)} / 0{HOLDS.length}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-5">
          <AnimatePresence mode="wait">
            {/* 1 · the approval band */}
            {beat === 0 && (
              <motion.div
                key="band"
                {...card}
                className="relative w-full max-w-[520px] rotate-[-0.6deg] border-[3px] border-ink bg-[#14b24b] px-5 py-6 text-center text-ink shadow-[0_26px_60px_rgba(52,36,16,0.35)] sm:px-8 sm:py-8"
              >
                <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-2" />
                <p className="text-[clamp(15px,4vw,21px)] font-bold uppercase leading-[1.25] tracking-[0.01em]">
                  {INTRO.bandTop}
                  <br />
                  {INTRO.bandMid}
                </p>
                <div className="mx-auto my-4 h-px w-2/3 bg-ink/60" />
                <p className="text-[10px] uppercase leading-relaxed tracking-[0.16em]">{INTRO.bandBy}</p>
                <p className="mt-4 inline-block border border-ink px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]">
                  {INTRO.bandRate}
                </p>
              </motion.div>
            )}

            {/* 2 · the studio ident */}
            {beat === 1 && (
              <motion.div key="studio" {...card} className="relative w-full max-w-[560px] text-center">
                <div className="mx-auto mb-5 flex items-center justify-center gap-3">
                  <span className="h-px w-10 bg-ink/30" />
                  <span className="text-[9px] uppercase tracking-[0.38em] text-ink/50">{INTRO.studioSub}</span>
                  <span className="h-px w-10 bg-ink/30" />
                </div>
                <h2 className="title mx-auto max-w-[620px] text-[clamp(19px,4.8vw,34px)] font-bold uppercase leading-[1.2] tracking-[0.14em] text-ink">
                  {INTRO.studio}
                </h2>
                <p className="mx-auto mt-4 h-px w-16 bg-[#8f2f26]" />
                <p className="hand mt-3 text-[clamp(26px,5.4vw,34px)] leading-none text-[#8f2f26]">{INTRO.presents}</p>
              </motion.div>
            )}

            {/* 3 · the title */}
            {beat === 2 && (
              <motion.div key="title" {...card} className="relative w-full max-w-[640px] text-center">
                <p className="text-[9px] uppercase tracking-[0.44em] text-ink/50 sm:text-[10px]">{INTRO.kicker}</p>
                <h1 className="title mt-4 border-y-2 border-ink/15 py-5 text-[clamp(34px,11.5vw,76px)] font-black uppercase leading-[0.9] tracking-[-0.01em] text-ink">
                  {INTRO.title}
                </h1>
                <p className="hand mt-4 text-[clamp(21px,4.4vw,30px)] leading-tight text-[#8f2f26]">{INTRO.sub}</p>
              </motion.div>
            )}

            {/* 4 · the billing block */}
            {beat === 3 && (
              <motion.div
                key="billing"
                {...card}
                className="relative w-full max-w-[600px] bg-paper/80 px-5 py-6 text-center shadow-[0_20px_50px_rgba(52,36,16,0.22)] sm:px-8 sm:py-7"
              >
                <p className="mx-auto max-w-[580px] text-[clamp(8px,2vw,11px)] uppercase leading-[1.7] tracking-[0.03em] text-ink/75">
                  {INTRO.billing}
                </p>
                <div className="mx-auto my-5 h-px w-24 bg-[#8f2f26]/50" />
                <p className="text-[8px] uppercase tracking-[0.3em] text-ink/45 sm:text-[9px]">{INTRO.endLine}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* progress dots */}
        <div className="flex items-center justify-center gap-2 pb-1">
          {HOLDS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === beat ? "w-6 bg-[#8f2f26]" : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="filmstrip relative z-10 h-4 w-full shrink-0" />

      <button
        onClick={finish}
        className="press safe-top absolute right-3 z-20 cursor-pointer border border-ink/25 bg-paper/70 px-2.5 py-1 text-[8px] uppercase tracking-[0.2em] text-ink/60 hover:border-ink/70 hover:text-ink sm:right-6 sm:text-[10px]"
      >
        {INTRO.skip} ›
      </button>
    </div>
  );
}

/* ================= the film ================= */
function Screen() {
  const vidRef = useRef(null);
  const stageRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | playing | paused | ended | missing
  const [muted, setMuted] = useState(true);
  const [blocked, setBlocked] = useState(false); // autoplay + fullscreen both refused
  const [buffering, setBuffering] = useState(true);
  const [pct, setPct] = useState(0);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [showBar, setShowBar] = useState(true);
  const hideTimer = useRef(null);

  const revealBar = useCallback(() => {
    setShowBar(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowBar(false), 2600);
  }, []);

  const enterFullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el || document.fullscreenElement || !el.requestFullscreen) return;
    el.requestFullscreen().catch(() => {});
  }, []);

  /* no tap-to-play: start it ourselves, sound first, muted if the browser objects */
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    let cancelled = false;

    const start = async () => {
      try {
        v.muted = false;
        await v.play();
        if (cancelled) return;
        setMuted(false);
        setStatus("playing");
      } catch {
        if (cancelled) return;
        v.muted = true;
        setMuted(true);
        try {
          await v.play();
          if (!cancelled) setStatus("playing");
        } catch {
          if (!cancelled) {
            setStatus("paused");
            setBlocked(true);
          }
        }
      }
    };
    start();

    /* real fullscreen needs a gesture — take the very first one available */
    enterFullscreen();
    const onFirstGesture = () => {
      enterFullscreen();
      const el = vidRef.current;
      if (el && el.muted) {
        el.muted = false;
        setMuted(false);
        setBlocked(false);
      }
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true });

    return () => {
      cancelled = true;
      clearTimeout(hideTimer.current);
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
  }, [enterFullscreen]);

  useEffect(() => {
    if (status === "playing") revealBar();
    else {
      clearTimeout(hideTimer.current);
      setShowBar(true);
    }
  }, [status, revealBar]);

  const play = async () => {
    const v = vidRef.current;
    if (!v) return;
    try {
      await v.play();
      setStatus("playing");
      setBlocked(false);
      tick(660);
    } catch {
      setStatus("paused");
      setBlocked(true);
    }
  };

  const toggle = () => {
    const v = vidRef.current;
    if (!v || status === "missing" || status === "ended") return;
    if (v.paused) play();
    else {
      v.pause();
      setStatus("paused");
    }
  };

  const skip = (s) => {
    const v = vidRef.current;
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + s));
  };

  const seek = (e) => {
    e.stopPropagation();
    const v = vidRef.current;
    if (!v || !isFinite(v.duration)) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration;
  };

  const replay = (e) => {
    e.stopPropagation();
    const v = vidRef.current;
    if (!v) return;
    v.currentTime = 0;
    setPct(0);
    setCur(0);
    play();
  };

  const toggleMute = () => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    tick(v.muted ? 380 : 620);
  };

  const fullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  };

  /* space = play/pause · arrows = skip */
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight") skip(5);
      else if (e.key === "ArrowLeft") skip(-5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const file = VIDEO.src.split("/").pop() || "birthday.mp4";
  const barUp = showBar || status !== "playing";

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#12100e] font-body selection:bg-[#f2c230] selection:text-ink">
      {/* the dark hall */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 32%, #2b2320 0%, #17130f 52%, #0a0807 100%)" }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex h-full w-full flex-col"
      >
        {/* the programme strip above the screen */}
        <header
          className={`safe-top relative z-20 flex shrink-0 items-start justify-between gap-4 px-4 pt-2.5 transition-opacity duration-500 sm:px-8 ${
            barUp ? "opacity-100" : "opacity-0"
          }`}
        >
          <div>
            <p className="text-[7px] uppercase tracking-[0.42em] text-[#e8dcc4]/40 sm:text-[8px]">now showing</p>
            <h1 className="title text-[clamp(1.1rem,3.4vw,1.7rem)] font-black leading-none text-[#f7f0e1]">
              {HER_NAME}
            </h1>
            <p className="hand text-[clamp(14px,2.8vw,18px)] leading-tight text-[#d9b25f]">{VIDEO.tagline}</p>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-[8px] uppercase tracking-[0.34em] text-[#e8dcc4]/40">one copy only</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[#e8dcc4]/65">{VIDEO.credit}</p>
          </div>
        </header>

        {/* the screen */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2 pt-2 sm:px-6 sm:pb-5 sm:pt-3">
          <div
            ref={stageRef}
            onPointerMove={revealBar}
            onClick={revealBar}
            className="relative flex h-full max-h-full w-full max-w-[1200px] flex-col overflow-hidden bg-black shadow-[0_40px_120px_rgba(0,0,0,0.85)] ring-1 ring-[#e8dcc4]/15"
          >
            <video
              ref={vidRef}
              src={VIDEO.src}
              poster={VIDEO.poster || undefined}
              playsInline
              preload="auto"
              className="h-full w-full flex-1 object-contain"
              onClick={toggle}
              onPlay={() => setStatus("playing")}
              onPlaying={() => setBuffering(false)}
              onWaiting={() => setBuffering(true)}
              onCanPlay={() => setBuffering(false)}
              onPause={(e) => {
                if (!e.currentTarget.ended) setStatus("paused");
              }}
              onEnded={() => setStatus("ended")}
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setCur(v.currentTime);
                setPct(v.duration ? (v.currentTime / v.duration) * 100 : 0);
              }}
              onError={() => setStatus("missing")}
            />

            {/* still buffering the reel */}
            {buffering && !blocked && status !== "missing" && status !== "ended" && (
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55">
                <div className="reel h-12 w-12 rounded-full border-[3px] border-white/10 border-t-[#d9b25f]" />
                <p className="mt-4 text-[8px] uppercase tracking-[0.34em] text-[#e8dcc4]/70 sm:text-[9px]">
                  threading the reel…
                </p>
              </div>
            )}

            {/* only if the browser refuses to start it at all */}
            {blocked && status !== "missing" && status !== "ended" && (
              <button
                onClick={() => {
                  enterFullscreen();
                  play();
                }}
                className="press absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center bg-black/60"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d9b25f] text-[22px] leading-none text-[#d9b25f]">
                  ▶
                </span>
                <p className="mt-4 text-[8px] uppercase tracking-[0.3em] text-[#e8dcc4]/85 sm:text-[9px]">
                  tap once · it plays itself after this
                </p>
              </button>
            )}

            {/* the end */}
            {status === "ended" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-5 text-center sm:px-6"
              >
                <p className="text-[8px] uppercase tracking-[0.4em] text-[#e8dcc4]/50">the end</p>
                <p className="hand mt-2 text-[clamp(22px,5.6vw,36px)] leading-tight text-[#f7f0e1]">
                  that one was for you, {HER_NAME} 🎂
                </p>
                <button
                  onClick={replay}
                  className="press hand mt-5 cursor-pointer rounded-full border border-[#d9b25f]/40 bg-[#f7f0e1] px-6 py-1.5 text-[clamp(19px,4.6vw,25px)] text-[#3a2a16] shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
                >
                  ↺ watch it again
                </button>
              </motion.div>
            )}

            {/* no film loaded yet */}
            {status === "missing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0b09]/96 px-4 text-center sm:px-6">
                <span className="sway inline-block text-4xl">🎬</span>
                <p className="hand mt-3 text-[clamp(24px,5vw,30px)] leading-tight text-[#f3e6c9]">
                  the film is not in the projector yet
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-[#f3e6c9]/70">
                  drop it into <b className="font-mono text-[#f2c230]">public/{file}</b> — or point{" "}
                  <b className="font-mono text-[#f2c230]">VIDEO.src</b> at it in{" "}
                  <b className="font-mono text-[#f2c230]">src/birthday.config.js</b>
                </p>
              </div>
            )}

            {/* transport ticket, inside the frame so it survives fullscreen */}
            <div
              className={`absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-dashed border-[#2f2b28]/25 bg-[#f7f0e1] px-3 py-2 text-ink transition-opacity duration-500 sm:gap-3 sm:px-5 ${
                barUp ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <button
                onClick={toggle}
                aria-label={status === "playing" ? "pause" : "play"}
                className="press flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#8f2f26] text-[10px] text-[#f7f0e1] sm:h-9 sm:w-9 sm:text-[11px]"
              >
                {status === "playing" ? "❚❚" : "▶"}
              </button>

              <span className="shrink-0 font-mono text-[9px] tabular-nums tracking-wide text-ink/65 sm:text-[10px]">
                {fmt(cur)} / {fmt(dur)}
              </span>

              <div className="relative h-6 flex-1 cursor-pointer" onClick={seek}>
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink/15" />
                <div
                  className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#8f2f26]"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8f2f26]/50 bg-[#d9b25f] shadow-[0_2px_5px_rgba(40,28,12,0.35)]"
                  style={{ left: `${pct}%` }}
                />
              </div>

              <button
                onClick={toggleMute}
                aria-label={muted ? "unmute" : "mute"}
                className="press shrink-0 cursor-pointer text-[15px] leading-none"
              >
                {muted ? "🔇" : "🔊"}
              </button>

              <button
                onClick={fullscreen}
                aria-label="fullscreen"
                className="press shrink-0 cursor-pointer text-[16px] leading-none"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

/* ================= the tease, the ad, then the film ================= */
export default function App() {
  const [phase, setPhase] = useState(() => (GTA.enabled ? "gta" : "intro"));
  const left = useCountdown(TARGET);

  if (COUNTDOWN_ENABLED && !left.done) return <Countdown left={left} />;
  if (phase === "gta") return <GtaTease onDone={() => setPhase("intro")} />;
  if (phase === "intro") return <Intro onDone={() => setPhase("film")} />;
  return <Screen />;
}
