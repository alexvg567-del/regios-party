import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════
   REGIOS TV PARTY — Tournament App
   Host control panel for live party show
═══════════════════════════════════════════ */

const COLORS = {
  bg: "#0a0a0a",
  bgCard: "#111111",
  bgCard2: "#181818",
  orange: "#FF6B00",
  orangeGlow: "#FF6B0055",
  yellow: "#FFD600",
  cyan: "#00F5FF",
  magenta: "#FF00CC",
  green: "#00FF88",
  red: "#FF3355",
  white: "#FFFFFF",
  gray: "#444444",
  grayLight: "#888888",
};

const PLAYER_COLORS = [
  "#FF6B00", "#00F5FF", "#FFD600", "#FF00CC",
  "#00FF88", "#FF3355", "#A855F7",
];

const PLAYER_EMOJIS = ["🦁", "🐯", "🦊", "🐺", "🦅", "🐉", "🦄"];

const MINIGAMES = [
  { id: "cultura", label: "CULTURA GENERAL", emoji: "🧠", color: "#FFD600" },
  { id: "blackjack", label: "BLACKJACK", emoji: "🃏", color: "#00F5FF" },
  { id: "impostor", label: "IMPOSTOR", emoji: "🕵️", color: "#FF00CC" },
  { id: "pistas", label: "PISTAS PROGRESIVAS", emoji: "🔍", color: "#00FF88" },
];

const BLACKJACK_RANKS = [
  { chips: 1, pts: 10 }, { chips: 2, pts: 20 }, { chips: 3, pts: 35 },
  { chips: 4, pts: 50 }, { chips: 5, pts: 70 }, { chips: 6, pts: 90 }, { chips: 7, pts: 120 },
];

/* ───── Utility ───── */
function getRanking(players) {
  return [...players].sort((a, b) => b.points - a.points);
}

/* ───── Styles ───── */
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; height: 100%; background: #0a0a0a; overflow: hidden; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #FF6B00; border-radius: 2px; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{ box-shadow:0 0 0 0 #FF6B0088; } 50%{ box-shadow:0 0 0 12px #FF6B0000; } }
  @keyframes scanline { 0%{ background-position:0 0; } 100%{ background-position:0 100%; } }
  @keyframes glow { 0%,100%{ text-shadow:0 0 10px #FF6B00, 0 0 30px #FF6B0066; } 50%{ text-shadow:0 0 20px #FF6B00, 0 0 60px #FF6B0099, 0 0 80px #FF6B0033; } }
  @keyframes slideIn { from{ opacity:0; transform:translateX(-20px); } to{ opacity:1; transform:translateX(0); } }
  @keyframes pop { 0%{ transform:scale(0.8); opacity:0; } 70%{ transform:scale(1.05); } 100%{ transform:scale(1); opacity:1; } }
  @keyframes flash { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }
  @keyframes rankUp { from{ background:#00FF8844; } to{ background:transparent; } }
`;

/* ═══════════════════════════════════════════ COMPONENTS */

/* ── Glow Button ── */
function GlowBtn({ children, onClick, color = COLORS.orange, small, danger, style: sx }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{
        background: danger ? "#FF333522" : `${color}22`,
        border: `2px solid ${danger ? COLORS.red : color}`,
        color: danger ? COLORS.red : color,
        padding: small ? "6px 14px" : "10px 22px",
        borderRadius: 8,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: small ? 13 : 16,
        letterSpacing: 1,
        cursor: "pointer",
        textTransform: "uppercase",
        transition: "all 0.1s",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        boxShadow: pressed ? "none" : `0 0 12px ${danger ? COLORS.red : color}44`,
        ...sx,
      }}
    >
      {children}
    </button>
  );
}

/* ── Card ── */
function Card({ children, style: sx, glow }) {
  return (
    <div style={{
      background: COLORS.bgCard,
      border: `1px solid ${glow ? COLORS.orange : "#222"}`,
      borderRadius: 12,
      padding: 16,
      boxShadow: glow ? `0 0 20px ${COLORS.orangeGlow}` : "none",
      ...sx,
    }}>
      {children}
    </div>
  );
}

/* ── Badge ── */
function Badge({ children, color = COLORS.orange }) {
  return (
    <span style={{
      background: `${color}22`,
      border: `1px solid ${color}`,
      color,
      borderRadius: 6,
      padding: "2px 8px",
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      fontSize: 12,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}>{children}</span>
  );
}

/* ── Scoreboard Sidebar ── */
function Scoreboard({ players, currentGame }) {
  const ranked = getRanking(players);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{
      width: 200,
      background: "#0d0d0d",
      borderLeft: `2px solid ${COLORS.orange}33`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.orange}, #FF8C00)`,
        padding: "12px 14px",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#000", letterSpacing: 2 }}>MARCADOR</div>
        <div style={{ fontFamily: "'Barlow'", fontSize: 11, color: "#00000099", fontWeight: 600 }}>REGIOS TV PARTY</div>
      </div>

      {/* Players */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
        {ranked.map((p, i) => (
          <div key={p.id} style={{
            background: i === 0 ? `${p.color}18` : COLORS.bgCard2,
            border: `1px solid ${i === 0 ? p.color : "#222"}`,
            borderRadius: 10,
            padding: "8px 10px",
            animation: "slideIn 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>{p.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Barlow Condensed'",
                fontWeight: 700,
                fontSize: 13,
                color: i === 0 ? p.color : COLORS.white,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>{p.name}</div>
              <div style={{
                fontFamily: "'Bebas Neue'",
                fontSize: 20,
                color: i === 0 ? p.color : COLORS.grayLight,
                lineHeight: 1,
              }}>{p.points}</div>
            </div>
            <div style={{ fontSize: 16 }}>{medals[i] || `#${i + 1}`}</div>
          </div>
        ))}
      </div>

      {/* Prize reminder */}
      <div style={{
        padding: "10px 12px",
        textAlign: "center",
        borderTop: `1px solid #222`,
      }}>
        <div style={{ fontSize: 28 }}>🪗</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: COLORS.grayLight, letterSpacing: 1 }}>PREMIO: UKULELE</div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   SCREEN: SETUP
─────────────────────────────────────────── */
function SetupScreen({ onStart }) {
  const [names, setNames] = useState(["", "", "", ""]);
  const [error, setError] = useState("");

  const addPlayer = () => { if (names.length < 7) setNames([...names, ""]); };
  const removePlayer = (i) => { if (names.length > 4) setNames(names.filter((_, j) => j !== i)); };
  const updateName = (i, v) => { const n = [...names]; n[i] = v; setNames(n); };

  const handleStart = () => {
    const filled = names.map(n => n.trim()).filter(Boolean);
    if (filled.length < names.length) { setError("¡Todos los jugadores necesitan nombre!"); return; }
    const players = filled.map((name, i) => ({
      id: i, name, emoji: PLAYER_EMOJIS[i], color: PLAYER_COLORS[i],
      points: 0, chips: 0,
    }));
    onStart(players);
  };

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: 32,
      background: `radial-gradient(ellipse at center, #1a0a00 0%, #0a0a0a 70%)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(0deg, #FF6B00 0px, transparent 1px, transparent 40px)`,
      }} />

      {/* Logo */}
      <div style={{ textAlign: "center", animation: "fadeIn 0.6s ease" }}>
        <div style={{
          fontFamily: "'Bebas Neue'", fontSize: 72, lineHeight: 1,
          color: COLORS.orange, animation: "glow 2s ease-in-out infinite",
          letterSpacing: 4,
        }}>REGIOS TV</div>
        <div style={{
          fontFamily: "'Barlow Condensed'", fontSize: 28, fontWeight: 900,
          color: COLORS.white, letterSpacing: 8, textTransform: "uppercase",
        }}>PARTY 🎉</div>
        <div style={{ marginTop: 8 }}>
          <Badge color={COLORS.yellow}>🪗 Premio: Ukulele</Badge>
        </div>
      </div>

      {/* Player setup */}
      <Card style={{ width: 420, animation: "pop 0.5s ease 0.2s both" }}>
        <div style={{
          fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 18,
          color: COLORS.orange, letterSpacing: 2, marginBottom: 16,
          textTransform: "uppercase",
        }}>👥 Jugadores ({names.length}/7)</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {names.map((name, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: "slideIn 0.3s ease" }}>
              <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{PLAYER_EMOJIS[i]}</span>
              <input
                value={name}
                onChange={e => updateName(i, e.target.value)}
                placeholder={`Jugador ${i + 1}`}
                maxLength={14}
                style={{
                  flex: 1,
                  background: "#1a1a1a",
                  border: `1px solid ${name ? PLAYER_COLORS[i] : "#333"}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: name ? PLAYER_COLORS[i] : COLORS.grayLight,
                  fontFamily: "'Barlow Condensed'",
                  fontWeight: 700,
                  fontSize: 16,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
              {names.length > 4 && (
                <GlowBtn small danger onClick={() => removePlayer(i)}>✕</GlowBtn>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ color: COLORS.red, fontFamily: "'Barlow'", fontSize: 13, marginTop: 12, textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {names.length < 7 && (
            <GlowBtn onClick={addPlayer} color={COLORS.cyan} style={{ flex: 1 }}>+ Agregar jugador</GlowBtn>
          )}
          <GlowBtn onClick={handleStart} style={{ flex: 2, fontSize: 18, padding: "12px 0" }}>
            🎮 ¡INICIAR TORNEO!
          </GlowBtn>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────────────────────────
   SCREEN: TOURNAMENT HUB
─────────────────────────────────────────── */
function HubScreen({ players, onSelectGame, completedGames, onShowFinal }) {
  return (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 42, color: COLORS.orange, lineHeight: 1, animation: "glow 2s ease-in-out infinite" }}>
            REGIOS TV PARTY
          </div>
          <div style={{ fontFamily: "'Barlow Condensed'", color: COLORS.grayLight, fontSize: 14, letterSpacing: 2 }}>
            {completedGames.length}/4 JUEGOS COMPLETADOS
          </div>
        </div>
        {completedGames.length === 4 && (
          <GlowBtn onClick={onShowFinal} color={COLORS.yellow} style={{ fontSize: 18, padding: "14px 28px", animation: "pulse 1.5s infinite" }}>
            🏆 VER FINAL
          </GlowBtn>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ background: "#222", borderRadius: 8, height: 8, overflow: "hidden" }}>
        <div style={{
          width: `${(completedGames.length / 4) * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.yellow})`,
          transition: "width 0.5s ease",
          borderRadius: 8,
        }} />
      </div>

      {/* Minigame cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1 }}>
        {MINIGAMES.map((g, idx) => {
          const done = completedGames.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => !done && onSelectGame(g.id)}
              style={{
                background: done ? "#111" : `${g.color}10`,
                border: `2px solid ${done ? "#333" : g.color}`,
                borderRadius: 16,
                padding: "20px 24px",
                cursor: done ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
                opacity: done ? 0.5 : 1,
                animation: `fadeIn 0.4s ease ${idx * 0.1}s both`,
              }}
            >
              {done && (
                <div style={{
                  position: "absolute", top: 10, right: 12,
                  fontFamily: "'Bebas Neue'", fontSize: 14, color: COLORS.green, letterSpacing: 2,
                }}>✓ COMPLETADO</div>
              )}
              <div style={{ fontSize: 48, marginBottom: 10 }}>{g.emoji}</div>
              <div style={{
                fontFamily: "'Bebas Neue'", fontSize: 26, color: done ? COLORS.grayLight : g.color,
                letterSpacing: 2, lineHeight: 1.1,
              }}>{g.label}</div>
              <div style={{
                fontFamily: "'Barlow'", fontSize: 12, color: COLORS.grayLight,
                marginTop: 6,
              }}>
                {g.id === "cultura" && "Trivia — el host da puntos manualmente"}
                {g.id === "blackjack" && "Casino — el host es el dealer"}
                {g.id === "impostor" && "Deducción social — ¿quién no sabe?"}
                {g.id === "pistas" && "Adivina el personaje por pistas"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   MINIGAME: CULTURA GENERAL
─────────────────────────────────────────── */
function CulturaGame({ players, onFinish }) {
  const [pts, setPts] = useState(() => Object.fromEntries(players.map(p => [p.id, 0])));
  const [flash, setFlash] = useState(null);
  const AMOUNTS = [5, 10, 15, 20, -5];

  const award = (playerId, amount) => {
    setPts(prev => ({ ...prev, [playerId]: Math.max(0, prev[playerId] + amount) }));
    setFlash(playerId);
    setTimeout(() => setFlash(null), 400);
  };

  const handleFinish = () => {
    const updates = players.map(p => ({ ...p, points: p.points + (pts[p.id] || 0) }));
    onFinish(updates);
  };

  return (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🧠</div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: COLORS.yellow, letterSpacing: 2 }}>CULTURA GENERAL</div>
          <div style={{ fontFamily: "'Barlow'", color: COLORS.grayLight, fontSize: 13 }}>Otorga puntos manualmente según respuestas correctas</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {AMOUNTS.map(a => (
          <Badge key={a} color={a < 0 ? COLORS.red : COLORS.yellow}>{a > 0 ? "+" : ""}{a} pts</Badge>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
        {players.map(p => (
          <Card key={p.id} style={{
            border: `1px solid ${flash === p.id ? p.color : "#222"}`,
            boxShadow: flash === p.id ? `0 0 20px ${p.color}66` : "none",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{p.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 16, color: p.color }}>{p.name}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: COLORS.white, lineHeight: 1 }}>
                  +{pts[p.id]} <span style={{ fontSize: 14, color: COLORS.grayLight }}>pts esta ronda</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {AMOUNTS.map(a => (
                <GlowBtn key={a} small onClick={() => award(p.id, a)}
                  color={a < 0 ? COLORS.red : p.color} danger={a < 0}>
                  {a > 0 ? "+" : ""}{a}
                </GlowBtn>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <GlowBtn onClick={handleFinish} color={COLORS.green} style={{ fontSize: 18, padding: "14px", alignSelf: "flex-end" }}>
        ✓ Terminar Cultura General
      </GlowBtn>
    </div>
  );
}

/* ───────────────────────────────────────────
   MINIGAME: BLACKJACK
─────────────────────────────────────────── */
function BlackjackGame({ players, onFinish }) {
  const [chips, setChips] = useState(() => Object.fromEntries(players.map(p => [p.id, 100])));
  const [flash, setFlash] = useState(null);
  const CHIP_AMOUNTS = [5, 10, 25, 50, 100, -5, -10, -25, -50, -100];

  const adjust = (playerId, amount) => {
    setChips(prev => ({ ...prev, [playerId]: Math.max(0, prev[playerId] + amount) }));
    setFlash(playerId);
    setTimeout(() => setFlash(null), 400);
  };

  const handleFinish = () => {
    const ranked = [...players].sort((a, b) => (chips[b.id] || 0) - (chips[a.id] || 0));
    const n = ranked.length;
    const updates = players.map(p => {
      const rank = ranked.findIndex(r => r.id === p.id);
      const entry = BLACKJACK_RANKS[n - 1 - rank] || BLACKJACK_RANKS[0];
      return { ...p, chips: chips[p.id], points: p.points + entry.pts };
    });
    onFinish(updates);
  };

  const ranked = [...players].sort((a, b) => (chips[b.id] || 0) - (chips[a.id] || 0));

  return (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🃏</div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: COLORS.cyan, letterSpacing: 2 }}>BLACKJACK</div>
          <div style={{ fontFamily: "'Barlow'", color: COLORS.grayLight, fontSize: 13 }}>El host es el dealer • Inicio: 100 fichas • ~20-30 manos</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Badge color={COLORS.cyan}>🏆 Al final → puntos por ranking</Badge>
        </div>
      </div>

      {/* Ranking preview */}
      <div style={{ display: "flex", gap: 8 }}>
        {ranked.map((p, i) => (
          <div key={p.id} style={{
            background: `${p.color}15`, border: `1px solid ${p.color}55`,
            borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{["🥇","🥈","🥉"][i] || `#${i+1}`}</span>
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, color: p.color }}>{p.name}</span>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: COLORS.white }}>{chips[p.id]}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
        {players.map(p => (
          <Card key={p.id} style={{
            border: `1px solid ${flash === p.id ? p.color : "#222"}`,
            boxShadow: flash === p.id ? `0 0 20px ${p.color}66` : "none",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 26 }}>{p.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 15, color: p.color }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, color: chips[p.id] > 100 ? COLORS.green : chips[p.id] < 50 ? COLORS.red : COLORS.white, lineHeight: 1 }}>
                    {chips[p.id]}
                  </div>
                  <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: COLORS.grayLight }}>fichas</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {CHIP_AMOUNTS.map(a => (
                <GlowBtn key={a} small onClick={() => adjust(p.id, a)}
                  color={a < 0 ? COLORS.red : COLORS.cyan} danger={a < 0}>
                  {a > 0 ? "+" : ""}{a}
                </GlowBtn>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <GlowBtn onClick={handleFinish} color={COLORS.green} style={{ fontSize: 18, padding: "14px", alignSelf: "flex-end" }}>
        ✓ Terminar Blackjack → Convertir a puntos
      </GlowBtn>
    </div>
  );
}

/* ───────────────────────────────────────────
   MINIGAME: IMPOSTOR
─────────────────────────────────────────── */
function ImpostorGame({ players, onFinish }) {
  const [round, setRound] = useState(1);
  const [wins, setWins] = useState(() => Object.fromEntries(players.map(p => [p.id, 0])));
  const [impostorWins, setImpostorWins] = useState(0);
  const [topic, setTopic] = useState("");
  const [showTopic, setShowTopic] = useState(false);
  const [impostorId, setImpostorId] = useState(null);
  const [roundActive, setRoundActive] = useState(false);
  const [flash, setFlash] = useState(null);

  const startRound = () => {
    if (!topic.trim()) return;
    const idx = Math.floor(Math.random() * players.length);
    setImpostorId(players[idx].id);
    setShowTopic(false);
    setRoundActive(true);
  };

  const awardWin = (playerId) => {
    setWins(prev => ({ ...prev, [playerId]: prev[playerId] + 1 }));
    setFlash(playerId);
    setTimeout(() => setFlash(null), 600);
    nextRound();
  };

  const awardImpostor = () => {
    setImpostorWins(prev => prev + 1);
    nextRound();
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setTopic("");
    setImpostorId(null);
    setRoundActive(false);
    setShowTopic(false);
  };

  const handleFinish = () => {
    const maxWins = Math.max(...Object.values(wins));
    const updates = players.map(p => ({
      ...p,
      points: p.points + (wins[p.id] * 20),
    }));
    onFinish(updates);
  };

  return (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🕵️</div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: COLORS.magenta, letterSpacing: 2 }}>IMPOSTOR</div>
          <div style={{ fontFamily: "'Barlow'", color: COLORS.grayLight, fontSize: 13 }}>Ronda {round} • 20 pts por victoria • El impostor no conoce el tema</div>
        </div>
      </div>

      {!roundActive ? (
        <Card glow style={{ maxWidth: 480 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: COLORS.magenta, fontSize: 16, marginBottom: 12 }}>
            RONDA {round} — Escribe el tema secreto
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Mario Bros, Selena, Pizza..."
              style={{
                flex: 1, background: "#1a1a1a", border: `1px solid ${COLORS.magenta}`,
                borderRadius: 8, padding: "10px 14px",
                color: COLORS.white, fontFamily: "'Barlow Condensed'", fontSize: 18, outline: "none",
              }}
            />
            <GlowBtn onClick={startRound} color={COLORS.magenta} disabled={!topic.trim()}>INICIAR</GlowBtn>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", gap: 16, flex: 1, flexDirection: "column" }}>
          {/* Topic reveal */}
          <Card style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed'", color: COLORS.grayLight, fontSize: 13 }}>TEMA SECRETO</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
                  {showTopic
                    ? <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: COLORS.magenta }}>{topic}</div>
                    : <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: "#444", letterSpacing: 4 }}>● ● ● ● ● ● ●</div>
                  }
                  <GlowBtn small onClick={() => setShowTopic(!showTopic)} color={COLORS.magenta}>
                    {showTopic ? "Ocultar" : "Mostrar"}
                  </GlowBtn>
                </div>
              </div>
              {impostorId && (
                <div style={{ marginLeft: "auto", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", color: COLORS.grayLight, fontSize: 12 }}>IMPOSTOR</div>
                  <div style={{ fontSize: 32 }}>{players.find(p => p.id === impostorId)?.emoji}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 13, color: COLORS.red }}>
                    {players.find(p => p.id === impostorId)?.name}
                  </div>
                  <div style={{ fontFamily: "'Barlow'", fontSize: 11, color: COLORS.grayLight }}>(solo para el host)</div>
                </div>
              )}
            </div>
          </Card>

          {/* Winner selection */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: COLORS.white, fontSize: 16, marginBottom: 10 }}>
              ¿Quién ganó la ronda?
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {players.map(p => (
                <button key={p.id} onClick={() => awardWin(p.id)} style={{
                  background: flash === p.id ? `${p.color}44` : `${p.color}15`,
                  border: `2px solid ${p.color}`,
                  borderRadius: 10, padding: "10px 16px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: 22 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, color: p.color }}>{p.name}</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: COLORS.white }}>{wins[p.id]} wins</div>
                  </div>
                </button>
              ))}
              <button onClick={awardImpostor} style={{
                background: `${COLORS.red}15`, border: `2px solid ${COLORS.red}`,
                borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, color: COLORS.red,
              }}>
                🕵️ Impostor ganó<br/>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: COLORS.white }}>{impostorWins} wins</span>
              </button>
            </div>
          </div>

          {/* Score summary */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {players.map(p => (
              <div key={p.id} style={{ display: "flex", gap: 6, alignItems: "center", background: "#1a1a1a", borderRadius: 8, padding: "4px 10px" }}>
                <span>{p.emoji}</span>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, color: p.color }}>{p.name}</span>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: COLORS.white }}>{wins[p.id]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <GlowBtn onClick={handleFinish} color={COLORS.green} style={{ fontSize: 16, padding: "12px", alignSelf: "flex-end" }}>
        ✓ Terminar Impostor
      </GlowBtn>
    </div>
  );
}

/* ───────────────────────────────────────────
   MINIGAME: PISTAS PROGRESIVAS
─────────────────────────────────────────── */
const PISTAS_PTS = [100, 80, 60, 45, 30, 20, 10];

function PistasGame({ players, onFinish }) {
  const [round, setRound] = useState(1);
  const [character, setCharacter] = useState("");
  const [clues, setClues] = useState([""]);
  const [clueIdx, setClueIdx] = useState(-1); // -1 = setup, >=0 = active
  const [pts, setPts] = useState(() => Object.fromEntries(players.map(p => [p.id, 0])));
  const [roundHistory, setRoundHistory] = useState([]);

  const startRound = () => {
    if (!character.trim() || clues.filter(c => c.trim()).length < 2) return;
    setClueIdx(0);
  };

  const addClue = () => setClues([...clues, ""]);
  const updateClue = (i, v) => { const c = [...clues]; c[i] = v; setClues(c); };
  const removeClue = (i) => setClues(clues.filter((_, j) => j !== i));

  const awardGuess = (playerId) => {
    const earned = PISTAS_PTS[clueIdx] || 10;
    setPts(prev => ({ ...prev, [playerId]: prev[playerId] + earned }));
    setRoundHistory(h => [...h, { round, player: players.find(p => p.id === playerId), clueNum: clueIdx + 1, pts: earned, character }]);
    nextRound();
  };

  const nextClue = () => {
    if (clueIdx < clues.filter(c => c.trim()).length - 1) setClueIdx(c => c + 1);
  };

  const noOneGuessed = () => {
    setRoundHistory(h => [...h, { round, player: null, clueNum: clues.length, pts: 0, character }]);
    nextRound();
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setCharacter("");
    setClues([""]);
    setClueIdx(-1);
  };

  const handleFinish = () => {
    const updates = players.map(p => ({ ...p, points: p.points + (pts[p.id] || 0) }));
    onFinish(updates);
  };

  const activeClues = clues.filter(c => c.trim());

  return (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, color: COLORS.green, letterSpacing: 2 }}>PISTAS PROGRESIVAS</div>
          <div style={{ fontFamily: "'Barlow'", color: COLORS.grayLight, fontSize: 13 }}>Ronda {round} • Más temprano = más puntos • {PISTAS_PTS.slice(0,4).join(", ")}... pts</div>
        </div>
      </div>

      {clueIdx === -1 ? (
        <div style={{ display: "flex", gap: 16 }}>
          {/* Setup */}
          <Card style={{ flex: 1 }} glow>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: COLORS.green, fontSize: 15, marginBottom: 12 }}>
              RONDA {round} — Configura el personaje/tema
            </div>
            <input
              value={character}
              onChange={e => setCharacter(e.target.value)}
              placeholder="Personaje o tema secreto..."
              style={{
                width: "100%", background: "#1a1a1a", border: `1px solid ${COLORS.green}`,
                borderRadius: 8, padding: "10px 14px",
                color: COLORS.white, fontFamily: "'Barlow Condensed'", fontSize: 18,
                outline: "none", marginBottom: 16,
              }}
            />
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: COLORS.grayLight, fontSize: 13, marginBottom: 8 }}>
              PISTAS (de más vaga a más obvia):
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {clues.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: COLORS.green, width: 24 }}>{i+1}</span>
                  <input
                    value={c}
                    onChange={e => updateClue(i, e.target.value)}
                    placeholder={`Pista ${i+1}${i===0?" (más vaga)":i===clues.length-1?" (más obvia)":""}`}
                    style={{
                      flex: 1, background: "#1a1a1a", border: `1px solid #333`,
                      borderRadius: 8, padding: "7px 12px",
                      color: COLORS.white, fontFamily: "'Barlow'", fontSize: 14, outline: "none",
                    }}
                  />
                  {clues.length > 1 && <GlowBtn small danger onClick={() => removeClue(i)}>✕</GlowBtn>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <GlowBtn small onClick={addClue} color={COLORS.cyan}>+ Pista</GlowBtn>
              <GlowBtn onClick={startRound} color={COLORS.green} style={{ flex: 1 }}>▶ INICIAR RONDA</GlowBtn>
            </div>
          </Card>

          {/* History */}
          {roundHistory.length > 0 && (
            <Card style={{ width: 200 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: COLORS.grayLight, fontSize: 13, marginBottom: 8 }}>HISTORIAL</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {roundHistory.map((h, i) => (
                  <div key={i} style={{ background: "#1a1a1a", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}>
                    <div style={{ color: COLORS.grayLight, fontFamily: "'Barlow'" }}>R{h.round}: {h.character}</div>
                    {h.player
                      ? <div style={{ color: h.player.color, fontFamily: "'Barlow Condensed'", fontWeight: 700 }}>
                          {h.player.emoji} {h.player.name} +{h.pts}pts (pista {h.clueNum})
                        </div>
                      : <div style={{ color: COLORS.red, fontFamily: "'Barlow'" }}>Nadie adivinó</div>
                    }
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          {/* Current clue display */}
          <Card glow style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", color: COLORS.grayLight, fontSize: 13, letterSpacing: 2, marginBottom: 4 }}>
              PISTA {clueIdx + 1} DE {activeClues.length}
            </div>
            <div style={{
              fontFamily: "'Bebas Neue'", fontSize: 48, color: COLORS.green,
              animation: "glow 2s ease-in-out infinite", letterSpacing: 2,
            }}>
              {activeClues[clueIdx]}
            </div>
            <div style={{ marginTop: 8 }}>
              <Badge color={COLORS.yellow}>🏆 Adivinar ahora = {PISTAS_PTS[clueIdx] || 10} pts</Badge>
            </div>
          </Card>

          {/* Previous clues */}
          {clueIdx > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeClues.slice(0, clueIdx).map((c, i) => (
                <Badge key={i} color={COLORS.gray}>Pista {i+1}: {c}</Badge>
              ))}
            </div>
          )}

          {/* Controls */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {clueIdx < activeClues.length - 1 && (
              <GlowBtn onClick={nextClue} color={COLORS.cyan} style={{ fontSize: 16, padding: "12px 24px" }}>
                ▶ Siguiente pista ({PISTAS_PTS[clueIdx+1] || 10} pts)
              </GlowBtn>
            )}
            <GlowBtn onClick={noOneGuessed} danger style={{ fontSize: 14 }}>Nadie adivinó</GlowBtn>
          </div>

          {/* Who guessed */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, color: COLORS.white, fontSize: 16, marginBottom: 10 }}>
              ¿Quién adivinó?
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {players.map(p => (
                <button key={p.id} onClick={() => awardGuess(p.id)} style={{
                  background: `${p.color}15`, border: `2px solid ${p.color}`,
                  borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: 22 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, color: p.color }}>{p.name}</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: COLORS.white }}>{pts[p.id]} pts</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <GlowBtn onClick={handleFinish} color={COLORS.green} style={{ fontSize: 16, padding: "12px", alignSelf: "flex-end" }}>
        ✓ Terminar Pistas Progresivas
      </GlowBtn>
    </div>
  );
}

/* ───────────────────────────────────────────
   SCREEN: FINAL / PODIUM
─────────────────────────────────────────── */
function FinalScreen({ players, onRestart }) {
  const ranked = getRanking(players);
  const [revealed, setRevealed] = useState(0);
  const winner = ranked[0];

  useEffect(() => {
    if (revealed < ranked.length) {
      const t = setTimeout(() => setRevealed(r => r + 1), 800);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  const medals = ["🥇", "🥈", "🥉"];
  const podiumHeights = [220, 160, 120];

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24, gap: 24,
      background: `radial-gradient(ellipse at center, #1a0800 0%, #0a0a0a 70%)`,
    }}>
      {/* Fireworks bg */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, #FF6B00 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div style={{ textAlign: "center", animation: "pop 0.5s ease" }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 60, color: COLORS.yellow, animation: "glow 1.5s ease-in-out infinite", letterSpacing: 4 }}>
          🏆 RESULTADOS FINALES 🏆
        </div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, color: COLORS.orange, letterSpacing: 3 }}>
          REGIOS TV PARTY
        </div>
      </div>

      {/* Podium */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 260 }}>
        {[1, 0, 2].map((rankIdx) => {
          const p = ranked[rankIdx];
          if (!p) return <div key={rankIdx} style={{ width: 120 }} />;
          const isVisible = revealed > rankIdx;
          const height = podiumHeights[rankIdx];
          return (
            <div key={p.id} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              opacity: isVisible ? 1 : 0, transition: "all 0.5s ease",
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
            }}>
              {rankIdx === 0 && <div style={{ fontSize: 14, color: COLORS.yellow, fontFamily: "'Bebas Neue'", letterSpacing: 2, marginBottom: 4, animation: "flash 1s ease-in-out infinite" }}>🪗 GANA EL UKULELE</div>}
              <div style={{ fontSize: rankIdx === 0 ? 52 : 36 }}>{p.emoji}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: rankIdx === 0 ? 18 : 14, color: p.color }}>{p.name}</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: rankIdx === 0 ? 32 : 24, color: COLORS.white }}>{p.points} pts</div>
              <div style={{
                width: rankIdx === 0 ? 130 : 110,
                height,
                background: rankIdx === 0 ? `linear-gradient(180deg, ${COLORS.orange}, #993F00)` : `linear-gradient(180deg, #333, #222)`,
                borderRadius: "8px 8px 0 0",
                display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 12,
                border: rankIdx === 0 ? `2px solid ${COLORS.orange}` : "1px solid #444",
                boxShadow: rankIdx === 0 ? `0 0 30px ${COLORS.orangeGlow}` : "none",
              }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 36 }}>{medals[rankIdx]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full ranking */}
      {revealed >= ranked.length && ranked.length > 3 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", animation: "fadeIn 0.5s ease" }}>
          {ranked.slice(3).map((p, i) => (
            <div key={p.id} style={{
              background: COLORS.bgCard, border: `1px solid #333`, borderRadius: 10,
              padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: COLORS.grayLight }}>#{i+4}</span>
              <span style={{ fontSize: 22 }}>{p.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 14, color: p.color }}>{p.name}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: COLORS.white }}>{p.points} pts</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {revealed >= ranked.length && (
        <GlowBtn onClick={onRestart} style={{ fontSize: 16, padding: "12px 32px", animation: "fadeIn 0.5s ease" }}>
          🔄 Nuevo Torneo
        </GlowBtn>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("setup"); // setup | hub | game | final
  const [players, setPlayers] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [completedGames, setCompletedGames] = useState([]);

  const handleStart = (p) => { setPlayers(p); setScreen("hub"); };

  const handleSelectGame = (gameId) => {
    setCurrentGame(gameId);
    setScreen("game");
  };

  const handleGameFinish = (updatedPlayers) => {
    setPlayers(updatedPlayers);
    setCompletedGames(prev => [...prev, currentGame]);
    setCurrentGame(null);
    setScreen("hub");
  };

  const handleRestart = () => {
    setScreen("setup");
    setPlayers([]);
    setCompletedGames([]);
    setCurrentGame(null);
  };

  const gameComponents = {
    cultura: CulturaGame,
    blackjack: BlackjackGame,
    impostor: ImpostorGame,
    pistas: PistasGame,
  };

  const GameComponent = currentGame ? gameComponents[currentGame] : null;

  return (
    <>
      <style>{globalStyle}</style>
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", flexDirection: "row",
        fontFamily: "'Barlow', sans-serif",
        color: COLORS.white,
        overflow: "hidden",
      }}>
        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screen === "setup" && <SetupScreen onStart={handleStart} />}

          {screen === "hub" && (
            <HubScreen
              players={players}
              onSelectGame={handleSelectGame}
              completedGames={completedGames}
              onShowFinal={() => setScreen("final")}
            />
          )}

          {screen === "game" && GameComponent && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
              <div style={{ padding: "8px 16px", borderBottom: `1px solid #222`, display: "flex", alignItems: "center", gap: 10 }}>
                <GlowBtn small onClick={() => { setCurrentGame(null); setScreen("hub"); }}>← Volver</GlowBtn>
                <Badge color={MINIGAMES.find(g => g.id === currentGame)?.color}>
                  {MINIGAMES.find(g => g.id === currentGame)?.label}
                </Badge>
              </div>
              <GameComponent players={players} onFinish={handleGameFinish} />
            </div>
          )}

          {screen === "final" && (
            <FinalScreen players={players} onRestart={handleRestart} />
          )}
        </div>

        {/* Scoreboard — always visible except setup */}
        {screen !== "setup" && (
          <Scoreboard players={players} currentGame={currentGame} />
        )}
      </div>
    </>
  );
}