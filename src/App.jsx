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
    <div className="flex flex-col items-center">
      <div className="paper flex h-[clamp(62px,17vw,104px)] w-[clamp(62px,17vw,104px)] items-center justify-center rounded-sm border border-[#2f2b28]/20 shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
        <span className="title text-[clamp(26px,7.5vw,44px)] font-black leading-none tabular-nums text-[#2f2b28]">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-[9px] uppercase tracking-[0.3em] text-[#f3e6c9]/60">{label}</span>
    </div>
  );
}

function Countdown({ left }) {
  const when = new Date(UNLOCK_AT);
  const dateLabel = isFinite(when.getTime())
    ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(when)
    : `${UNLOCK_AT}`;

  return (
    <main className="relative min-h-[100dvh] w-full overflow-y-auto no-scrollbar bg-[#0b0908] font-body">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 38%, #23304a 0%, #141a26 45%, #0a0a0c 100%)" }}
      />

      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-[620px] text-center"
        >
          <p className="text-[11px] uppercase tracking-[0.5em] text-[#f3e6c9]/70">the premiere of</p>
          <h1 className="title mt-3 text-[clamp(2.3rem,9vw,4.2rem)] font-black leading-none text-[#f7f0e1] drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
            {HER_NAME}
          </h1>
          <p className="hand mt-2 text-[clamp(21px,4vw,29px)] leading-tight text-[#f2c230]">
            starts in a moment — well, in this many
          </p>

          <div className="mt-8 flex items-start justify-center gap-[clamp(6px,2.4vw,16px)]">
            <Unit value={left.d} label="days" />
            <Unit value={left.h} label="hours" />
            <Unit value={left.m} label="minutes" />
            <Unit value={left.s} label="seconds" />
          </div>

          <div className="mt-8 inline-block border border-[#f2c230]/40 bg-black/30 px-4 py-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3e6c9]/80">
              opening {dateLabel} · midnight
            </p>
          </div>

          <p className="mt-9 hand text-[clamp(21px,4vw,27px)] text-[#f3e6c9]">
            no peeking till then ♥
          </p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-[#f3e6c9]/45">
            one copy only · no reprints · be early
          </p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black px-3 py-3 sm:px-6 sm:py-6">
      {/* vice-city glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 68%, rgba(255,79,163,0.22) 0%, rgba(255,138,76,0.10) 36%, rgba(0,0,0,0) 72%)",
        }}
      />

      <AnimatePresence mode="wait">
        {/* 1 · the boot screen */}
        {beat === 0 && (
          <motion.div key="boot" {...card} className="relative w-full max-w-[460px] text-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/45">{GTA.studio}</p>
            <p className="title mt-3 text-[clamp(20px,5vw,26px)] leading-tight text-white/85">
              {GTA.bootLine}
            </p>
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
            className="relative max-h-full w-full max-w-[min(96vw,980px)]"
          >
            <div className="stage-16x9 relative w-full overflow-hidden bg-black shadow-[0_30px_90px_rgba(0,0,0,0.85)] ring-1 ring-white/15">
              {/* the still, so it never looks broken while the player loads */}
              <img
                src={GTA.poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
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
                    "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)",
                }}
              />

              {/* premiere chrome */}
              <div className="pointer-events-none absolute inset-0 flex flex-col">
                <div className="flex items-start justify-between px-3 pt-2.5 sm:px-4">
                  <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-white/80 sm:text-[9px]">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff2d55]" />
                    live premiere
                  </span>
                  <span className="text-[8px] tabular-nums tracking-[0.2em] text-white/60 sm:text-[9px]">
                    {GTA.timecode}
                  </span>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.7 }}
                    className="text-[7px] uppercase tracking-[0.5em] text-white/70 sm:text-[9px]"
                  >
                    {GTA.premiere}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.8 }}
                    className="title mt-2 text-[clamp(15px,3.6vw,30px)] font-black uppercase leading-none tracking-[0.14em] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.9)]"
                  >
                    {GTA.titleTop}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6, duration: 0.9 }}
                    className="title text-[clamp(38px,min(15vw,17dvh),104px)] font-black italic leading-[0.85]"
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

                <div className="short-hide px-3 pb-2.5 sm:px-4">
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
            className="relative max-h-full w-full max-w-[min(96vw,980px)]"
          >
            <div className="stage-16x9 relative w-full overflow-hidden bg-black ring-1 ring-[#ff2d55]/40">
              <img src={GTA.poster} alt="" className="glitch-slice glitch-base" />
              <img src={GTA.poster} alt="" className="glitch-slice glitch-red" />
              <img src={GTA.poster} alt="" className="glitch-slice glitch-cyan" />
              <span className="glitch-tear t1" />
              <span className="glitch-tear t2" />
              <span className="glitch-tear t3" />
              <div className="scanlines absolute inset-0 opacity-60" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="glitch-text text-[clamp(19px,min(6vw,7dvh),50px)] font-black uppercase leading-none tracking-[0.16em] text-white">
                  {GTA.glitchTop}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#ff2d55] sm:text-[11px]">
                  {GTA.glitchMid}
                </p>
                <div className="mt-3 space-y-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/70 sm:text-[10px]">
                  {GTA.glitchLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.4 }}
                  className="mt-4 font-mono text-[8px] uppercase tracking-[0.24em] text-[#ffd166] sm:text-[10px]"
                >
                  {GTA.glitchFix}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="press safe-top absolute right-3 z-10 cursor-pointer border border-white/25 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/60 hover:border-white/60 hover:text-white sm:right-4 sm:px-3 sm:text-[10px] sm:tracking-[0.24em]"
      >
        {GTA.skip} ›
      </button>
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
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <div className="no-scrollbar fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black px-4 py-8 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.9) 100%)" }}
      />

      <AnimatePresence mode="wait">
        {/* 1 · the approval band */}
        {beat === 0 && (
          <motion.div
            key="band"
            {...card}
            className="relative w-full max-w-[540px] border-[3px] border-black bg-[#14b24b] px-5 py-6 text-center text-black shadow-[0_0_70px_rgba(20,178,75,0.3)] sm:px-8 sm:py-8"
          >
            <p className="text-[clamp(15px,4vw,22px)] font-bold uppercase leading-[1.25] tracking-[0.01em]">
              {INTRO.bandTop}
              <br />
              {INTRO.bandMid}
            </p>
            <div className="mx-auto my-4 h-px w-2/3 bg-black/60" />
            <p className="text-[10px] uppercase leading-relaxed tracking-[0.16em]">{INTRO.bandBy}</p>
            <p className="mt-4 inline-block border border-black px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]">
              {INTRO.bandRate}
            </p>
          </motion.div>
        )}

        {/* 2 · the studio ident */}
        {beat === 1 && (
          <motion.div key="studio" {...card} className="relative text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">{INTRO.studioSub}</p>
            <h2 className="title mx-auto mt-4 max-w-[620px] text-[clamp(17px,4.6vw,32px)] font-bold uppercase leading-[1.2] tracking-[0.18em] text-[#f2c230]">
              {INTRO.studio}
            </h2>
            <p className="hand mt-3 text-[clamp(24px,5vw,32px)] leading-none text-white/75">{INTRO.presents}</p>
          </motion.div>
        )}

        {/* 3 · the title */}
        {beat === 2 && (
          <motion.div key="title" {...card} className="relative text-center">
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/55">{INTRO.kicker}</p>
            <h1 className="title mt-4 text-[clamp(34px,12vw,78px)] font-black uppercase leading-[0.92] tracking-[-0.01em] text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.9)]">
              {INTRO.title}
            </h1>
            <p className="hand mt-4 text-[clamp(21px,4.4vw,30px)] text-[#f2c230]">{INTRO.sub}</p>
          </motion.div>
        )}

        {/* 4 · the billing block */}
        {beat === 3 && (
          <motion.div key="billing" {...card} className="relative text-center">
            <p className="mx-auto max-w-[580px] text-[clamp(8px,2vw,11px)] uppercase leading-[1.6] tracking-[0.03em] text-white/75">
              {INTRO.billing}
            </p>
            <p className="mt-7 text-[9px] uppercase tracking-[0.3em] text-white/45">{INTRO.endLine}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={finish}
        className="press safe-top absolute right-3 z-10 cursor-pointer border border-white/25 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/60 hover:border-white/60 hover:text-white sm:right-4 sm:px-3 sm:text-[10px] sm:tracking-[0.24em]"
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

  return (
    <main className="fixed inset-0 overflow-hidden bg-black font-body selection:bg-[#ffe9a3] selection:text-ink">
      {/* soft vignette over the picture */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onPointerMove={revealBar}
        onClick={revealBar}
        className="relative h-full w-full"
      >
        {/* — a small dedication, only while the bar is up — */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className={`safe-top pointer-events-none absolute left-3 z-20 transition-opacity duration-700 sm:left-6 ${
            showBar ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-[8px] tracking-[0.4em] uppercase text-[#f3e6c9]/55">a film for</p>
          <h1 className="title text-[clamp(1.05rem,3.4vw,1.55rem)] font-black leading-none text-[#f7f0e1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            {HER_NAME}
          </h1>
          <p className="hand text-[clamp(14px,2.8vw,19px)] leading-tight text-[#f2c230]/85">
            {VIDEO.tagline}
          </p>
        </motion.header>

        <div
          ref={stageRef}
          className="relative h-full w-full overflow-hidden bg-black"
        >
            <video
              ref={vidRef}
              src={VIDEO.src}
              poster={VIDEO.poster || undefined}
              playsInline
              preload="auto"
              className="h-full w-full object-contain"
              onClick={toggle}
              onPlay={() => setStatus("playing")}
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

            {/* only if the browser refuses to start it at all */}
            {blocked && status !== "missing" && status !== "ended" && (
              <button
                onClick={() => {
                  enterFullscreen();
                  play();
                }}
                className="press absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center bg-black/55"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#f2c230] bg-[#f7f0e1]/95 text-[24px] leading-none text-[#1f2a3a]">
                  ▶
                </span>
                <p className="mt-3 text-[9px] tracking-[0.3em] uppercase text-[#f3e6c9]/85">
                  tap once · it plays itself after this
                </p>
              </button>
            )}

            {/* the end */}
            {status === "ended" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 px-5 text-center sm:px-6"
              >
                <p className="hand text-[clamp(22px,5.6vw,36px)] leading-tight text-[#f3e6c9]">
                  that one was for you, {HER_NAME} 🎂
                </p>
                <button
                  onClick={replay}
                  className="press mt-4 cursor-pointer rounded-full border border-[#8a6a3f]/40 bg-[#f7f0e1] px-5 py-1.5 text-[clamp(19px,4.6vw,25px)] text-[#3a2a16] shadow-[0_10px_20px_rgba(0,0,0,0.45)] sm:px-6 hand"
                >
                  ↺ watch it again
                </button>
              </motion.div>
            )}

            {/* no film loaded yet */}
            {status === "missing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0b09]/96 px-4 text-center sm:px-6">
                <span className="text-4xl sway inline-block">🎬</span>
                <p className="hand text-[clamp(24px,5vw,30px)] leading-tight text-[#f3e6c9] mt-3">
                  the film is not in the projector yet
                </p>
                <p className="text-[12px] leading-relaxed text-[#f3e6c9]/70 mt-3">
                  drop it into <b className="font-mono text-[#f2c230]">public/{file}</b> — or point{" "}
                  <b className="font-mono text-[#f2c230]">VIDEO.src</b> at it in{" "}
                  <b className="font-mono text-[#f2c230]">src/birthday.config.js</b>
                </p>
              </div>
            )}
          </div>

          {/* — transport bar, slides in on move and hides itself — */}
          <div
            className={`safe-bottom absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-white/10 bg-gradient-to-t from-black/90 via-black/65 to-black/5 px-3 pt-4 text-[#f3e6c9] transition-opacity duration-500 sm:gap-3 sm:px-5 ${
              showBar || status !== "playing" ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <button
              onClick={toggle}
              aria-label={status === "playing" ? "pause" : "play"}
              className="press flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1f2a3a] text-[11px] text-[#f2c230] sm:h-9 sm:w-9 sm:text-[12px]"
            >
              {status === "playing" ? "❚❚" : "▶"}
            </button>

            <span className="shrink-0 text-[9px] tabular-nums tracking-wide text-[#f3e6c9]/70 sm:text-[10px]">
              {fmt(cur)} / {fmt(dur)}
            </span>

            <div className="relative h-6 flex-1 cursor-pointer" onClick={seek}>
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
              <div
                className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#b8556a]"
                style={{ width: `${pct}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8a6a3f]/60 bg-[#f2c230] shadow-[0_2px_5px_rgba(40,28,12,0.4)]"
                style={{ left: `${pct}%` }}
              />
            </div>

            <button
              onClick={toggleMute}
              aria-label={muted ? "unmute" : "mute"}
              className="press shrink-0 text-[16px] leading-none cursor-pointer"
            >
              {muted ? "🔇" : "🔊"}
            </button>

            <button
              onClick={fullscreen}
              aria-label="fullscreen"
              className="press shrink-0 text-[17px] leading-none cursor-pointer"
            >
              ⛶
            </button>
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
