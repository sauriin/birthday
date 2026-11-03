import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HER_NAME, INTRO, UNLOCK_AT, VIDEO } from "./birthday.config";

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

/* ================= the movie-ad intro ================= */
const HOLDS = [5000, 5000, 5000, 5000]; // ms on each card — 5s, so there's time to read

function Intro({ onDone }) {
  const [beat, setBeat] = useState(0);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black px-6">
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
        className="press absolute right-4 top-4 z-10 cursor-pointer border border-white/25 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/60 hover:border-white/60 hover:text-white"
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
  const [muted, setMuted] = useState(false);
  const [pct, setPct] = useState(0);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const play = async () => {
    const v = vidRef.current;
    if (!v) return;
    try {
      await v.play();
      setStatus("playing");
      tick(660);
    } catch {
      setStatus("paused");
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
    <main className="relative min-h-[100dvh] w-full overflow-y-auto no-scrollbar bg-[#0b0908] font-body selection:bg-[#ffe9a3] selection:text-ink">
      {/* cinema glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, #23304a 0%, #141a26 45%, #0a0a0c 100%)",
        }}
      />

      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-9 sm:px-6">
        {/* — title — */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <p className="text-[11px] tracking-[0.5em] uppercase text-[#f3e6c9]/70">a film for</p>
          <h1 className="title font-black text-[clamp(2.4rem,9vw,4.2rem)] leading-none text-[#f7f0e1] mt-3 drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
            {HER_NAME}
          </h1>
          <p className="hand text-[clamp(22px,4vw,30px)] leading-tight text-[#f2c230] mt-2">
            {VIDEO.tagline}
          </p>
        </motion.header>

        {/* — the stage, fixed 16:9 — */}
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
          className="relative mt-7 w-full max-w-[min(94vw,860px)] sm:mt-9"
        >
          {/* washi tape, holding it to the page */}
          <span className="tape" style={{ top: -11, left: -14, transform: "rotate(-7deg)" }} />
          <span className="tape rose" style={{ top: -11, right: -14, left: "auto", transform: "rotate(6deg)" }} />

          <div
            ref={stageRef}
            className="relative aspect-video w-full overflow-hidden rounded-[3px] bg-black shadow-[0_30px_70px_rgba(0,0,0,0.65)] ring-1 ring-[#f2c230]/40"
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

            {/* idle — press play */}
            {status === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                onClick={toggle}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
              >
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 210, damping: 15 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f0e1]/95 border-4 border-[#f2c230] shadow-[0_14px_36px_rgba(0,0,0,0.6)]"
                >
                  <span className="ml-1.5 text-[30px] leading-none text-[#1f2a3a]">▶</span>
                </motion.span>
                <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-[#f3e6c9]/85">
                  tap to play · better with sound
                </p>
              </motion.div>
            )}

            {/* the end */}
            {status === "ended" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 px-6 text-center"
              >
                <p className="hand text-[clamp(26px,6vw,36px)] leading-tight text-[#f3e6c9]">
                  that one was for you, {HER_NAME} 🎂
                </p>
                <button
                  onClick={replay}
                  className="press mt-4 hand text-[25px] text-[#3a2a16] bg-[#f7f0e1] px-6 py-1.5 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.45)] border border-[#8a6a3f]/40 cursor-pointer"
                >
                  ↺ watch it again
                </button>
              </motion.div>
            )}

            {/* no film loaded yet */}
            {status === "missing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0b09]/96 px-6 text-center">
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

          {/* — transport strip — */}
          <div className="paper mt-3.5 flex items-center gap-3 rounded-sm border border-[#2f2b28]/15 px-3 py-2.5 text-[#2f2b28] shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
            <button
              onClick={toggle}
              aria-label={status === "playing" ? "pause" : "play"}
              className="press h-9 w-9 shrink-0 rounded-full bg-[#1f2a3a] text-[#f2c230] text-[12px] flex items-center justify-center cursor-pointer"
            >
              {status === "playing" ? "❚❚" : "▶"}
            </button>

            <span className="shrink-0 text-[11px] tabular-nums tracking-wide text-[#2f2b28]/75">
              {fmt(cur)} / {fmt(dur)}
            </span>

            <div className="relative h-6 flex-1 cursor-pointer" onClick={seek}>
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#2f2b28]/15" />
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

        {/* — under the screen — */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-7 text-center"
        >
          <p className="hand text-[clamp(22px,4vw,28px)] text-[#f3e6c9]">happy birthday, {HER_NAME} ♥</p>
          <p className="mt-2 text-[10px] tracking-[0.26em] uppercase text-[#f3e6c9]/55">
            space to pause · ← → to skip · {VIDEO.credit}
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

/* ================= the ad, then the film ================= */
export default function App() {
  const [phase, setPhase] = useState("intro");
  const left = useCountdown(TARGET);

  if (!left.done) return <Countdown left={left} />;
  if (phase === "intro") return <Intro onDone={() => setPhase("film")} />;
  return <Screen />;
}
