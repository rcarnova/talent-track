import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── DATA ─────────────────────────────────────────────────────────────────────
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

const INITIAL_NOTES: Record<string, Record<string, any[]>> = {
  chiara: {
    comportamento_1: [
      { id: 1, date: "15 Gen", text: "Chiusura mese di dicembre: ha gestito le scadenze payroll con precisione.", author: "manager", level: "example" },
    ],
    comportamento_2: [],
    comportamento_3: [],
    comportamento_4: [],
  },
  elena: {
    comportamento_1: [{ id: 10, date: "18 Gen", text: "Pagamento fornitori: ha verificato tutte le fatture con attenzione.", author: "manager", level: "on_track" }],
    comportamento_2: [],
    comportamento_3: [],
    comportamento_4: [],
  },
  francesca: {
    comportamento_1: [],
    comportamento_2: [],
    comportamento_3: [],
    comportamento_4: [],
  },
};

const INITIAL_EVALS: Record<string, Record<string, string | null>> = {
  chiara: { comportamento_1: "example", comportamento_2: null, comportamento_3: null, comportamento_4: null },
  elena: { comportamento_1: "on_track", comportamento_2: null, comportamento_3: null, comportamento_4: null },
  francesca: { comportamento_1: null, comportamento_2: null, comportamento_3: null, comportamento_4: null },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
function getLevelConfig(level: string | null) {
  if (level === "training") return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Da allenare", icon: "↗" };
  if (level === "on_track") return { color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", label: "In linea", icon: "◆" };
  if (level === "example") return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Di esempio", icon: "★" };
  return null;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Avatar({ initials, size = "md", variant = "primary" }: { initials: string; size?: "sm" | "md" | "lg"; variant?: "primary" | "muted" }) {
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const variantClasses = { primary: "bg-slate-800 text-white", muted: "bg-slate-200 text-slate-600" };
  return (
    <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Button({ children, variant = "primary", size = "md", className = "", ...props }: any) {
  const variants = {
    primary: "bg-slate-800 text-white hover:bg-slate-700",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:text-slate-800 hover:bg-slate-100",
    accent: "bg-teal-500 text-white hover:bg-teal-600",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── QUICK NOTE MODAL ─────────────────────────────────────────────────────────

function QuickNoteModal({ team, onClose, onSave, selectedPerson, selectedBehavior }: any) {
  const [person, setPerson] = useState(selectedPerson || team[0]?.id);
  const [behavior, setBehavior] = useState(selectedBehavior || BEHAVIORS[0].id);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const personObj = team.find((t: any) => t.id === person);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Nuova osservazione</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>

        {/* Person selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Persona</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {team.map((m: any) => (
              <button
                key={m.id}
                onClick={() => setPerson(m.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all flex-shrink-0 ${
                  person === m.id ? "border-slate-800 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Avatar initials={m.initials} size="sm" variant={person === m.id ? "primary" : "muted"} />
                <span className={`text-sm font-medium ${person === m.id ? "text-slate-800" : "text-slate-500"}`}>
                  {m.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Behavior selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Comportamento</label>
          <div className="flex gap-2 flex-wrap">
            {BEHAVIORS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBehavior(b.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  behavior === b.id ? "border-slate-800 bg-slate-50 text-slate-800" : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            Cosa hai osservato
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Descrivi la situazione con ${personObj?.name?.split(" ")[0]}...`}
            className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        {/* Level selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
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
                    active ? `${cfg?.bg} ${cfg?.border}` : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className={`text-base ${active ? cfg?.color : "text-slate-400"}`}>{cfg?.icon}</span>
                  <span className={`text-xs font-medium ${active ? cfg?.color : "text-slate-400"}`}>{cfg?.label}</span>
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

// ─── PERSON DETAIL ────────────────────────────────────────────────────────────

function PersonDetail({ person, notes, evals, onAddNote, onUpdateEval }: any) {
  const personNotes = notes[person.id] || {};
  const personEvals = evals[person.id] || {};
  const [expandedBehavior, setExpandedBehavior] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {BEHAVIORS.map((behavior) => {
        const behaviorNotes = personNotes[behavior.id] || [];
        const currentEval = personEvals[behavior.id];
        const levelConfig = getLevelConfig(currentEval);
        const isExpanded = expandedBehavior === behavior.id;

        return (
          <Card key={behavior.id} className="overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedBehavior(isExpanded ? null : behavior.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800">{behavior.name}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{behavior.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {levelConfig && (
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${levelConfig.bg} ${levelConfig.color}`}>
                      {levelConfig.icon} {levelConfig.label}
                    </span>
                  )}
                  <span className="text-slate-400 text-sm">{behaviorNotes.length} note</span>
                  <span className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                {/* Evaluation selector */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Valutazione
                  </label>
                  <div className="flex gap-2">
                    {(["training", "on_track", "example"] as const).map((lvl) => {
                      const cfg = getLevelConfig(lvl);
                      const active = currentEval === lvl;
                      return (
                        <button
                          key={lvl}
                          onClick={() => onUpdateEval(person.id, behavior.id, lvl)}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                            active ? `${cfg?.bg} ${cfg?.border} ${cfg?.color}` : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {cfg?.icon} {cfg?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes list */}
                <div className="space-y-2">
                  {behaviorNotes.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Nessuna nota registrata</p>
                  ) : (
                    behaviorNotes.map((note: any) => {
                      const noteCfg = getLevelConfig(note.level);
                      return (
                        <div key={note.id} className={`p-3 rounded-lg border-l-4 ${noteCfg?.bg} ${noteCfg?.border}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-semibold ${noteCfg?.color}`}>{noteCfg?.icon} {noteCfg?.label}</span>
                            <span className="text-xs text-slate-400">{note.date}</span>
                          </div>
                          <p className="text-sm text-slate-700">{note.text}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => onAddNote(person.id, behavior.id)}
                >
                  + Aggiungi nota
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTeam] = useState(TEAM);
  const [selectedPerson, setSelectedPerson] = useState(TEAM[0].id);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [evals, setEvals] = useState(INITIAL_EVALS);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContext, setNoteContext] = useState<{ person?: string; behavior?: string }>({});
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [currentManagerId, setCurrentManagerId] = useState<string | null>(null);
  const [managerPickerVisible, setManagerPickerVisible] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("people").select("id, name").in("role", ["manager", "ceo"]).then(({ data }) => { 
      if (data) setManagers(data); 
    });
  }, []);

  const handleSelectManager = (id: string) => {
    setCurrentManagerId(id);
    setManagerPickerVisible(false);
  };

  const handleSaveNote = (personId: string, behaviorId: string, text: string, level: string) => {
    const newNote = {
      id: Date.now(),
      date: new Date().toLocaleDateString("it-IT", { day: "numeric", month: "short" }),
      text,
      author: "manager",
      level,
    };
    setNotes((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        [behaviorId]: [...(prev[personId]?.[behaviorId] || []), newNote],
      },
    }));
    setShowNoteModal(false);
    setNoteContext({});
  };

  const handleUpdateEval = (personId: string, behaviorId: string, level: string) => {
    setEvals((prev) => ({
      ...prev,
      [personId]: {
        ...prev[personId],
        [behaviorId]: level,
      },
    }));
  };

  const openNoteModal = (personId?: string, behaviorId?: string) => {
    setNoteContext({ person: personId, behavior: behaviorId });
    setShowNoteModal(true);
  };

  const currentPerson = activeTeam.find((p) => p.id === selectedPerson);

  // Manager picker
  if (managerPickerVisible) {
    const displayManagers = managers.length > 0 ? managers : [{ id: "demo_manager", name: "Manager Demo" }];
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="flex justify-center mb-10">
            <div className="bg-slate-800 rounded-xl px-5 py-3">
              <span className="text-white font-bold text-xl">CVE</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 text-center mb-2">Chi sei?</h2>
          <p className="text-slate-500 text-center mb-8">Seleziona il tuo nome per continuare.</p>
          <div className="space-y-3">
            {displayManagers.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectManager(m.id)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white text-left font-medium text-slate-800 hover:border-teal-500 hover:bg-teal-50 transition-all"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 rounded-lg px-3 py-1.5">
                <span className="text-white font-bold text-sm">CVE</span>
              </div>
              <span className="text-slate-800 font-semibold">TalentTrack</span>
            </div>
            <Button variant="accent" size="sm" onClick={() => openNoteModal()}>
              + Nuova nota
            </Button>
          </div>
        </div>
      </header>

      {/* Team selector */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {activeTeam.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all flex-shrink-0 ${
                  selectedPerson === person.id
                    ? "border-slate-800 bg-slate-800 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Avatar initials={person.initials} size="sm" variant={selectedPerson === person.id ? "muted" : "primary"} />
                <div className="text-left">
                  <div className="font-medium text-sm">{person.name.split(" ")[0]}</div>
                  <div className={`text-xs ${selectedPerson === person.id ? "text-slate-300" : "text-slate-400"}`}>
                    {person.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {currentPerson && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800">{currentPerson.name}</h2>
              <p className="text-slate-500">{currentPerson.role}</p>
            </div>
            <PersonDetail
              person={currentPerson}
              notes={notes}
              evals={evals}
              onAddNote={openNoteModal}
              onUpdateEval={handleUpdateEval}
            />
          </>
        )}
      </main>

      {/* Note Modal */}
      {showNoteModal && (
        <QuickNoteModal
          team={activeTeam}
          selectedPerson={noteContext.person}
          selectedBehavior={noteContext.behavior}
          onClose={() => {
            setShowNoteModal(false);
            setNoteContext({});
          }}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}
