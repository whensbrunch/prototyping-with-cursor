"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./styles.module.css";

type WaveType = OscillatorType;
type FilterMode = "soft" | "bright" | "sharp";
type InputSource = "keyboard" | "mouse" | "touch";

type AudioGraph = {
  ctx: AudioContext;
  filter: BiquadFilterNode;
  analyser: AnalyserNode;
  master: GainNode;
};
type ActiveVoice = { osc: OscillatorNode; gain: GainNode };
type NoteEvent = {
  midi: number;
  velocity: number;
  originX: number;
  originY: number;
  isNoteOn: boolean;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
  saturation: number;
  lightness: number;
  midi: number;
};

const WHITE_KEYS: { noteName: string; midi: number }[] = [
  { noteName: "C3", midi: 48 },
  { noteName: "D3", midi: 50 },
  { noteName: "E3", midi: 52 },
  { noteName: "F3", midi: 53 },
  { noteName: "G3", midi: 55 },
  { noteName: "A3", midi: 57 },
  { noteName: "B3", midi: 59 },
  { noteName: "C4", midi: 60 },
  { noteName: "D4", midi: 62 },
  { noteName: "E4", midi: 64 },
  { noteName: "F4", midi: 65 },
  { noteName: "G4", midi: 67 },
  { noteName: "A4", midi: 69 },
  { noteName: "B4", midi: 71 },
  { noteName: "C5", midi: 72 },
];

const BLACK_KEYS: { noteName: string; midi: number; position: number }[] = [
  { noteName: "C#3", midi: 49, position: 0.7 },
  { noteName: "D#3", midi: 51, position: 1.7 },
  { noteName: "F#3", midi: 54, position: 3.7 },
  { noteName: "G#3", midi: 56, position: 4.7 },
  { noteName: "A#3", midi: 58, position: 5.7 },
  { noteName: "C#4", midi: 61, position: 7.7 },
  { noteName: "D#4", midi: 63, position: 8.7 },
  { noteName: "F#4", midi: 66, position: 10.7 },
  { noteName: "G#4", midi: 68, position: 11.7 },
  { noteName: "A#4", midi: 70, position: 12.7 },
];
const MIN_MIDI = WHITE_KEYS[0]?.midi ?? 48;
const MAX_MIDI = WHITE_KEYS[WHITE_KEYS.length - 1]?.midi ?? 72;
const PARTICLE_CAP = 540;

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function DigitalPianoPrototype() {
  const audioGraphRef = useRef<AudioGraph | null>(null);
  const activeVoicesRef = useRef<Map<number, ActiveVoice>>(new Map());
  const sustainedNotesRef = useRef<Set<number>>(new Set());
  const particlesRef = useRef<Particle[]>([]);
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const sustainRef = useRef(false);

  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [isSustainOn, setIsSustainOn] = useState(false);
  const [waveType, setWaveType] = useState<WaveType>("sine");
  const [filterMode, setFilterMode] = useState<FilterMode>("bright");
  const [volume, setVolume] = useState(0.22);
  const [decayMs, setDecayMs] = useState(320);
  const [particleAmount, setParticleAmount] = useState(1);
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [particleGravity, setParticleGravity] = useState(1);
  const [particleSize, setParticleSize] = useState(1);
  const [particleLifespan, setParticleLifespan] = useState(1);
  const [particleGlow, setParticleGlow] = useState(1);
  const [trailFade, setTrailFade] = useState(0.24);

  const sourceVelocity = useCallback((source: InputSource): number => {
    if (source === "mouse") return 0.95;
    if (source === "touch") return 0.9;
    return 0.78;
  }, []);

  const getParticleOrigin = useCallback((midi: number): { x: number; y: number } => {
    const canvas = visualizerRef.current;
    const width = canvas?.width ?? 920;
    const height = canvas?.height ?? 140;
    const normalized = (midi - MIN_MIDI) / (MAX_MIDI - MIN_MIDI);
    return {
      x: width * Math.min(Math.max(normalized, 0), 1),
      y: height * 0.52,
    };
  }, []);

  const spawnParticlesForNote = useCallback((noteEvent: NoteEvent) => {
    const { midi, velocity, originX, originY, isNoteOn } = noteEvent;
    const particles = particlesRef.current;
    const pitchNorm = Math.min(Math.max((midi - MIN_MIDI) / (MAX_MIDI - MIN_MIDI), 0), 1);
    const burstCountBase = isNoteOn ? 10 : 4;
    const burstCount = Math.floor((burstCountBase + velocity * (isNoteOn ? 18 : 8)) * particleAmount);
    const speed = ((isNoteOn ? 70 : 35) + velocity * (isNoteOn ? 200 : 100)) * particleSpeed;

    for (let i = 0; i < burstCount; i += 1) {
      const angle = (Math.random() - 0.5) * Math.PI * (isNoteOn ? 1.2 : 0.75);
      const directionBias = (0.5 - pitchNorm) * 150;
      const impulse = speed * (0.45 + Math.random() * 0.75);

      particles.push({
        x: originX + (Math.random() - 0.5) * 14,
        y: originY + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * impulse * 0.65,
        vy: Math.sin(angle) * impulse + directionBias,
        gravity: (24 + (1 - pitchNorm) * 180) * particleGravity,
        size: (1.8 + velocity * 2.6 + Math.random() * 2.4) * particleSize,
        life: 0,
        maxLife: (isNoteOn ? 1.9 + Math.random() * 1.6 : 1.15 + Math.random() * 0.8) * particleLifespan,
        hue: 296 - pitchNorm * 112 + (Math.random() - 0.5) * 16,
        saturation: Math.min((74 + velocity * 18) * particleGlow, 100),
        lightness: Math.min((32 + pitchNorm * 48) * particleGlow, 94),
        midi,
      });
    }

    if (particles.length > PARTICLE_CAP) {
      particles.splice(0, particles.length - PARTICLE_CAP);
    }
  }, [particleAmount, particleGlow, particleGravity, particleLifespan, particleSize, particleSpeed]);

  const updateParticles = useCallback((dt: number) => {
    const particles = particlesRef.current;
    const activeSustains = sustainedNotesRef.current;
    const sustainActive = sustainRef.current;

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      const noteLingers = sustainActive && activeSustains.has(particle.midi);
      const lifeRate = noteLingers ? 0.32 : 1;
      const shrinkRate = noteLingers ? 0.06 : 0.2;

      particle.life += dt * lifeRate;
      particle.vy += particle.gravity * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.size *= Math.max(0.82, 1 - dt * shrinkRate);
      particle.vx *= 0.996;

      if (
        particle.life >= particle.maxLife ||
        particle.size <= 0.35 ||
        particle.y > 220 ||
        particle.x < -30 ||
        particle.x > 950
      ) {
        particles.splice(i, 1);
      }
    }
  }, []);

  const drawParticles = useCallback((ctx2d: CanvasRenderingContext2D) => {
    particlesRef.current.forEach((particle) => {
      const lifeProgress = Math.min(particle.life / particle.maxLife, 1);
      const alpha = (1 - lifeProgress) ** 1.2;
      ctx2d.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${alpha})`;
      ctx2d.beginPath();
      ctx2d.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx2d.fill();
    });
  }, []);

  const getOrCreateAudioGraph = useCallback((): AudioGraph | null => {
    if (audioGraphRef.current) return audioGraphRef.current;
    if (typeof window === "undefined" || !window.AudioContext) return null;

    const ctx = new window.AudioContext();
    const filter = ctx.createBiquadFilter();
    const analyser = ctx.createAnalyser();
    const master = ctx.createGain();

    filter.type = "lowpass";
    filter.frequency.value = 2600;
    filter.Q.value = 1.5;

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.88;

    master.gain.value = volume;

    filter.connect(master);
    master.connect(analyser);
    analyser.connect(ctx.destination);

    const graph = { ctx, filter, analyser, master };
    audioGraphRef.current = graph;
    return graph;
  }, [volume]);

  useEffect(() => {
    const graph = audioGraphRef.current;
    if (!graph) return;

    graph.master.gain.setValueAtTime(volume, graph.ctx.currentTime);
  }, [volume]);

  useEffect(() => {
    const graph = audioGraphRef.current;
    if (!graph) return;

    if (filterMode === "soft") {
      graph.filter.frequency.value = 1300;
      graph.filter.Q.value = 0.7;
    } else if (filterMode === "bright") {
      graph.filter.frequency.value = 2600;
      graph.filter.Q.value = 1.5;
    } else {
      graph.filter.frequency.value = 4200;
      graph.filter.Q.value = 4;
    }
  }, [filterMode]);

  const startNote = useCallback(
    (midi: number) => {
      if (activeVoicesRef.current.has(midi)) return;
      const graph = getOrCreateAudioGraph();
      if (!graph) return;

      const { ctx, filter } = graph;
      if (ctx.state === "suspended") ctx.resume();

      const frequency = midiToFrequency(midi);
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.value = frequency;

      osc.connect(noteGain);
      noteGain.connect(filter);

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.9, now + 0.01);
      activeVoicesRef.current.set(midi, { osc, gain: noteGain });
      osc.onended = () => {
        if (activeVoicesRef.current.get(midi)?.osc === osc) {
          activeVoicesRef.current.delete(midi);
        }
      };
      osc.start(now);
    },
    [getOrCreateAudioGraph, waveType]
  );

  const stopNote = useCallback((midi: number) => {
    const graph = audioGraphRef.current;
    const voice = activeVoicesRef.current.get(midi);
    if (!graph || !voice) return;

    const now = graph.ctx.currentTime;
    const releaseSeconds = decayMs / 1000;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseSeconds);
    voice.osc.stop(now + releaseSeconds + 0.02);
    activeVoicesRef.current.delete(midi);
  }, [decayMs]);

  const handleSustainChange = useCallback((enabled: boolean) => {
    sustainRef.current = enabled;
    setIsSustainOn(enabled);
    if (!enabled) {
      sustainedNotesRef.current.forEach((midi) => stopNote(midi));
      sustainedNotesRef.current.clear();
    }
  }, [stopNote]);

  const handleKeyDown = useCallback((midi: number, source: InputSource = "keyboard") => {
    const velocity = sourceVelocity(source);
    const origin = getParticleOrigin(midi);
    spawnParticlesForNote({ midi, velocity, originX: origin.x, originY: origin.y, isNoteOn: true });

    setPressedKeys((prev) => new Set(prev).add(midi));
    sustainedNotesRef.current.delete(midi);
    if (activeVoicesRef.current.has(midi)) return;
    startNote(midi);
  }, [getParticleOrigin, sourceVelocity, spawnParticlesForNote, startNote]);

  const handleKeyUp = useCallback((midi: number, source: InputSource = "keyboard") => {
    const velocity = sourceVelocity(source);
    const origin = getParticleOrigin(midi);
    spawnParticlesForNote({ midi, velocity: velocity * 0.7, originX: origin.x, originY: origin.y, isNoteOn: false });

    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
    if (sustainRef.current) {
      sustainedNotesRef.current.add(midi);
      return;
    }
    stopNote(midi);
  }, [getParticleOrigin, sourceVelocity, spawnParticlesForNote, stopNote]);

  useEffect(() => {
    return () => {
      handleSustainChange(false);
      activeVoicesRef.current.forEach((voice, midi) => {
        stopNote(midi);
        voice.osc.onended = null;
      });
      const graph = audioGraphRef.current;
      if (graph) graph.ctx.close();
    };
  }, [handleSustainChange, stopNote]);

  useEffect(() => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const draw = () => {
      const nowMs = performance.now();
      const dt = lastFrameTimeRef.current ? Math.min((nowMs - lastFrameTimeRef.current) / 1000, 0.05) : 1 / 60;
      lastFrameTimeRef.current = nowMs;
      const graph = audioGraphRef.current;

      const width = canvas.width;
      const height = canvas.height;
      ctx2d.fillStyle = `rgba(13, 2, 33, ${trailFade})`;
      ctx2d.fillRect(0, 0, width, height);

      updateParticles(dt);
      drawParticles(ctx2d);

      ctx2d.strokeStyle = "rgba(5, 217, 232, 0.25)";
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(0, height / 2);
      ctx2d.lineTo(width, height / 2);
      ctx2d.stroke();

      if (graph) {
        const { analyser } = graph;
        const buffer = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buffer);

        ctx2d.strokeStyle = "#05d9e8";
        ctx2d.lineWidth = 2;
        ctx2d.beginPath();
        for (let i = 0; i < buffer.length; i += 1) {
          const x = (i / (buffer.length - 1)) * width;
          const y = (buffer[i] / 255) * height;
          if (i === 0) {
            ctx2d.moveTo(x, y);
          } else {
            ctx2d.lineTo(x, y);
          }
        }
        ctx2d.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastFrameTimeRef.current = 0;
    };
  }, [drawParticles, trailFade, updateParticles]);

  useEffect(() => {
    const whiteMap: Record<string, number> = {};
    WHITE_KEYS.forEach((k, i) => {
      const keys = "asdfghjklzxcvbn";
      if (keys[i] !== undefined) whiteMap[keys[i]] = k.midi;
    });

    const blackMap: Record<string, number> = {};
    BLACK_KEYS.forEach((k, i) => {
      const keys = "qwertyuiop";
      if (keys[i] !== undefined) blackMap[keys[i]] = k.midi;
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === " " || key === "spacebar" || key === "shift") {
        e.preventDefault();
        handleSustainChange(true);
        return;
      }
      const midi = whiteMap[key] ?? blackMap[key];
      if (midi === undefined) return;
      e.preventDefault();
      handleKeyDown(midi, "keyboard");
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === " " || key === "spacebar" || key === "shift") {
        e.preventDefault();
        handleSustainChange(false);
        return;
      }
      const midi = whiteMap[key] ?? blackMap[key];
      if (midi === undefined) return;
      e.preventDefault();
      handleKeyUp(midi, "keyboard");
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, handleSustainChange]);

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
      </div>
      <main className={styles.main}>
        <h1 className={styles.title}>Digital piano</h1>
        <p className={styles.subtitle}>
          Click keys or use keyboard (A-N for white, Q-P for black, hold Space/Shift for sustain)
        </p>

        <section className={styles.controlPanel}>
          <h2 className={styles.panelTitle}>Sound controls</h2>

          <div className={styles.controlsGrid}>
            <label className={styles.controlItem}>
              <span>Wave shape</span>
              <select value={waveType} onChange={(e) => setWaveType(e.target.value as WaveType)}>
                <option value="sine">Sine (smooth)</option>
                <option value="triangle">Triangle (warm)</option>
                <option value="square">Square (chiptune)</option>
                <option value="sawtooth">Sawtooth (edgy)</option>
              </select>
            </label>

            <label className={styles.controlItem}>
              <span>Tone quality</span>
              <select value={filterMode} onChange={(e) => setFilterMode(e.target.value as FilterMode)}>
                <option value="soft">Soft</option>
                <option value="bright">Bright</option>
                <option value="sharp">Sharp</option>
              </select>
            </label>

            <label className={styles.controlItem}>
              <span>Volume: {Math.round(volume * 100)}%</span>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Release: {decayMs}ms</span>
              <input
                type="range"
                min="120"
                max="900"
                step="10"
                value={decayMs}
                onChange={(e) => setDecayMs(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Particle amount: {particleAmount.toFixed(2)}x</span>
              <input
                type="range"
                min="0.4"
                max="2.4"
                step="0.05"
                value={particleAmount}
                onChange={(e) => setParticleAmount(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Particle speed: {particleSpeed.toFixed(2)}x</span>
              <input
                type="range"
                min="0.5"
                max="2.2"
                step="0.05"
                value={particleSpeed}
                onChange={(e) => setParticleSpeed(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Gravity pull: {particleGravity.toFixed(2)}x</span>
              <input
                type="range"
                min="0.35"
                max="2.2"
                step="0.05"
                value={particleGravity}
                onChange={(e) => setParticleGravity(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Particle size: {particleSize.toFixed(2)}x</span>
              <input
                type="range"
                min="0.55"
                max="2.1"
                step="0.05"
                value={particleSize}
                onChange={(e) => setParticleSize(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Lifespan: {particleLifespan.toFixed(2)}x</span>
              <input
                type="range"
                min="0.45"
                max="2.2"
                step="0.05"
                value={particleLifespan}
                onChange={(e) => setParticleLifespan(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Glow intensity: {particleGlow.toFixed(2)}x</span>
              <input
                type="range"
                min="0.55"
                max="1.6"
                step="0.05"
                value={particleGlow}
                onChange={(e) => setParticleGlow(Number(e.target.value))}
              />
            </label>

            <label className={styles.controlItem}>
              <span>Trail fade: {trailFade.toFixed(2)}</span>
              <input
                type="range"
                min="0.08"
                max="0.5"
                step="0.01"
                value={trailFade}
                onChange={(e) => setTrailFade(Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        <section className={styles.visualizerPanel}>
          <h2 className={styles.panelTitle}>Waveform</h2>
          <p className={styles.quickstartText}>
            Particle engine: higher notes rise and glow brighter, lower notes fall heavier. Sustain is{" "}
            <span className={isSustainOn ? styles.sustainOn : styles.sustainOff}>
              {isSustainOn ? "ON" : "OFF"}
            </span>
            .
          </p>
          <canvas
            ref={visualizerRef}
            className={styles.visualizer}
            width={920}
            height={140}
            aria-label="Live sound wave display"
          />
        </section>

        <div className={styles.pianoWrap}>
          <div className={styles.piano}>
            <div className={styles.whiteRow}>
              {WHITE_KEYS.map(({ noteName, midi }) => (
                <button
                  key={midi}
                  type="button"
                  className={`${styles.whiteKey} ${pressedKeys.has(midi) ? styles.whiteKeyActive : ""}`}
                  onMouseDown={() => handleKeyDown(midi, "mouse")}
                  onMouseUp={() => handleKeyUp(midi, "mouse")}
                  onMouseLeave={() => handleKeyUp(midi, "mouse")}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyDown(midi, "touch");
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleKeyUp(midi, "touch");
                  }}
                  aria-label={`Play ${noteName}`}
                />
              ))}
            </div>

            <div className={styles.blackRow}>
              {BLACK_KEYS.map(({ noteName, midi, position }) => (
                <button
                  key={midi}
                  type="button"
                  className={`${styles.blackKey} ${pressedKeys.has(midi) ? styles.blackKeyActive : ""}`}
                  style={{ left: `calc(${(position / 15) * 100}% - var(--black-key-width) / 2)` }}
                  onMouseDown={() => handleKeyDown(midi, "mouse")}
                  onMouseUp={() => handleKeyUp(midi, "mouse")}
                  onMouseLeave={() => handleKeyUp(midi, "mouse")}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyDown(midi, "touch");
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleKeyUp(midi, "touch");
                  }}
                  aria-label={`Play ${noteName}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
