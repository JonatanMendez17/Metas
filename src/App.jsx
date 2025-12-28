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
  salud: "Salud",
  creativa: "Creativa"
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
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArea, setEditArea] = useState("personal");
  
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
    if (!title.trim()) return;
    setGoals([
      ...goals,
      {
        id: Date.now(),
        title,
        area,
        status: "active",
        startMonth: selectedMonth,
        activeMonths: [selectedMonth],
        year
      }
    ]);
    setTitle("");
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
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditArea(goal.area);
  }

  function saveEdit() {
    if (!editTitle.trim()) return;
    setGoals(goals.map(g =>
      g.id === editingId
        ? { ...g, title: editTitle.trim(), area: editArea }
        : g
    ));
    setEditingId(null);
    setEditTitle("");
    setEditArea("personal");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditArea("personal");
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

  const visibleGoals = goals.filter(
    g => g.year === year && g.activeMonths.includes(selectedMonth)
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Año */}
        <div className="text-sm opacity-60 mb-6">AÑO {year}</div>

        {/* Layout con dos columnas */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Columna izquierda - Calendario */}
          <div className="flex-shrink-0 w-full lg:w-64">
            <Calendar 
              year={year}
              month={selectedMonth}
              currentDate={today}
            />
          </div>

          {/* Columna derecha - Contenido principal */}
          <div className="flex-1 min-w-0 w-full">
            {/* Objetivos principales del año */}
            <section className="mb-10 pb-8 border-b border-neutral-800">
          <h2 className="text-xl font-light mb-4">Objetivos principales del año</h2>
          
          {/* Agregar objetivo */}
          <div className="flex gap-2 mb-4">
            <input
              value={newObjective}
              onChange={e => setNewObjective(e.target.value)}
              onKeyPress={e => e.key === "Enter" && addYearlyObjective()}
              placeholder="Agregar objetivo principal…"
              className="flex-1 rounded-xl bg-neutral-900 px-4 py-2 text-sm"
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
        </section>

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
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 12 }).map((_, i) => {
              const quarter = getQuarter(i);
              const quarterColor = QUARTER_COLORS[quarter];
              const isSelected = i === selectedMonth;
              const isFirstInQuarter = i % 3 === 0;
              
              return (
                <div key={i} className="flex items-center">
                  {isFirstInQuarter && i > 0 && (
                    <div className="w-px h-8 bg-neutral-700 mx-1" />
                  )}
                  <button
                    onClick={() => setSelectedMonth(i)}
                    className={`px-3 py-1 rounded-full text-sm transition relative ${
                      isSelected
                        ? "bg-neutral-100 text-neutral-900"
                        : `bg-neutral-800 text-neutral-400 border ${quarterColor.border}`
                    }`}
                    title={`Trimestre ${quarter}`}
                  >
                    {new Date(0, i).toLocaleString("es-ES", { month: "short" })}
                    {!isSelected && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${quarterColor.bg} border ${quarterColor.border}`} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Indicador de trimestre actual */}
          <div className="mt-3 flex items-center gap-2 text-xs opacity-60">
            <span>Trimestre actual:</span>
            <span className={`px-2 py-0.5 rounded-full border ${QUARTER_COLORS[getQuarter(selectedMonth)].border} ${QUARTER_COLORS[getQuarter(selectedMonth)].bg}`}>
              {QUARTER_COLORS[getQuarter(selectedMonth)].label}
            </span>
          </div>
        </div>

        {/* Crear meta */}
        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nueva meta…"
            className="flex-1 rounded-xl bg-neutral-900 px-4 py-3"
          />
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            className="rounded-xl bg-neutral-900 px-4 py-3"
          >
            {Object.entries(AREAS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            onClick={addGoal}
            className="rounded-xl bg-neutral-100 text-neutral-900 px-5 py-3"
          >
            Agregar
          </button>
        </div>

        {/* Metas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleGoals.length === 0 && (
            <div className="opacity-50">Este mes también cuenta.</div>
          )}
          {visibleGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isEditing={editingId === goal.id}
              editTitle={editTitle}
              editArea={editArea}
              onEditTitleChange={setEditTitle}
              onEditAreaChange={setEditArea}
              onStartEdit={() => startEdit(goal)}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onDelete={() => deleteGoal(goal.id)}
              onReplan={() => replanGoal(goal.id)}
              onComplete={() => completeGoal(goal.id)}
            />
          ))}
        </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoalCard({ 
  goal, 
  isEditing,
  editTitle,
  editArea,
  onEditTitleChange,
  onEditAreaChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReplan, 
  onComplete 
}) {
  if (isEditing) {
    return (
      <div className="rounded-2xl bg-neutral-900 p-6 shadow-sm">
        <input
          value={editTitle}
          onChange={e => onEditTitleChange(e.target.value)}
          placeholder="Título de la meta…"
          className="w-full rounded-xl bg-neutral-800 px-4 py-2 mb-3 text-lg font-medium"
          autoFocus
        />
        <select
          value={editArea}
          onChange={e => onEditAreaChange(e.target.value)}
          className="w-full rounded-xl bg-neutral-800 px-4 py-2 mb-4"
        >
          {Object.entries(AREAS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={onSaveEdit}
            className="text-xs px-3 py-1 rounded-full bg-neutral-100 text-neutral-900"
          >
            Guardar
          </button>
          <button
            onClick={onCancelEdit}
            className="text-xs px-3 py-1 rounded-full bg-neutral-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-neutral-900 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium flex-1">{goal.title}</h3>
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

      <div className="flex gap-2 text-xs opacity-70 mb-4">
        <span>{AREAS[goal.area]}</span>
        <span>•</span>
        <span>{goal.status}</span>
      </div>

      {/* Huella de tiempo */}
      <div className="flex gap-1 mb-4">
        {goal.activeMonths.map((_, i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
        ))}
      </div>

      {/* Acciones */}
      {goal.status !== "done" && (
        <div className="flex gap-2">
          <button
            onClick={onReplan}
            className="text-xs px-3 py-1 rounded-full bg-neutral-800"
          >
            Pasar al mes siguiente
          </button>
          <button
            onClick={onComplete}
            className="text-xs px-3 py-1 rounded-full bg-neutral-700"
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
  
  return (
    <div className="lg:sticky lg:top-10">
      <h3 className="text-xs font-medium mb-3 opacity-70 uppercase tracking-wide">
        {new Date(year, month).toLocaleString("es-ES", { month: "long" })}
      </h3>
      <div className="rounded-xl bg-neutral-900 p-3 max-w-xs mx-auto lg:mx-0">
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
            
            return (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-xs rounded transition ${
                  isToday
                    ? "bg-neutral-100 text-neutral-900 font-medium"
                    : isPast
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
