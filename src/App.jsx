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
  const year = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState("");
  const [area, setArea] = useState("personal");
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
  
  // Objetivos anuales
  const [yearlyObjectives, setYearlyObjectives] = useState(() => {
    const saved = localStorage.getItem(`${YEARLY_OBJECTIVES_KEY}-${year}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [newObjective, setNewObjective] = useState("");
  const [editingObjectiveId, setEditingObjectiveId] = useState(null);
  const [editObjectiveText, setEditObjectiveText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(`${YEARLY_OBJECTIVES_KEY}-${year}`, JSON.stringify(yearlyObjectives));
  }, [yearlyObjectives, year]);

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
          year,
          quarter: modalQuarter,
          checklist: modalChecklist.filter(item => item.text.trim() !== "")
        }
      ]);
    }
    
    // Reset modal form
    setModalTitle("");
    setModalStatus("active");
    setModalQuarter(1);
    setModalMonth(0);
    setModalArea("personal");
    setModalChecklist([{ id: Date.now(), text: "", completed: false }]);
    setEditingGoalId(null);
    setIsModalOpen(false);
  }

  function replanGoal(id) {
    setGoals(goals.map(g =>
      g.id === id
        ? {
            ...g,
            status: "replanned",
            activeMonths: g.activeMonths.includes(selectedMonth)
              ? g.activeMonths
              : [...g.activeMonths, selectedMonth]
          }
        : g
    ));
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
    .filter(g => g.year === year && g.activeMonths.includes(selectedMonth))
    .filter(g => filterArea === "all" || g.area === filterArea)
    .filter(g => filterQuarter === "all" || g.quarter === Number(filterQuarter))
    .filter(g => filterStatus === "all" || g.status === filterStatus)
    .sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }));

  const completedGoals = goals
    .filter(g => g.year === year && g.status === "done")
    .sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header con logo */}
        <div className="flex items-center gap-4 mb-6">
          <img 
            src="/logo.png" 
            alt="Metas" 
            className="h-10 w-10 object-contain"
          />
          <div className="text-sm opacity-60">AÑO {year}</div>
        </div>

        {/* Layout con dos columnas */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Columna izquierda - Calendario */}
          <div className="flex-shrink-0 w-full lg:w-64">
            {/* Objetivos principales del año */}
            <section className="mb-6 pb-6 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light">Objetivos principales del año</h2>
                <button
                  onClick={() => setIsObjectivesCollapsed(!isObjectivesCollapsed)}
                  className="text-sm opacity-70 hover:opacity-100 transition px-3 py-1 rounded-full hover:bg-neutral-800"
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
                      className="flex-1 rounded-xl bg-neutral-900 px-1 py-2 text-sm"
                    />
                    <button
                      onClick={addYearlyObjective}
                      className="rounded-xl bg-neutral-100 text-neutral-900 px-4 py-2 text-sm"
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
                setEditingGoalId(null);
                setModalTitle("");
                setModalStatus("active");
                setModalQuarter(1);
                setModalMonth(0);
                setModalArea("personal");
                setModalChecklist([{ id: Date.now(), text: "", completed: false }]);
                setIsModalOpen(true);
              }}
              className="w-full mb-4 rounded-xl bg-neutral-100 text-neutral-900 px-5 py-3 font-medium hover:bg-neutral-200 transition"
            >
              + Agregar Meta
            </button>
            <Calendar 
              year={year}
              month={selectedMonth}
              currentDate={today}
            />

            {/* Metas logradas */}
            {completedGoals.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-medium mb-3 opacity-70 uppercase tracking-wide">
                  Metas logradas
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {completedGoals.map(goal => (
                    <div
                      key={goal.id}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/50 hover:bg-neutral-900 transition"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-200 line-through opacity-70">
                          {goal.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-neutral-500">
                            {AREAS[goal.area]}
                          </span>
                          {goal.quarter && (
                            <>
                              <span className="text-[10px] text-neutral-600">•</span>
                              <span className="text-[10px] text-neutral-500">
                                Q{goal.quarter}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Contenido principal */}
          <div className="flex-1 min-w-0 w-full">
        {/* Mes + mensaje */}
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-2">
            {new Date(year, selectedMonth).toLocaleString("es-ES", { month: "long" }).toUpperCase()}
          </h1>
          <p className="text-neutral-400 text-lg">
            {MONTH_MESSAGES[selectedMonth]}
          </p>
        </div>

        {/* Selector de meses */}
        <div className="mb-8">
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const quarter = getQuarter(i);
              const quarterColor = QUARTER_COLORS[quarter];
              const isSelected = i === selectedMonth;
              const isFirstInQuarter = i % 3 === 0;
              const monthProgress = getMonthProgress(year, i, today);
              const isPast = monthProgress === 1;
              const isCurrent = monthProgress > 0 && monthProgress < 1;
              const isFuture = monthProgress === 0;
              
              return (
                <div key={i} className="relative">
                  {isFirstInQuarter && i > 0 && (
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 w-px h-6 bg-neutral-700 -translate-y-1/2 z-0" />
                  )}
                  <button
                    onClick={() => setSelectedMonth(i)}
                    className={`w-full px-2 py-1.5 rounded-full text-xs transition relative overflow-hidden ${
                      isSelected
                        ? "bg-neutral-100 text-neutral-900"
                        : `bg-neutral-800 text-neutral-400 border ${quarterColor.border}`
                    }`}
                    title={`Trimestre ${quarter} - ${Math.round(monthProgress * 100)}% completado`}
                  >
                    <span className="relative z-10">{new Date(0, i).toLocaleString("es-ES", { month: "short" })}</span>
                    {/* Barra de progreso de fondo */}
                    {!isSelected && (isPast || isCurrent) && (
                      <div 
                        className={`absolute inset-0 ${quarterColor.bg} opacity-30`}
                        style={{ width: `${monthProgress * 100}%` }}
                      />
                    )}
                    {!isSelected && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${quarterColor.bg} border ${quarterColor.border} z-10`} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Indicador de trimestre actual con progreso */}
          <div className="mt-3 flex items-center gap-3 text-xs opacity-60">
            <div className="flex items-center gap-2">
              <span>Trimestre actual:</span>
              <span className={`px-2 py-0.5 rounded-full border ${QUARTER_COLORS[getQuarter(selectedMonth)].border} ${QUARTER_COLORS[getQuarter(selectedMonth)].bg}`}>
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
                    <div className="flex-1 w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
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
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-70">Filtrar por:</label>
          </div>
          
          {/* Filtro por Área */}
          <div className="flex items-center gap-2">
            <label className="text-xs opacity-60">Área:</label>
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition appearance-none cursor-pointer"
            >
              <option value="all">Todas</option>
              {Object.entries(AREAS).map(([k, v]) => (
                <option key={k} value={k} className="bg-neutral-800">{v}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Trimestre */}
          <div className="flex items-center gap-2">
            <label className="text-xs opacity-60">Trimestre:</label>
            <select
              value={filterQuarter}
              onChange={e => setFilterQuarter(e.target.value)}
              className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="1" className="bg-neutral-800">Q1</option>
              <option value="2" className="bg-neutral-800">Q2</option>
              <option value="3" className="bg-neutral-800">Q3</option>
              <option value="4" className="bg-neutral-800">Q4</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2">
            <label className="text-xs opacity-60">Estado:</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="active" className="bg-neutral-800">Activa</option>
              <option value="replanned" className="bg-neutral-800">Replanificada</option>
              <option value="done" className="bg-neutral-800">Completada</option>
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="ml-auto text-xs opacity-60">
            {visibleGoals.length} {visibleGoals.length === 1 ? "meta" : "metas"}
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
          onClick={() => {
            setIsModalOpen(false);
            setEditingGoalId(null);
            setModalTitle("");
            setModalStatus("active");
            setModalQuarter(1);
            setModalMonth(0);
            setModalArea("personal");
            setModalChecklist([{ id: Date.now(), text: "", completed: false }]);
          }}
        >
          <div 
            className="bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light">
                  {editingGoalId ? "Editar Meta" : "Nueva Meta"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGoalId(null);
                    setModalTitle("");
                    setModalStatus("active");
                    setModalQuarter(1);
                    setModalMonth(0);
                    setModalArea("personal");
                    setModalChecklist([{ id: Date.now(), text: "", completed: false }]);
                  }}
                  className="text-neutral-400 hover:text-neutral-200 transition p-1 hover:bg-neutral-800 rounded-lg"
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
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Título
                  </label>
                  <input
                    value={modalTitle}
                    onChange={e => setModalTitle(e.target.value)}
                    placeholder="Escribe el título de tu meta…"
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition"
                    autoFocus
                  />
                </div>

                {/* Área y Estado - Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Área
                    </label>
                    <select
                      value={modalArea}
                      onChange={e => setModalArea(e.target.value)}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition appearance-none cursor-pointer"
                    >
                      {Object.entries(AREAS).map(([k, v]) => (
                        <option key={k} value={k} className="bg-neutral-800">{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Estado
                    </label>
                    <select
                      value={modalStatus}
                      onChange={e => setModalStatus(e.target.value)}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition appearance-none cursor-pointer"
                    >
                      <option value="active" className="bg-neutral-800">Activa</option>
                      <option value="replanned" className="bg-neutral-800">Replanificada</option>
                      <option value="done" className="bg-neutral-800">Completada</option>
                    </select>
                  </div>
                </div>

                {/* Trimestre y Mes - Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Trimestre
                    </label>
                    <select
                      value={modalQuarter}
                      onChange={e => setModalQuarter(Number(e.target.value))}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition appearance-none cursor-pointer"
                    >
                      <option value={1} className="bg-neutral-800">Q1</option>
                      <option value={2} className="bg-neutral-800">Q2</option>
                      <option value={3} className="bg-neutral-800">Q3</option>
                      <option value={4} className="bg-neutral-800">Q4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Mes
                    </label>
                    <select
                      value={modalMonth}
                      onChange={e => setModalMonth(Number(e.target.value))}
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i} className="bg-neutral-800">
                          {new Date(year, i).toLocaleString("es-ES", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Checklist
                  </label>
                  <div className="space-y-2.5 bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
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
                          className="w-4 h-4 rounded border-2 border-neutral-600 bg-neutral-800 text-neutral-100 focus:ring-2 focus:ring-neutral-600 cursor-pointer transition"
                        />
                        <input
                          value={item.text}
                          onChange={(e) => {
                            const newChecklist = [...modalChecklist];
                            newChecklist[index].text = e.target.value;
                            setModalChecklist(newChecklist);
                          }}
                          placeholder={`Tarea ${index + 1}…`}
                          className="flex-1 rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent transition"
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
                      className="w-full text-sm text-neutral-400 hover:text-neutral-200 py-2 px-3 rounded-lg hover:bg-neutral-700/30 transition flex items-center gap-2 justify-center"
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
            <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGoalId(null);
                    setModalTitle("");
                    setModalStatus("active");
                    setModalQuarter(1);
                    setModalMonth(0);
                    setModalArea("personal");
                    setModalChecklist([{ id: Date.now(), text: "", completed: false }]);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={addGoal}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-neutral-100 text-neutral-900 font-medium hover:bg-neutral-200 transition shadow-sm"
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
  return (
    <div className="rounded-xl bg-neutral-900 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="text-sm font-medium flex-1 pr-2">{goal.title}</h3>
        <div className="flex gap-1">
          <button
            onClick={onStartEdit}
            className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 hover:bg-neutral-700 transition"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 hover:bg-red-900/30 transition"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[10px] opacity-70 mb-2 items-center">
        <span>{AREAS[goal.area]}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          {STATUS_ICONS[goal.status]}
          {STATUS_LABELS[goal.status]}
        </span>
        {goal.quarter && (
          <>
            <span>•</span>
            <span>Q{goal.quarter}</span>
          </>
        )}
      </div>

      {/* Checklist - Contador */}
      {goal.checklist && goal.checklist.length > 0 && (
        <div className="mb-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xs text-neutral-300">
            {goal.checklist.filter(item => item.completed).length}/{goal.checklist.length}
          </span>
        </div>
      )}

      {/* Huella de tiempo */}
      <div className="flex gap-0.5 mb-2">
        {goal.activeMonths.map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
        ))}
      </div>

      {/* Acciones */}
      {goal.status !== "done" && (
        <div className="flex gap-1.5">
          <button
            onClick={onReplan}
            className="text-[10px] px-2 py-1 rounded-full bg-neutral-800"
          >
            Pasar al mes siguiente
          </button>
          <button
            onClick={onComplete}
            className="text-[10px] px-2 py-1 rounded-full bg-neutral-700"
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
        <h3 className="text-xs font-medium opacity-70 uppercase tracking-wide">
          {new Date(year, month).toLocaleString("es-ES", { month: "long" })}
        </h3>
        {monthProgress > 0 && monthProgress < 1 && (
          <span className="text-[10px] opacity-50">
            {Math.round(monthProgress * 100)}%
          </span>
        )}
      </div>
      <div className="rounded-xl bg-neutral-900 p-3 max-w-xs mx-auto lg:mx-0">
        {/* Barra de progreso del mes */}
        {monthProgress > 0 && (
          <div className="mb-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-neutral-100 transition-all"
              style={{ width: `${monthProgress * 100}%` }}
            />
          </div>
        )}
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] opacity-50 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-0.5">
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
                className={`aspect-square flex items-center justify-center text-xs rounded transition ${
                  isToday
                    ? "bg-neutral-100 text-neutral-900 font-medium"
                    : isPast || isPastMonth
                    ? "bg-neutral-800/50 text-neutral-400"
                    : isFuture
                    ? "text-neutral-500"
                    : "text-neutral-300"
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
      <div className="flex gap-2 items-center p-3 rounded-xl bg-neutral-900">
        <input
          value={editText}
          onChange={e => onEditTextChange(e.target.value)}
          className="flex-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm"
          autoFocus
        />
        <button
          onClick={onSaveEdit}
          className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-900"
        >
          Guardar
        </button>
        <button
          onClick={onCancelEdit}
          className="text-xs px-2 py-1 rounded-full bg-neutral-800"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/50 transition">
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition ${
          objective.completed
            ? "bg-neutral-100 border-neutral-100"
            : "border-neutral-600 hover:border-neutral-400"
        }`}
      >
        {objective.completed && (
          <span className="text-neutral-900 text-xs">✓</span>
        )}
      </button>
      <span
        className={`flex-1 text-sm ${
          objective.completed
            ? "line-through opacity-50"
            : ""
        }`}
      >
        {objective.text}
      </span>
      <div className="flex gap-1">
        <button
          onClick={onStartEdit}
          className="text-xs px-2 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 transition"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-2 py-1 rounded-full bg-neutral-800 hover:bg-red-900/30 transition"
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
