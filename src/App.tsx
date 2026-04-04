import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import cveLogo from "@/assets/cve-logo.png";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ORG_ALL = [
  { id: "chiara", name: "Chiara Bonfanti", initials: "CB", role: "Payroll Specialist", department: "Amministrazione" },
  { id: "elena", name: "Elena Marchetti", initials: "EM", role: "Accounts Payable", department: "Amministrazione" },
  { id: "francesca", name: "Francesca Colombo", initials: "FC", role: "Accounts Receivable", department: "Amministrazione" },
  { id: "giulia", name: "Giulia Moretti", initials: "GM", role: "Supplier Relations", department: "Amministrazione" },
  { id: "sofia", name: "Sofia Santoro", initials: "SS", role: "Administrative Coordinator", department: "Amministrazione" },
];

const TEAM = [
  { id: "chiara", name: "Chiara Bonfanti", initials: "CB", role: "Payroll Specialist" },
  { id: "elena", name: "Elena Marchetti", initials: "EM", role: "Accounts Payable" },
  { id: "francesca", name: "Francesca Colombo", initials: "FC", role: "Accounts Receivable" },
];

const BEHAVIORS = [
  { id: "comportamento_1", name: "Comportamento 1", category: "dna", description: "Questo comportamento sarà definito insieme durante la sessione di codesign con il team CVE.", indicators: ["Da definire", "Da definire", "Da definire"] },
  { id: "comportamento_2", name: "Comportamento 2", category: "dna", description: "Questo comportamento sarà definito insieme durante la sessione di codesign con il team CVE.", indicators: ["Da definire", "Da definire", "Da definire"] },
  { id: "comportamento_3", name: "Comportamento 3", category: "team", description: "Questo comportamento sarà definito insieme durante la sessione di codesign con il team CVE.", indicators: ["Da definire", "Da definire", "Da definire"] },
  { id: "comportamento_4", name: "Comportamento 4", category: "team", description: "Questo comportamento sarà definito insieme durante la sessione di codesign con il team CVE.", indicators: ["Da definire", "Da definire", "Da definire"] },
];

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const INITIAL_NOTES = {
  chiara: {
    comportamento_1: [
      { id: 1, date: "15 Gen", text: "Chiusura mese di dicembre: ha gestito le scadenze payroll con precisione anche con l'assenza di un collega.", author: "manager", level: "example" },
      { id: 2, date: "08 Gen", text: "Risoluzione anomalia contratto: ha identificato subito l'errore e proposto correttivo prima della scadenza.", author: "manager", level: "on_track" },
    ],
    comportamento_2: [
      { id: 3, date: "22 Dic", text: "Nella riunione di allineamento annuale non ha condiviso feedback su processi migliorabili.", author: "manager", level: "training" },
    ],
    comportamento_3: [],
    comportamento_4: [
      { id: 4, date: "10 Gen", text: "Ha anticipato un problema tecnico sul software stipendi e coordinato con IT per risolverlo prima della run.", author: "manager", level: "example" },
    ],
  },
  elena: {
    comportamento_1: [{ id: 10, date: "18 Gen", text: "Pagamento fornitori: ha verificato tutte le fatture con attenzione, intercettando due duplicati.", author: "manager", level: "on_track" }],
    comportamento_2: [{ id: 11, date: "12 Gen", text: "Ha supportato Francesca durante il picco di fatturazione attiva, gestendo anche parte della riconciliazione.", author: "manager", level: "example" }],
    comportamento_3: [{ id: 12, date: "05 Gen", text: "Report scadenze fornitori: ha utilizzato il template esistente senza proporre miglioramenti sulla leggibilità.", author: "manager", level: "training" }],
    comportamento_4: [],
  },
  francesca: {
    comportamento_1: [
      { id: 20, date: "20 Gen", text: "Chiusura trimestrale: ha emesso tutte le fatture nei tempi, coordinando con commerciale per le specifiche cliente.", author: "manager", level: "on_track" },
      { id: 21, date: "14 Gen", text: "Sollecito cliente Rossi: ha gestito la comunicazione in modo diretto ma professionale, ottenendo pagamento.", author: "manager", level: "example" },
    ],
    comportamento_2: [],
    comportamento_3: [{ id: 22, date: "09 Gen", text: "Nella call con cliente Bianchi per sollecito non ha riformulato la richiesta dopo obiezione iniziale.", author: "manager", level: "training" }],
    comportamento_4: [{ id: 23, date: "16 Gen", text: "Blocco su software fatturazione: ha segnalato il problema in ritardo, impattando le scadenze.", author: "manager", level: "training" }],
  },
  giulia: {
    comportamento_1: [{ id: 30, date: "17 Gen", text: "Negoziazione fornitore materiali: ha ottenuto condizioni migliori mantenendo relazione positiva.", author: "manager", level: "example" }],
    comportamento_2: [{ id: 31, date: "11 Gen", text: "Ha condiviso con il team le nuove condizioni negoziate con fornitore X, creando valore per tutti.", author: "manager", level: "on_track" }],
    comportamento_3: [],
    comportamento_4: [{ id: 32, date: "13 Gen", text: "Scadenza contratto fornitore Y: non ha comunicato per tempo il rischio interruzione servizio.", author: "manager", level: "training" }],
  },
  sofia: {
    comportamento_1: [{ id: 40, date: "19 Gen", text: "Coordinamento chiusura anno: ha gestito tutte le scadenze cross-funzionali con comunicazione efficace.", author: "manager", level: "example" }],
    comportamento_2: [{ id: 41, date: "10 Gen", text: "Durante il meeting di pianificazione ha facilitato il confronto tra payroll e fatturazione su priorità.", author: "manager", level: "example" }],
    comportamento_3: [{ id: 42, date: "07 Gen", text: "Report mensile attività: ha usato formato standard senza adattarlo alle esigenze del nuovo responsabile.", author: "manager", level: "training" }],
    comportamento_4: [],
  },
};

const INITIAL_EVALS = {
  chiara: { comportamento_1: "example", comportamento_2: "training", comportamento_3: null, comportamento_4: "example" },
  elena: { comportamento_1: "on_track", comportamento_2: "example", comportamento_3: "training", comportamento_4: null },
  francesca: { comportamento_1: "on_track", comportamento_2: null, comportamento_3: "training", comportamento_4: "training" },
  giulia: { comportamento_1: "example", comportamento_2: "on_track", comportamento_3: null, comportamento_4: "training" },
  sofia: { comportamento_1: "example", comportamento_2: "example", comportamento_3: "training", comportamento_4: null },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
function getLevelConfig(level: string | null) {
  if (level === "training") return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Da allenare", icon: "↗" };
  if (level === "on_track") return { color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", label: "In linea", icon: "◆" };
  if (level === "example") return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Di esempio", icon: "★" };
  return null;
}

function hasPositiveHistory(notes: any[]) {
  return notes && notes.some((n) => n.level === "on_track" || n.level === "example");
}

function getTeamInsights(team: any[], evals: any) {
  const behaviorStats = BEHAVIORS.map((b) => {
    let trainingCount = 0, exampleCount = 0, onTrackCount = 0;
    team.forEach((m) => {
      const lvl = evals[m.id]?.[b.id];
      if (lvl === "training") trainingCount++;
      if (lvl === "example") exampleCount++;
      if (lvl === "on_track") onTrackCount++;
    });
    const insight = trainingCount > 0
      ? `${trainingCount} di ${team.length} persone nel team stanno lavorando su questo comportamento.`
      : exampleCount > 0
      ? `Comportamento più forte nel team con ${exampleCount} persone di esempio.`
      : `${onTrackCount} persone in linea su questo comportamento.`;
    return { ...b, trainingCount, exampleCount, onTrackCount, total: trainingCount + exampleCount + onTrackCount, insight };
  });
  const mostCritical = [...behaviorStats].sort((a, b) => b.trainingCount - a.trainingCount)[0];
  const strongest = [...behaviorStats].sort((a, b) => b.exampleCount - a.exampleCount)[0];
  return { mostCritical, strongest, behaviorStats };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", variant = "primary" }: { initials: string; size?: "sm" | "md" | "lg"; variant?: "primary" | "muted" }) {
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const variantClasses = { primary: "bg-primary text-primary-foreground", muted: "bg-muted text-muted-foreground" };
  return (
    <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" }) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", size = "md", className = "", ...props }: any) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-card text-foreground border border-border hover:bg-muted",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = "", hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`bg-card rounded-xl border border-border ${hover ? "card-hover cursor-pointer" : ""} ${className}`}>
      {children}
    </div>
  );
}

// ─── MODAL COMPONENTS ─────────────────────────────────────────────────────────

function QuickNoteModal({ team, onClose, onSave, selectedPerson, selectedBehavior }: any) {
  const [person, setPerson] = useState(selectedPerson || team[0]?.id);
  const [behavior, setBehavior] = useState(selectedBehavior || BEHAVIORS[0].id);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const personObj = team.find((t: any) => t.id === person);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-card rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-foreground">Nuova osservazione</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">×</button>
        </div>

        {/* Person selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Persona</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {team.map((m: any) => (
              <button
                key={m.id}
                onClick={() => setPerson(m.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all flex-shrink-0 ${
                  person === m.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Avatar initials={m.initials} size="sm" variant={person === m.id ? "primary" : "muted"} />
                <span className={`text-sm font-medium ${person === m.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {m.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Behavior selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Comportamento</label>
          <div className="flex gap-2 flex-wrap">
            {BEHAVIORS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBehavior(b.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  behavior === b.id ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Cosa hai osservato
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Descrivi la situazione con ${personObj?.name?.split(" ")[0]}...`}
            className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
          />
        </div>

        {/* Level selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Livello osservato
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["training", "on_track", "example"] as const).map((lvl) => {
              const cfg = getLevelConfig(lvl);
              const active = level === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    active ? `${cfg?.bg} ${cfg?.border}` : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className={`text-base ${active ? cfg?.color : "text-muted-foreground"}`}>{cfg?.icon}</span>
                  <span className={`text-xs font-medium ${active ? cfg?.color : "text-muted-foreground"}`}>{cfg?.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="accent"
          size="lg"
          className="w-full"
          disabled={!text || !level}
          onClick={() => text && level && onSave(person, behavior, text, level)}
        >
          Salva osservazione
        </Button>
      </div>
    </div>
  );
}

function HistoryDrawer({ notes, behaviorName, personName, onClose }: any) {
  const managerNotes = notes.filter((n: any) => n.author === "manager");
  const employeeNotes = notes.filter((n: any) => n.author === "employee");

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-card shadow-xl overflow-y-auto p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-foreground">{behaviorName}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">×</button>
        </div>

        {notes.length === 0 && (
          <p className="text-muted-foreground text-sm italic">Nessuna situazione registrata.</p>
        )}

        {[{ label: "Osservazioni del manager", items: managerNotes }, { label: `Prospettiva di ${personName || "collaboratore"}`, items: employeeNotes }].map((group) =>
          group.items.length > 0 ? (
            <div key={group.label} className="mb-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</span>
              {group.items.map((note: any) => {
                const cfg = getLevelConfig(note.level);
                return (
                  <div key={note.id} className={`mt-3 p-4 rounded-lg border-l-4 ${cfg?.bg} ${cfg?.border}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-semibold ${cfg?.color}`}>{cfg?.icon} {cfg?.label}</span>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{note.text}</p>
                  </div>
                );
              })}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function TeamDashboard({ team, evals, notes, onClose }: any) {
  const { mostCritical, strongest } = getTeamInsights(team, evals);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-fade-in">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">←</button>
          <h2 className="text-xl font-semibold text-foreground">Vista Team</h2>
        </div>

        {/* AI Insights */}
        <Card className="p-5 mb-6 border-accent/20 bg-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-accent">✦</span>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Insight</span>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <Badge variant="error">Area critica</Badge>
              <span className="text-sm text-foreground"><strong>{mostCritical?.name}</strong> — {mostCritical?.insight}</span>
            </div>
            <div className="flex gap-3 items-start">
              <Badge variant="success">Punto di forza</Badge>
              <span className="text-sm text-foreground"><strong>{strongest?.name}</strong> — {strongest?.insight}</span>
            </div>
          </div>
        </Card>

        {/* Behavior heatmap */}
        <Card className="p-5 mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Mappa comportamenti</h4>
          <div className="overflow-x-auto">
            <div className="grid gap-2" style={{ gridTemplateColumns: `minmax(120px, 1fr) repeat(${team.length}, 48px)` }}>
              <div />
              {team.map((m: any) => (
                <div key={m.id} className="flex justify-center">
                  <Avatar initials={m.initials} size="sm" variant="muted" />
                </div>
              ))}
              {BEHAVIORS.map((b) => (
                <>
                  <span key={`label-${b.id}`} className="text-sm text-foreground font-medium py-2">{b.name}</span>
                  {team.map((m: any) => {
                    const lvl = evals[m.id]?.[b.id];
                    const cfg = lvl ? getLevelConfig(lvl) : null;
                    return (
                      <div key={`${b.id}-${m.id}`} className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center ${cfg ? cfg.bg : "bg-muted"} border ${cfg ? cfg.border : "border-border"}`}>
                        {cfg && <span className={`text-base ${cfg.color}`}>{cfg.icon}</span>}
                        {!cfg && <span className="text-muted-foreground">·</span>}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-border flex-wrap">
            {(["training", "on_track", "example"] as const).map((lvl) => {
              const cfg = getLevelConfig(lvl);
              return (
                <div key={lvl} className="flex items-center gap-2">
                  <span className={cfg?.color}>{cfg?.icon}</span>
                  <span className="text-xs text-muted-foreground">{cfg?.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Individual cards */}
        <div className="space-y-4">
          {team.map((member: any) => {
            const memberEvals = evals[member.id] || {};
            const strengths = Object.entries(memberEvals).filter(([, v]) => v === "example").map(([k]) => BEHAVIORS.find((b) => b.id === k)?.name).filter(Boolean);
            const critical = Object.entries(memberEvals).filter(([, v]) => v === "training").map(([k]) => BEHAVIORS.find((b) => b.id === k)?.name).filter(Boolean);
            
            return (
              <Card key={member.id} className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar initials={member.initials} size="md" />
                  <div>
                    <span className="text-sm font-semibold text-foreground block">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                  </div>
                </div>
                {strengths.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Punti di forza</span>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {strengths.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {critical.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Da sviluppare</span>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {critical.map((c) => <Badge key={c} variant="error">{c}</Badge>)}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── TEAM VALIDATION SCREEN ───────────────────────────────────────────────────
function TeamValidationScreen({ initialSelection, isFirstTime, onValidate, orgAll }: any) {
  const [selected, setSelected] = useState(initialSelection || orgAll.map((p: any) => p.id));

  const toggle = (id: string) => {
    setSelected((prev: string[]) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="bg-primary rounded-xl px-5 py-3">
            <img src={cveLogo} alt="CVE" className="h-8 object-contain" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="default" className="mb-4">{isFirstTime ? "Setup iniziale" : "Modifica team"}</Badge>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {isFirstTime ? "Controlla il tuo team" : "Il tuo team attuale"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isFirstTime
              ? "Il sistema ha suggerito le persone basandosi sulla struttura aziendale. Conferma, rimuovi o aggiungi chi serve."
              : "Aggiungi o rimuovi persone dal tuo team."}
          </p>
        </div>

        {/* Team list */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
            Il tuo team ({selected.length})
          </span>
          <div className="space-y-2">
            {orgAll.map((person: any) => {
              const isSelected = selected.includes(person.id);
              return (
                <Card
                  key={person.id}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${isSelected ? "border-primary/50 bg-primary/5" : ""}`}
                  onClick={() => toggle(person.id)}
                >
                  <Avatar initials={person.initials} size="md" variant={isSelected ? "primary" : "muted"} />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground block">{person.name}</span>
                    <span className="text-xs text-muted-foreground">{person.role}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-accent bg-accent" : "border-border"}`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <Button
          variant="accent"
          size="lg"
          className="w-full"
          disabled={selected.length === 0}
          onClick={() => onValidate(selected)}
        >
          {isFirstTime ? `Conferma team (${selected.length})` : `Salva modifiche (${selected.length})`}
        </Button>
      </div>
    </div>
  );
}

// ─── BEHAVIOR CARD ────────────────────────────────────────────────────────────
function BehaviorCard({ behavior, isManager, currentLevel, behaviorNotes, onEvalChange, onHistoryOpen, onEmployeeNote }: any) {
  const [expanded, setExpanded] = useState(false);
  const [empText, setEmpText] = useState("");
  const cfg = getLevelConfig(currentLevel);
  const showCounter = isManager && currentLevel === "training" && hasPositiveHistory(behaviorNotes);

  return (
    <Card className="mb-3 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${behavior.category === "dna" ? "text-accent" : "text-teal-600"}`}>
              {behavior.category === "dna" ? "DNA" : "Team"}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground">{behavior.name}</span>
        </div>
        {cfg && (
          <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </div>
        )}
        <span className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}>↓</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-4 animate-slide-down">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{behavior.description}</p>

          {isManager && (
            <>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Valutazione</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(["training", "on_track", "example"] as const).map((lvl) => {
                  const c = getLevelConfig(lvl);
                  const active = currentLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => onEvalChange(behavior.id, lvl)}
                      className={`p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${active ? `${c?.bg} ${c?.border}` : "border-border hover:border-muted-foreground/30"}`}
                    >
                      <span className={`text-sm ${active ? c?.color : "text-muted-foreground"}`}>{c?.icon}</span>
                      <span className={`text-xs font-medium ${active ? c?.color : "text-muted-foreground"}`}>{c?.label}</span>
                    </button>
                  );
                })}
              </div>

              {showCounter && (
                <button
                  onClick={onHistoryOpen}
                  className="w-full p-3 rounded-lg bg-accent/10 border border-accent/20 flex items-center gap-2 mb-4 hover:bg-accent/15 transition-colors"
                >
                  <span className="text-accent">✦</span>
                  <span className="text-sm text-accent flex-1 text-left">Questo comportamento è stato osservato in altre situazioni</span>
                  <span className="text-xs text-accent">vedi →</span>
                </button>
              )}

              <Button variant="secondary" size="sm" className="w-full" onClick={onHistoryOpen}>
                📋 Storico ({behaviorNotes.length})
              </Button>
            </>
          )}

          {!isManager && (
            <>
              {currentLevel && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                  <span className="text-xs text-muted-foreground">Valutazione di Dalila:</span>
                  <span className={`text-sm font-medium ${cfg?.color}`}>{cfg?.icon} {cfg?.label}</span>
                </div>
              )}
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">La tua prospettiva</label>
              <textarea
                value={empText}
                onChange={(e) => setEmpText(e.target.value)}
                placeholder="Aggiungi il tuo punto di vista..."
                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-3"
              />
              <div className="flex gap-2">
                {empText && (
                  <Button variant="accent" size="sm" className="flex-1" onClick={() => { onEmployeeNote(empText); setEmpText(""); }}>
                    Salva
                  </Button>
                )}
                <Button variant="secondary" size="sm" className={empText ? "flex-1" : ""} onClick={onHistoryOpen}>
                  📋 Storico ({behaviorNotes.length})
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [teamValidated, setTeamValidated] = useState(false);
  const [role, setRole] = useState("manager");
  const [screen, setScreen] = useState("home");
  const [selectedPerson, setSelectedPerson] = useState(() => TEAM[0]?.id || "chiara");
  const [quickNote, setQuickNote] = useState(false);
  const [quickNoteContext, setQuickNoteContext] = useState<{ person?: string; behavior?: string }>({});
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [evals, setEvals] = useState(INITIAL_EVALS);
  const [profileOk, setProfileOk] = useState({ manager: false, employee: false });
  const [activeTeam, setActiveTeam] = useState(TEAM);
  const [hasEverValidated, setHasEverValidated] = useState(false);

  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [currentManagerId, setCurrentManagerId] = useState<string | null>(() => localStorage.getItem("talent_track_manager_id"));
  const [managerPickerVisible, setManagerPickerVisible] = useState(!localStorage.getItem("talent_track_manager_id"));

  useEffect(() => {
    supabase.from("people").select("id, name").in("role", ["manager", "ceo"]).then(({ data }) => { if (data) setManagers(data); });
  }, []);

  useEffect(() => {
    supabase.from("people").select("id, name, role, job_title").not("role", "in", '("manager","ceo")').then(({ data }) => {
      if (data && data.length > 0) {
        const members = data.map((p) => ({
          id: p.id,
          name: p.name,
          initials: p.name.split(" ").map((n: string) => n[0]).join(""),
          role: p.job_title || p.role,
        }));
        setActiveTeam(members);
        setSelectedPerson((prev) => (data.find((p) => p.id === prev) ? prev : members[0].id));
      }
    });
  }, []);

  const handleSelectManager = (id: string) => {
    localStorage.setItem("talent_track_manager_id", id);
    setCurrentManagerId(id);
    setManagerPickerVisible(false);
  };

  // Manager picker
  if (managerPickerVisible) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="flex justify-center mb-10">
            <div className="bg-primary rounded-xl px-5 py-3">
              <img src={cveLogo} alt="CVE" className="h-8 object-contain" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground text-center mb-2">Chi sei?</h2>
          <p className="text-muted-foreground text-center mb-8">Seleziona il tuo nome per continuare.</p>
          <div className="space-y-3">
            {managers.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectManager(m.id)}
                className="w-full p-4 rounded-xl border border-border bg-card text-left font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleTeamValidate = async (selectedIds: string[]) => {
    setTeamValidated(true);
    setHasEverValidated(true);
    if (currentManagerId) {
      await supabase.from("team_confirmations").insert({ manager_id: currentManagerId, confirmed_team: selectedIds });
    }
  };

  // Team validation screen
  if (role === "manager" && !teamValidated) {
    return (
      <TeamValidationScreen
        initialSelection={hasEverValidated && activeTeam.length > 0 ? activeTeam.map((p) => p.id) : null}
        isFirstTime={!hasEverValidated}
        onValidate={handleTeamValidate}
        orgAll={activeTeam}
      />
    );
  }

  const isManager = role === "manager";
  const personObj = activeTeam.find((t) => t.id === selectedPerson) || activeTeam[0];
  const personNotes = notes[personObj?.id as keyof typeof notes] || {};

  const handleSaveNote = (personId: string, behaviorId: string, text: string, level: string) => {
    const newNote = { id: Date.now(), date: "Oggi", text, author: "manager", level };
    setNotes((prev: any) => ({
      ...prev,
      [personId]: { ...prev[personId], [behaviorId]: [...(prev[personId]?.[behaviorId] || []), newNote] },
    }));
    setEvals((prev: any) => ({ ...prev, [personId]: { ...prev[personId], [behaviorId]: level } }));
    setQuickNote(false);
  };

  const handleEvalChange = (behaviorId: string, level: string) => {
    const pid = personObj?.id || selectedPerson;
    setEvals((prev: any) => ({ ...prev, [pid]: { ...prev[pid], [behaviorId]: level } }));
  };

  const handleEmployeeNote = (behaviorId: string, text: string) => {
    const newNote = { id: Date.now(), date: "Oggi", text, author: "employee", level: "on_track" };
    setNotes((prev: any) => ({
      ...prev,
      [selectedPerson]: { ...prev[selectedPerson], [behaviorId]: [...(prev[selectedPerson]?.[behaviorId] || []), newNote] },
    }));
  };

  // ── SCREENS ──────────────────────────────────────────────────────────────

  // HOME
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <div className="max-w-xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="bg-primary rounded-xl px-4 py-2.5">
              <img src={cveLogo} alt="CVE" className="h-7 object-contain" />
            </div>
            {isManager && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setTeamValidated(false)}>
                  ✎ Modifica
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setScreen("team")}>
                  👥 Team
                </Button>
              </div>
            )}
          </div>

          {/* Role switcher */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex bg-card rounded-xl p-1 border border-border">
              {[{ id: "manager", label: "Dalila" }, { id: "employee", label: "Chiara" }].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    role === r.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Buongiorno, {isManager ? "Dalila" : "Chiara"}
            </h1>
            <p className="text-muted-foreground">
              {isManager ? "Segui la crescita del tuo team" : "Segui il tuo percorso di crescita"}
            </p>
          </div>

          {/* Quick note CTA */}
          {isManager && (
            <Card
              hover
              className="p-5 mb-8 border-dashed border-2 hover:border-accent/50 hover:bg-accent/5"
              onClick={() => { setQuickNote(true); setQuickNoteContext({}); }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="text-accent text-xl">+</span>
                </div>
                <div>
                  <span className="text-foreground font-medium block">Hai qualcosa da scrivere?</span>
                  <span className="text-muted-foreground text-sm">Registra una nuova osservazione</span>
                </div>
              </div>
            </Card>
          )}

          {/* Team list */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-foreground">
                {isManager ? "Il tuo team" : "Il tuo profilo"}
              </span>
              <span className="text-xs text-muted-foreground">{activeTeam.length} persone</span>
            </div>
            <div className="space-y-3">
              {activeTeam.map((member) => {
                const memberEvals = evals[member.id as keyof typeof evals] || {};
                const exampleCount = Object.values(memberEvals).filter((v) => v === "example").length;
                const trainingCount = Object.values(memberEvals).filter((v) => v === "training").length;

                return (
                  <Card
                    key={member.id}
                    hover
                    className="p-4"
                    onClick={() => { setSelectedPerson(member.id); setScreen("profile"); }}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar initials={member.initials} size="lg" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-foreground block">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.role}</span>
                      </div>
                      <div className="flex gap-2">
                        {exampleCount > 0 && <Badge variant="success">★ {exampleCount}</Badge>}
                        {trainingCount > 0 && <Badge variant="error">↗ {trainingCount}</Badge>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {quickNote && (
          <QuickNoteModal
            team={activeTeam}
            onClose={() => setQuickNote(false)}
            onSave={handleSaveNote}
            selectedPerson={quickNoteContext.person}
            selectedBehavior={quickNoteContext.behavior}
          />
        )}
      </div>
    );
  }

  // PROFILE
  if (screen === "profile") {
    const cfg = getLevelConfig(null);
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <div className="max-w-xl mx-auto px-6 py-8">
          {/* Back */}
          <button onClick={() => setScreen("home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
            ← Indietro
          </button>

          {/* Profile header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <Avatar initials={personObj.initials} size="lg" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{personObj.name}</h2>
                <p className="text-sm text-muted-foreground">{personObj.role}</p>
              </div>
            </div>

            {/* Objective */}
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Obiettivo:</strong> Gestire e sviluppare il portfolio clienti nel territorio, generando nuovo fatturato con approcci consultivi personalizzati.
              </p>
            </div>

            {/* Double OK */}
            <div className="grid grid-cols-2 gap-3">
              {[{ key: "manager", label: "Dalila" }, { key: "employee", label: "Chiara" }].map((p) => {
                const ok = profileOk[p.key as keyof typeof profileOk];
                const canToggle = (isManager && p.key === "manager") || (!isManager && p.key === "employee");
                return (
                  <button
                    key={p.key}
                    onClick={() => canToggle && setProfileOk((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      ok ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"
                    } ${canToggle ? "cursor-pointer hover:border-accent/50" : "opacity-60 cursor-default"}`}
                  >
                    <span>{ok ? "✓" : "○"}</span>
                    <span className="text-sm font-medium">{p.label} {ok ? "OK" : "conferma"}</span>
                  </button>
                );
              })}
            </div>
            {profileOk.manager && profileOk.employee && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span className="text-sm text-emerald-700 font-medium">Profilo condiviso</span>
              </div>
            )}
          </Card>

          {/* Quick note CTA */}
          {isManager && (
            <Card
              hover
              className="p-4 mb-6 border-dashed border-2 hover:border-accent/50 hover:bg-accent/5"
              onClick={() => { setQuickNote(true); setQuickNoteContext({ person: selectedPerson }); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-accent">+</span>
                </div>
                <div>
                  <span className="text-foreground font-medium text-sm block">Hai qualcosa da scrivere su {personObj.name.split(" ")[0]}?</span>
                  <span className="text-muted-foreground text-xs">Registra un&apos;osservazione rapida</span>
                </div>
              </div>
            </Card>
          )}

          {/* Behaviors */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-foreground">Comportamenti Chiave</span>
          </div>

          {["dna", "team"].map((cat) => (
            <div key={cat} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border" />
                <span className={`text-xs font-semibold uppercase tracking-wider ${cat === "dna" ? "text-accent" : "text-teal-600"}`}>
                  {cat === "dna" ? "DNA Aziendale" : "Team Amministrazione"}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {BEHAVIORS.filter((b) => b.category === cat).map((behavior) => {
                const behaviorNotes = personNotes[behavior.id as keyof typeof personNotes] || [];
                const currentLevel = evals[personObj?.id as keyof typeof evals]?.[behavior.id as any];

                return (
                  <BehaviorCard
                    key={behavior.id}
                    behavior={behavior}
                    isManager={isManager}
                    currentLevel={currentLevel}
                    behaviorNotes={behaviorNotes}
                    onEvalChange={handleEvalChange}
                    onHistoryOpen={() => setHistoryOpen(behavior.id)}
                    onEmployeeNote={(text: string) => handleEmployeeNote(behavior.id, text)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {historyOpen && (
          <HistoryDrawer
            notes={personNotes[historyOpen as keyof typeof personNotes] || []}
            behaviorName={BEHAVIORS.find((b) => b.id === historyOpen)?.name}
            personName={personObj?.name?.split(" ")[0]}
            onClose={() => setHistoryOpen(null)}
          />
        )}
        {quickNote && (
          <QuickNoteModal
            team={activeTeam}
            onClose={() => setQuickNote(false)}
            onSave={handleSaveNote}
            selectedPerson={quickNoteContext.person}
            selectedBehavior={quickNoteContext.behavior}
          />
        )}
      </div>
    );
  }

  // TEAM
  if (screen === "team") {
    return <TeamDashboard team={activeTeam} evals={evals} notes={notes} onClose={() => setScreen("home")} />;
  }

  return null;
}
