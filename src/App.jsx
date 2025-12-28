import { useEffect, useState } from "react";

// ===============================
// APP COMPLETA – VERSION PERSONAL
// ===============================
// Filosofía: claridad, continuidad, cero presión

const MONTH_MESSAGES = [
  "Inicio sin presión",
  "Ritmo propio",
  "Constancia también es volver",
  "Flexibilidad",
  "Presencia",
  "Equilibrio",
  "Paciencia",
  "Confianza",
  "Enfoque",
  "Aprendizaje",
  "Aceptación",
  "Gratitud"
];

const AREAS = {
  personal: "Personal",
  profesional: "Profesional",
  formacion: "Formación",
  creativa: "Creativa",
  freelancer: "Freelancer"
};

const STATUS_LABELS = {
  active: "Activa",
  replanned: "Replanificada",
  done: "Completada"
};

const STATUS_ICONS = {
  active: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  replanned: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  done: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
};

const STORAGE_KEY = "metas-app-goals";
const YEARLY_OBJECTIVES_KEY = "metas-app-yearly-objectives";

// Colores por trimestre
const QUARTER_COLORS = {
  1: { border: "border-blue-500/30", bg: "bg-blue-500/10", label: "Q1" },
  2: { border: "border-green-500/30", bg: "bg-green-500/10", label: "Q2" },
  3: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", label: "Q3" },
  4: { border: "border-purple-500/30", bg: "bg-purple-500/10", label: "Q4" }
};

function getQuarter(month) {
  return Math.floor(month / 3) + 1;
}

function getMonthsInQuarter(quarter) {
  const firstMonth = (quarter - 1) * 3;
  return [firstMonth, firstMonth + 1, firstMonth + 2];
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Calcular progreso del mes (0-1)
function getMonthProgress(year, month, currentDate) {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  
  // Si el mes es futuro, progreso = 0
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return 0;
  }
  
  // Si el mes es pasado, progreso = 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 1;
  }
  
  // Si es el mes actual, calcular días transcurridos
  const daysInMonth = getDaysInMonth(year, month);
  return currentDay / daysInMonth;
}

// Calcular progreso del trimestre (0-1)
function getQuarterProgress(quarter, currentDate) {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentQuarter = getQuarter(currentMonth);
  
  // Si el trimestre es futuro, progreso = 0
  if (quarter > currentQuarter) {
    return 0;
  }
  
  // Si el trimestre es pasado, progreso = 1
  if (quarter < currentQuarter) {
    return 1;
  }
  
  // Si es el trimestre actual, calcular meses transcurridos
  const firstMonthOfQuarter = (quarter - 1) * 3;
  const monthsPassed = currentMonth - firstMonthOfQuarter + 1;
  return monthsPassed / 3;
}

export default function App() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Ajustar mes seleccionado cuando cambia el año
  useEffect(() => {
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedYear, currentYear, currentMonth]);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStatus, setModalStatus] = useState("active");
  const [modalQuarter, setModalQuarter] = useState(1);
  const [modalMonth, setModalMonth] = useState(0);
  const [modalArea, setModalArea] = useState("personal");
  const [modalChecklist, setModalChecklist] = useState([{ id: Date.now(), text: "", completed: false }]);
  const [isObjectivesCollapsed, setIsObjectivesCollapsed] = useState(false);
  const [filterArea, setFilterArea] = useState("all");
  const [filterQuarter, setFilterQuarter] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAllCompletedGoals, setShowAllCompletedGoals] = useState(false);
  
  // Objetivos anuales
  const [yearlyObjectives, setYearlyObjectives] = useState(() => {
    const saved = localStorage.getItem(`${YEARLY_OBJECTIVES_KEY}-${selectedYear}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Actualizar objetivos cuando cambia el año
  useEffect(() => {
    const saved = localStorage.getItem(`${YEARLY_OBJECTIVES_KEY}-${selectedYear}`);
    setYearlyObjectives(saved ? JSON.parse(saved) : []);
  }, [selectedYear]);
  const [newObjective, setNewObjective] = useState("");
  const [editingObjectiveId, setEditingObjectiveId] = useState(null);
  const [editObjectiveText, setEditObjectiveText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(`${YEARLY_OBJECTIVES_KEY}-${selectedYear}`, JSON.stringify(yearlyObjectives));
  }, [yearlyObjectives, selectedYear]);

  // Función helper para resetear el modal
  function resetModal() {
    setModalTitle("");
    setModalStatus("active");
    setModalQuarter(getQuarter(selectedMonth));
    setModalMonth(selectedMonth);
    setModalArea("personal");
    setModalChecklist([{ id: Date.now(), text: "", completed: false }]);
    setEditingGoalId(null);
    setIsModalOpen(false);
  }

  function addGoal() {
    if (!modalTitle.trim()) return;
    
    if (editingGoalId) {
      // Actualizar meta existente
      setGoals(goals.map(g =>
        g.id === editingGoalId
          ? {
              ...g,
              title: modalTitle.trim(),
              area: modalArea,
              status: modalStatus,
              quarter: modalQuarter,
              startMonth: modalMonth,
              activeMonths: [modalMonth],
              checklist: modalChecklist.filter(item => item.text.trim() !== "")
            }
          : g
      ));
    } else {
      // Crear nueva meta
      setGoals([
        ...goals,
        {
          id: Date.now(),
          title: modalTitle.trim(),
          area: modalArea,
          status: modalStatus,
          startMonth: modalMonth,
          activeMonths: [modalMonth],
          year: selectedYear,
          quarter: modalQuarter,
          checklist: modalChecklist.filter(item => item.text.trim() !== "")
        }
      ]);
    }
    
    // Reset modal form
    resetModal();
  }

  function replanGoal(id) {
    setGoals(goals.map(g => {
      if (g.id === id) {
        // Calcular el siguiente mes
        const currentStartMonth = g.startMonth !== undefined ? g.startMonth : selectedMonth;
        const currentGoalYear = g.year !== undefined ? g.year : selectedYear;
        const nextMonth = (currentStartMonth + 1) % 12;
        const nextYear = currentStartMonth === 11 ? currentGoalYear + 1 : currentGoalYear;
        
        // Calcular el trimestre del siguiente mes
        const nextQuarter = getQuarter(nextMonth);
        
        // Incrementar el contador de postergaciones
        const postponedCount = (g.postponedCount || 0) + 1;
        
        return {
          ...g,
          status: "replanned",
          startMonth: nextMonth,
          year: nextYear,
          quarter: nextQuarter,
          // Solo el nuevo mes está activo (donde aparecerá la meta)
          activeMonths: [nextMonth],
          // Contador de postergaciones para el contador visual
          postponedCount: postponedCount
        };
      }
      return g;
    }));
  }

  function completeGoal(id) {
    setGoals(goals.map(g =>
      g.id === id ? { ...g, status: "done" } : g
    ));
  }

  function deleteGoal(id) {
    setGoals(goals.filter(g => g.id !== id));
  }

  function startEdit(goal) {
    setEditingGoalId(goal.id);
    setModalTitle(goal.title || "");
    setModalArea(goal.area || "personal");
    setModalStatus(goal.status || "active");
    setModalQuarter(goal.quarter || 1);
    setModalMonth(goal.startMonth !== undefined ? goal.startMonth : 0);
    setModalChecklist(goal.checklist && goal.checklist.length > 0 
      ? goal.checklist.map(item => ({ ...item, id: item.id || Date.now() }))
      : [{ id: Date.now(), text: "", completed: false }]
    );
    setIsModalOpen(true);
  }

  // Funciones para objetivos anuales
  function addYearlyObjective() {
    if (!newObjective.trim()) return;
    setYearlyObjectives([
      ...yearlyObjectives,
      {
        id: Date.now(),
        text: newObjective.trim(),
        completed: false
      }
    ]);
    setNewObjective("");
  }

  function deleteYearlyObjective(id) {
    setYearlyObjectives(yearlyObjectives.filter(obj => obj.id !== id));
  }

  function toggleYearlyObjective(id) {
    setYearlyObjectives(yearlyObjectives.map(obj =>
      obj.id === id ? { ...obj, completed: !obj.completed } : obj
    ));
  }

  function startEditObjective(objective) {
    setEditingObjectiveId(objective.id);
    setEditObjectiveText(objective.text);
  }

  function saveEditObjective() {
    if (!editObjectiveText.trim()) return;
    setYearlyObjectives(yearlyObjectives.map(obj =>
      obj.id === editingObjectiveId
        ? { ...obj, text: editObjectiveText.trim() }
        : obj
    ));
    setEditingObjectiveId(null);
    setEditObjectiveText("");
  }

  function cancelEditObjective() {
    setEditingObjectiveId(null);
    setEditObjectiveText("");
  }

  const visibleGoals = goals
    .filter(g => g.year === selectedYear && g.activeMonths.includes(selectedMonth))
    .filter(g => filterArea === "all" || g.area === filterArea)
    .filter(g => filterQuarter === "all" || g.quarter === Number(filterQuarter))
    .filter(g => filterStatus === "all" || g.status === filterStatus)
    .sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }));

  const completedGoals = goals
    .filter(g => g.year === selectedYear && g.status === "done")
    .sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }));

  const allCompletedGoals = goals
    .filter(g => g.status === "done")
    .sort((a, b) => {
      // Ordenar por año descendente, luego por título
      if (b.year !== a.year) return b.year - a.year;
      return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
    });

  const displayedCompletedGoals = showAllCompletedGoals ? allCompletedGoals : completedGoals;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Layout con dos columnas */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Columna izquierda - Calendario */}
          <div className="flex-shrink-0 w-full lg:w-64">
            {/* Header con logo */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800/50">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Metas" 
                  className="h-16 w-16 object-contain drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl"></div>
              </div>
              <div className="flex flex-col flex-1">
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Metas
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={selectedYear}
                    onChange={e => {
                      setSelectedYear(Number(e.target.value));
                      setSelectedMonth(0); // Resetear al primer mes al cambiar de año
                    }}
                    className="text-xs font-semibold text-slate-300 bg-slate-900/50 border border-slate-700/50 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer hover:bg-slate-800/50 transition"
                  >
                    {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map(y => (
                      <option key={y} value={y} className="bg-slate-900">
                        {y === currentYear ? `AÑO ${y} (Actual)` : `AÑO ${y}`}
                      </option>
                    ))}
                  </select>
                  {selectedYear !== currentYear && (
                    <button
                      onClick={() => {
                        setSelectedYear(currentYear);
                        setSelectedMonth(currentMonth);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition"
                      title="Volver al año actual"
                    >
                      Hoy
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Objetivos principales del año */}
            <section className="mb-6 pb-6 border-b border-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-200">Objetivos principales</h2>
                <button
                  onClick={() => setIsObjectivesCollapsed(!isObjectivesCollapsed)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition px-2.5 py-1 rounded-lg hover:bg-slate-800/50"
                >
                  {isObjectivesCollapsed ? "▼" : "▲"}
                </button>
              </div>
              
              {!isObjectivesCollapsed && (
                <>
                  {/* Agregar objetivo */}
                  <div className="flex gap-2 mb-4">
                    <input
                      value={newObjective}
                      onChange={e => setNewObjective(e.target.value)}
                      onKeyPress={e => e.key === "Enter" && addYearlyObjective()}
                      placeholder="Nuevo objetivo..."
                      className="flex-1 rounded-lg bg-slate-900/50 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-slate-600 transition"
                    />
                    <button
                      onClick={addYearlyObjective}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/20"
                    >
                      Agregar
                    </button>
                  </div>

                  {/* Lista de objetivos */}
                  <div className="space-y-2">
                    {yearlyObjectives.length === 0 && (
                      <p className="text-sm opacity-50 italic">No hay objetivos definidos aún.</p>
                    )}
                    {yearlyObjectives.map(objective => (
                      <YearlyObjectiveCard
                        key={objective.id}
                        objective={objective}
                        isEditing={editingObjectiveId === objective.id}
                        editText={editObjectiveText}
                        onEditTextChange={setEditObjectiveText}
                        onStartEdit={() => startEditObjective(objective)}
                        onSaveEdit={saveEditObjective}
                        onCancelEdit={cancelEditObjective}
                        onDelete={() => deleteYearlyObjective(objective.id)}
                        onToggle={() => toggleYearlyObjective(objective.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Botón de agregar meta */}
            <button
              onClick={() => {
                resetModal();
                setIsModalOpen(true);
              }}
              className="w-full mb-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3.5 font-semibold hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Meta
            </button>
            <Calendar 
              year={selectedYear}
              month={selectedMonth}
              currentDate={today}
            />

            {/* Metas logradas */}
            {(completedGoals.length > 0 || showAllCompletedGoals) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Metas logradas
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400 font-medium">
                      {showAllCompletedGoals ? allCompletedGoals.length : completedGoals.length}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition">
                      Todos los años
                    </span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={showAllCompletedGoals}
                        onChange={e => setShowAllCompletedGoals(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </div>
                  </label>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {displayedCompletedGoals.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-2">
                      No hay metas logradas
                    </p>
                  ) : (
                    displayedCompletedGoals.map(goal => (
                      <div
                        key={goal.id}
                        className={`flex items-start gap-2.5 rounded-lg bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/50 hover:border-slate-700/50 transition backdrop-blur-sm ${
                          showAllCompletedGoals ? "p-2" : "p-3"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          {showAllCompletedGoals ? (
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-slate-300 line-through opacity-60 font-medium">
                                {goal.title}
                              </p>
                              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                {goal.year}
                              </span>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-slate-300 line-through opacity-60 font-medium">
                                {goal.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {AREAS[goal.area]}
                                </span>
                                {goal.quarter && (
                                  <>
                                    <span className="text-[10px] text-slate-600">•</span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      Q{goal.quarter}
                                    </span>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Contenido principal */}
          <div className="flex-1 min-w-0 w-full">
        {/* Mes + mensaje */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {new Date(selectedYear, selectedMonth).toLocaleString("es-ES", { month: "long" }).toUpperCase()}
          </h1>
          <p className="text-slate-400 text-lg font-light italic">
            {MONTH_MESSAGES[selectedMonth]}
          </p>
        </div>

        {/* Selector de meses */}
        <div className="mb-8">
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2 overflow-x-auto md:overflow-visible">
            {Array.from({ length: 12 }).map((_, i) => {
              const quarter = getQuarter(i);
              const quarterColor = QUARTER_COLORS[quarter];
              const isSelected = i === selectedMonth;
              const isFirstInQuarter = i % 3 === 0;
              const monthProgress = getMonthProgress(selectedYear, i, today);
              const isPast = monthProgress === 1;
              const isCurrent = monthProgress > 0 && monthProgress < 1;
              const isFuture = monthProgress === 0;
              
              return (
                <div key={i} className="relative">
                  {isFirstInQuarter && i > 0 && (
                    <div className="hidden md:block absolute left-0 top-1/2 -translate-x-1/2 w-px h-6 bg-slate-700 -translate-y-1/2 z-0" />
                  )}
                  <button
                    onClick={() => setSelectedMonth(i)}
                    className={`w-full px-2 md:px-2 py-2 rounded-lg text-xs font-medium transition-all relative overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : `bg-slate-900/50 text-slate-400 border ${quarterColor.border} hover:bg-slate-800/50 hover:text-slate-300 hover:scale-102`
                    }`}
                    title={`Trimestre ${quarter} - ${Math.round(monthProgress * 100)}% completado`}
                  >
                    <span className="relative z-10">{new Date(0, i).toLocaleString("es-ES", { month: "short" })}</span>
                    {/* Barra de progreso de fondo */}
                    {!isSelected && (isPast || isCurrent) && (
                      <div 
                        className={`absolute inset-0 ${quarterColor.bg} opacity-20`}
                        style={{ width: `${monthProgress * 100}%` }}
                      />
                    )}
                    {!isSelected && (
                      <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${quarterColor.bg} border ${quarterColor.border} z-10`} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Indicador de trimestre actual con progreso */}
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Trimestre:</span>
              <span className={`px-3 py-1 rounded-full border ${QUARTER_COLORS[getQuarter(selectedMonth)].border} ${QUARTER_COLORS[getQuarter(selectedMonth)].bg} text-slate-300 font-semibold`}>
                {QUARTER_COLORS[getQuarter(selectedMonth)].label}
              </span>
            </div>
            {(() => {
              const currentQuarter = getQuarter(selectedMonth);
              const quarterProgress = getQuarterProgress(currentQuarter, today);
              const isCurrentQuarter = quarterProgress > 0 && quarterProgress < 1;
              if (isCurrentQuarter || quarterProgress === 1) {
                return (
                  <div className="flex items-center gap-2">
                    <span>Progreso:</span>
                    <div className="flex-1 w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${QUARTER_COLORS[currentQuarter].bg} border ${QUARTER_COLORS[currentQuarter].border}`}
                        style={{ width: `${quarterProgress * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px]">{Math.round(quarterProgress * 100)}%</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8 p-3 md:p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 md:items-center">
            <div className="flex items-center gap-2 mb-1 md:mb-0">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <label className="text-sm font-medium text-slate-300">Filtros:</label>
            </div>
            
            {/* Filtro por Área */}
            <div className="flex-1 md:flex-initial">
              <select
                value={filterArea}
                onChange={e => setFilterArea(e.target.value)}
                className="w-full md:w-auto rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer hover:bg-slate-800"
              >
                <option value="all">Todas las áreas</option>
                {Object.entries(AREAS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-slate-800">{v}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Trimestre */}
            <div className="flex-1 md:flex-initial">
              <select
                value={filterQuarter}
                onChange={e => setFilterQuarter(e.target.value)}
                className="w-full md:w-auto rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer hover:bg-slate-800"
              >
                <option value="all">Todos los trimestres</option>
                <option value="1" className="bg-slate-800">Q1</option>
                <option value="2" className="bg-slate-800">Q2</option>
                <option value="3" className="bg-slate-800">Q3</option>
                <option value="4" className="bg-slate-800">Q4</option>
              </select>
            </div>

            {/* Filtro por Estado */}
            <div className="flex-1 md:flex-initial">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full md:w-auto rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer hover:bg-slate-800"
              >
                <option value="all">Todos los estados</option>
                <option value="active" className="bg-slate-800">Activa</option>
                <option value="replanned" className="bg-slate-800">Replanificada</option>
                <option value="done" className="bg-slate-800">Completada</option>
              </select>
            </div>

            {/* Contador de resultados */}
            <div className="w-full md:w-auto md:ml-auto flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
              <span className="text-sm font-semibold text-slate-200">{visibleGoals.length}</span>
              <span className="text-xs text-slate-400">{visibleGoals.length === 1 ? "meta" : "metas"}</span>
            </div>
          </div>
        </div>

        {/* Metas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleGoals.length === 0 && (
            <div className="opacity-50">Este mes también cuenta.</div>
          )}
          {visibleGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onStartEdit={() => startEdit(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onReplan={() => replanGoal(goal.id)}
              onComplete={() => completeGoal(goal.id)}
            />
          ))}
        </div>
          </div>
        </div>
      </main>

      {/* Modal para agregar meta */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={resetModal}
        >
          <div 
            className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800/50 bg-gradient-to-r from-slate-900/50 to-slate-800/30">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {editingGoalId ? "Editar Meta" : "Nueva Meta"}
                </h2>
                <button
                  onClick={resetModal}
                  className="text-slate-400 hover:text-slate-200 transition p-2 hover:bg-slate-800/50 rounded-lg"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="space-y-5">
            
                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Título
                  </label>
                  <input
                    value={modalTitle}
                    onChange={e => setModalTitle(e.target.value)}
                    placeholder="Escribe el título de tu meta…"
                    className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                    autoFocus
                  />
                </div>

                {/* Área y Estado - Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Área
                    </label>
                    <select
                      value={modalArea}
                      onChange={e => setModalArea(e.target.value)}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer"
                    >
                      {Object.entries(AREAS).map(([k, v]) => (
                        <option key={k} value={k} className="bg-slate-800">{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Estado
                    </label>
                    <select
                      value={modalStatus}
                      onChange={e => setModalStatus(e.target.value)}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer"
                    >
                      <option value="active" className="bg-slate-800">Activa</option>
                      <option value="replanned" className="bg-slate-800">Replanificada</option>
                      <option value="done" className="bg-slate-800">Completada</option>
                    </select>
                  </div>
                </div>

                {/* Trimestre y Mes - Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Trimestre
                    </label>
                    <select
                      value={modalQuarter}
                      onChange={e => {
                        const newQuarter = Number(e.target.value);
                        setModalQuarter(newQuarter);
                        // Si el mes actual no pertenece al nuevo trimestre, cambiar al primer mes del trimestre
                        const monthsInQuarter = getMonthsInQuarter(newQuarter);
                        if (!monthsInQuarter.includes(modalMonth)) {
                          setModalMonth(monthsInQuarter[0]);
                        }
                      }}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer"
                    >
                      <option value={1} className="bg-slate-800">Q1</option>
                      <option value={2} className="bg-slate-800">Q2</option>
                      <option value={3} className="bg-slate-800">Q3</option>
                      <option value={4} className="bg-slate-800">Q4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Mes
                    </label>
                    <select
                      value={modalMonth}
                      onChange={e => setModalMonth(Number(e.target.value))}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer"
                    >
                      {getMonthsInQuarter(modalQuarter).map((i) => (
                        <option 
                          key={i} 
                          value={i} 
                          className="bg-slate-800"
                        >
                          {new Date(selectedYear, i).toLocaleString("es-ES", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Checklist
                  </label>
                  <div className="space-y-2.5 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    {modalChecklist.map((item, index) => (
                      <div key={item.id} className="flex gap-2.5 items-center group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => {
                            const newChecklist = [...modalChecklist];
                            newChecklist[index].completed = e.target.checked;
                            setModalChecklist(newChecklist);
                          }}
                          className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-800/50 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition"
                        />
                        <input
                          value={item.text}
                          onChange={(e) => {
                            const newChecklist = [...modalChecklist];
                            newChecklist[index].text = e.target.value;
                            setModalChecklist(newChecklist);
                          }}
                          placeholder={`Tarea ${index + 1}…`}
                          className="flex-1 rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                        />
                        {modalChecklist.length > 1 && (
                          <button
                            onClick={() => {
                              setModalChecklist(modalChecklist.filter((_, i) => i !== index));
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded transition"
                            aria-label="Eliminar tarea"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setModalChecklist([...modalChecklist, { id: Date.now(), text: "", completed: false }]);
                      }}
                      className="w-full text-sm text-slate-400 hover:text-slate-200 py-2 px-3 rounded-lg hover:bg-slate-700/30 transition flex items-center gap-2 justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar tarea
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-900/30">
              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 font-semibold transition border border-slate-700/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={addGoal}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/20"
                >
                  {editingGoalId ? "Guardar cambios" : "Crear meta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({ 
  goal, 
  onStartEdit,
  onDelete,
  onReplan, 
  onComplete
}) {
  const statusColors = {
    active: "from-blue-600 to-indigo-600",
    replanned: "from-amber-600 to-orange-600",
    done: "from-emerald-600 to-teal-600"
  };

  return (
    <div className="group rounded-xl bg-slate-900/50 border border-slate-800/50 p-5 shadow-lg hover:shadow-xl hover:border-slate-700/50 transition-all duration-300 backdrop-blur-sm hover:bg-slate-900/70">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold flex-1 pr-3 text-slate-100 group-hover:text-white transition">
          {goal.title}
        </h3>
        <div className="flex gap-1.5">
          <button
            onClick={onStartEdit}
            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 transition"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-lg bg-slate-800/50 text-xs font-medium text-slate-300">
          {AREAS[goal.area]}
        </span>
        <span className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${statusColors[goal.status]} text-xs font-medium text-white flex items-center gap-1.5`}>
          {STATUS_ICONS[goal.status]}
          {STATUS_LABELS[goal.status]}
        </span>
        {goal.quarter && (
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/50 text-xs font-medium text-slate-300">
            Q{goal.quarter}
          </span>
        )}
      </div>

      {/* Checklist - Contador */}
      {goal.checklist && goal.checklist.length > 0 && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-sm font-semibold text-slate-200">
            {goal.checklist.filter(item => item.completed).length}/{goal.checklist.length}
          </span>
          <span className="text-xs text-slate-400">tareas</span>
        </div>
      )}

      {/* Huella de tiempo - Postergaciones */}
      {goal.postponedCount > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-slate-500 font-medium">
              {goal.postponedCount} {goal.postponedCount === 1 ? "postergación" : "postergaciones"}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: goal.postponedCount }).map((_, i) => (
              <span 
                key={i} 
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm" 
                title={`Postergación ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      {goal.status !== "done" && (
        <div className="flex gap-2 pt-3 border-t border-slate-800/50">
          <button
            onClick={onReplan}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-xs font-medium text-slate-300 hover:text-slate-100 transition"
          >
            Pasar al mes siguiente
          </button>
          <button
            onClick={onComplete}
            className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-medium text-white transition shadow-md shadow-emerald-500/20"
          >
            Lograda
          </button>
        </div>
      )}
    </div>
  );
}

function Calendar({ year, month, currentDate }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];
  
  // Días de la semana en español (abreviados)
  const weekDays = ["D", "L", "M", "X", "J", "V", "S"];
  
  // Espacios vacíos al inicio del mes
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  // Determinar si es el mes actual
  const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth();
  const currentDay = currentDate.getDate();
  const monthProgress = getMonthProgress(year, month, currentDate);
  
  return (
    <div className="lg:sticky lg:top-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {new Date(year, month).toLocaleString("es-ES", { month: "long" })}
        </h3>
        {monthProgress > 0 && monthProgress < 1 && (
          <span className="text-[10px] text-slate-500 font-medium">
            {Math.round(monthProgress * 100)}%
          </span>
        )}
      </div>
      <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-4 max-w-xs mx-auto lg:mx-0 backdrop-blur-sm">
        {/* Barra de progreso del mes */}
        {monthProgress > 0 && (
          <div className="mb-4 h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all shadow-lg shadow-blue-500/30"
              style={{ width: `${monthProgress * 100}%` }}
            />
          </div>
        )}
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] text-slate-500 font-semibold py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="aspect-square" />;
            }
            
            const isPast = isCurrentMonth && day < currentDay;
            const isToday = isCurrentMonth && day === currentDay;
            const isFuture = isCurrentMonth && day > currentDay;
            const isPastMonth = year < currentDate.getFullYear() || (year === currentDate.getFullYear() && month < currentDate.getMonth());
            
            return (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-xs rounded-lg transition ${
                  isToday
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 scale-110"
                    : isPast || isPastMonth
                    ? "bg-slate-800/30 text-slate-500"
                    : isFuture
                    ? "text-slate-600 hover:bg-slate-800/30"
                    : "text-slate-300 hover:bg-slate-800/30"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function YearlyObjectiveCard({
  objective,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onToggle
}) {
  if (isEditing) {
    return (
      <div className="flex gap-2 items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800/50">
        <input
          value={editText}
          onChange={e => onEditTextChange(e.target.value)}
          className="flex-1 rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          autoFocus
        />
        <button
          onClick={onSaveEdit}
          className="text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-500 hover:to-indigo-500 transition"
        >
          Guardar
        </button>
        <button
          onClick={onCancelEdit}
          className="text-xs px-3 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/50 hover:border-slate-700/50 transition backdrop-blur-sm">
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition flex items-center justify-center ${
          objective.completed
            ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500"
            : "border-slate-600 hover:border-slate-400 bg-slate-800/50"
        }`}
      >
        {objective.completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 text-sm font-medium ${
          objective.completed
            ? "line-through opacity-50 text-slate-500"
            : "text-slate-200"
        }`}
      >
        {objective.text}
      </span>
      <div className="flex gap-1">
        <button
          onClick={onStartEdit}
          className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 transition"
          title="Editar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition"
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
