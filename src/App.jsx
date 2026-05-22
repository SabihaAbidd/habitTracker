import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Plus, Trash2, Pencil, Check, ChevronLeft,
  ChevronRight, RotateCcw, Sparkles
} from 'lucide-react'

// ─── Date Utilities ────────────────────────────────────────────────────────

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function toKey(d) {
  return d.toISOString().slice(0, 10)
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function getMondayOf(d) {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  const dow = r.getDay() // 0=Sun
  r.setDate(r.getDate() - (dow === 0 ? 6 : dow - 1))
  return r
}

function getWeekDays(offsetWeeks) {
  const mon = addDays(getMondayOf(today()), offsetWeeks * 7)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

function formatWeekRange(days) {
  const a = days[0], b = days[6]
  const mo = d => d.toLocaleString('default', { month: 'short' })
  if (a.getMonth() === b.getMonth())
    return `${mo(a)} ${a.getDate()} – ${b.getDate()}`
  return `${mo(a)} ${a.getDate()} – ${mo(b)} ${b.getDate()}`
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Storage ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'streak_v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { habits: [], completions: {} }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

// ─── Streak Logic ──────────────────────────────────────────────────────────

function calcStreak(completions, habitId) {
  const c = completions[habitId] || {}
  const todayKey = toKey(today())
  let d = new Date(today())
  // Grace: if today not checked, start counting from yesterday
  if (!c[todayKey]) d = addDays(d, -1)
  let streak = 0
  while (true) {
    const k = toKey(d)
    if (c[k]) { streak++; d = addDays(d, -1) }
    else break
    if (streak > 3650) break // safety
  }
  return streak
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StreakBadge({ count }) {
  if (count === 0) return (
    <span className="flex items-center gap-1 text-xs text-muted px-2 py-0.5 rounded-full border border-border min-w-[46px] justify-center">
      <Flame size={11} className="opacity-40" />
      <span>0</span>
    </span>
  )
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full min-w-[46px] justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(255,184,106,0.15), rgba(255,138,76,0.1))',
        border: '1px solid rgba(255,184,106,0.3)',
        color: '#FFB86A',
      }}
    >
      <Flame size={11} />
      <span>{count}</span>
    </motion.span>
  )
}

function CheckCell({ checked, onToggle, isFuture, isToday, habitName, dateKey }) {
  return (
    <div className={`flex items-center justify-center h-full ${isToday ? 'relative' : ''}`}>
      <motion.button
        whileHover={!isFuture ? { scale: 1.08 } : {}}
        whileTap={!isFuture ? { scale: 0.92 } : {}}
        onClick={!isFuture ? onToggle : undefined}
        disabled={isFuture}
        aria-label={`${checked ? 'Uncheck' : 'Check'} ${habitName} on ${dateKey}`}
        aria-pressed={checked}
        className={[
          'focus-ring w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
          isFuture
            ? 'border border-border/30 cursor-not-allowed opacity-25'
            : checked
              ? 'border border-success/40 bg-success/10 cursor-pointer'
              : 'border border-border hover:border-amber/50 hover:bg-elevated cursor-pointer',
        ].join(' ')}
      >
        <AnimatePresence mode="wait">
          {checked && (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check size={14} className="text-success" strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

function HabitRow({ habit, completions, weekDays, todayKey, onToggle, onDelete, onRename, index }) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(habit.name)
  const inputRef = useRef(null)
  const streak = calcStreak(completions, habit.id)

  function commitRename() {
    const trimmed = editVal.trim()
    if (trimmed && trimmed !== habit.name) onRename(habit.id, trimmed)
    else setEditVal(habit.name)
    setEditing(false)
  }

  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select() }
  }, [editing])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group flex items-center border-b border-border/50 last:border-b-0 hover:bg-elevated/40 transition-colors duration-100"
      style={{ minHeight: '56px' }}
    >
      {/* Habit name + streak */}
      <div className="flex items-center gap-2 px-4 shrink-0" style={{ width: 220, minWidth: 180 }}>
        {editing ? (
          <input
            ref={inputRef}
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setEditVal(habit.name); setEditing(false) }
            }}
            className="focus-ring flex-1 bg-elevated border border-amber/40 rounded-lg px-3 py-1.5 text-sm text-primary outline-none"
            maxLength={60}
          />
        ) : (
          <>
            <span
              className="text-sm text-primary truncate flex-1 font-medium leading-tight"
              title={habit.name}
            >
              {habit.name}
            </span>
            {/* Actions — visible on row hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => { setEditVal(habit.name); setEditing(true) }}
                aria-label={`Rename ${habit.name}`}
                className="focus-ring w-6 h-6 flex items-center justify-center rounded-md text-muted hover:text-secondary hover:bg-elevated transition-colors"
              >
                <Pencil size={12} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => onDelete(habit.id)}
                aria-label={`Delete ${habit.name}`}
                className="focus-ring w-6 h-6 flex items-center justify-center rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={12} />
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* Streak badge */}
      <div className="flex items-center justify-center shrink-0 px-2" style={{ width: 64 }}>
        <StreakBadge count={streak} />
      </div>

      {/* 7 day cells */}
      <div className="flex flex-1">
        {weekDays.map((day, i) => {
          const dk = toKey(day)
          const isToday = dk === todayKey
          const isFuture = day > today()
          const checked = !!(completions[habit.id]?.[dk])
          return (
            <div
              key={dk}
              className={[
                'flex items-center justify-center',
                isToday
                  ? 'relative'
                  : '',
              ].join(' ')}
              style={{ flex: 1, minWidth: 40, height: 56 }}
            >
              {isToday && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,184,106,0.06) 0%, rgba(255,184,106,0.03) 100%)',
                    borderLeft: '1px solid rgba(255,184,106,0.12)',
                    borderRight: '1px solid rgba(255,184,106,0.12)',
                  }}
                />
              )}
              <CheckCell
                checked={checked}
                onToggle={() => onToggle(habit.id, dk)}
                isFuture={isFuture}
                isToday={isToday}
                habitName={habit.name}
                dateKey={dk}
              />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-6 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(255,184,106,0.12), rgba(255,138,76,0.08))', border: '1px solid rgba(255,184,106,0.2)' }}
      >
        <Sparkles size={24} style={{ color: '#FFB86A' }} />
      </motion.div>
      <h3 className="text-lg font-medium text-primary mb-2">No habits yet</h3>
      <p className="text-sm text-muted max-w-xs leading-relaxed">
        Add your first habit and start building momentum.
      </p>
    </motion.div>
  )
}

function AddHabitForm({ onAdd, existingNames }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function handleSubmit() {
    const name = value.trim()
    if (!name) { setError('Please enter a habit name.'); return }
    if (existingNames.includes(name.toLowerCase())) { setError('That habit already exists.'); return }
    onAdd(name)
    setValue('')
    setError('')
    inputRef.current?.focus()
  }

  return (
    <div className="px-4 py-4 border-t border-border/50">
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={value}
            onChange={e => { setValue(e.target.value); if (error) setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Add a habit — e.g. Read 30 min, Exercise…"
            maxLength={60}
            className="focus-ring w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-muted outline-none transition-colors focus:border-amber/50"
            aria-label="New habit name"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          className="focus-ring flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-bg transition-all duration-150 shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFB86A, #FF8A4C)' }}
          aria-label="Add habit"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Add</span>
        </motion.button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-danger mt-2 px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState(loadState)
  const [weekOffset, setWeekOffset] = useState(0)
  const todayKey = toKey(today())
  const weekDays = getWeekDays(weekOffset)
  const isCurrent = weekOffset === 0

  // persist on every change
  useEffect(() => { saveState(state) }, [state])

  const toggleCompletion = useCallback((habitId, dateKey) => {
    setState(prev => {
      const c = { ...(prev.completions[habitId] || {}) }
      if (c[dateKey]) delete c[dateKey]
      else c[dateKey] = true
      return { ...prev, completions: { ...prev.completions, [habitId]: c } }
    })
  }, [])

  const addHabit = useCallback((name) => {
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, {
        id: 'h_' + Date.now() + '_' + Math.random().toString(36).slice(2),
        name,
        createdAt: new Date().toISOString(),
      }]
    }))
  }, [])

  const deleteHabit = useCallback((habitId) => {
    if (!confirm('Delete this habit and all its history?')) return
    setState(prev => {
      const { [habitId]: _, ...rest } = prev.completions
      return { ...prev, habits: prev.habits.filter(h => h.id !== habitId), completions: rest }
    })
  }, [])

  const renameHabit = useCallback((habitId, newName) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === habitId ? { ...h, name: newName } : h)
    }))
  }, [])

  const existingNames = state.habits.map(h => h.name.toLowerCase())

  // week summary
  const totalChecks = state.habits.reduce((acc, h) =>
    acc + weekDays.filter(d => state.completions[h.id]?.[toKey(d)]).length, 0)
  const possible = state.habits.length * weekDays.filter(d => d <= today()).length
  const pct = possible > 0 ? Math.round(totalChecks / possible * 100) : 0

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Top nav */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <h1 className="font-display text-xl font-normal italic tracking-tight shrink-0" style={{ color: '#FFB86A' }}>
            streak<span className="not-italic font-medium" style={{ color: '#FF8A4C' }}>.</span>
          </h1>

          {/* Week nav */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setWeekOffset(o => o - 1)}
              aria-label="Previous week"
              className="focus-ring w-8 h-8 flex items-center justify-center rounded-lg border border-border text-secondary hover:text-primary hover:border-border/80 hover:bg-elevated transition-colors"
            >
              <ChevronLeft size={16} />
            </motion.button>

            <span className="text-sm font-medium text-primary min-w-[140px] text-center tabular-nums">
              {formatWeekRange(weekDays)}
            </span>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setWeekOffset(o => o + 1)}
              disabled={weekOffset >= 0}
              aria-label="Next week"
              className="focus-ring w-8 h-8 flex items-center justify-center rounded-lg border border-border text-secondary hover:text-primary hover:border-border/80 hover:bg-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>

          {/* Back to today */}
          <AnimatePresence>
            {!isCurrent ? (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWeekOffset(0)}
                className="focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-secondary hover:text-primary hover:border-amber/30 hover:bg-elevated transition-colors shrink-0"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">This week</span>
              </motion.button>
            ) : (
              <div style={{ width: 90 }} /> /* spacer to keep layout stable */
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Summary row */}
        {state.habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-5 flex-wrap"
          >
            <span className="text-xs text-muted font-medium uppercase tracking-wider">This week</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full border border-border text-secondary bg-card">
                {totalChecks} check{totalChecks !== 1 ? 's' : ''}
              </span>
              {possible > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-border text-secondary bg-card">
                  {pct}% completion
                </span>
              )}
              {(() => {
                const best = Math.max(...state.habits.map(h => calcStreak(state.completions, h.id)))
                return best > 1 ? (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                    style={{ background: 'rgba(255,184,106,0.1)', border: '1px solid rgba(255,184,106,0.25)', color: '#FFB86A' }}
                  >
                    <Flame size={11} /> {best}-day streak
                  </span>
                ) : null
              })()}
            </div>
          </motion.div>
        )}

        {/* Grid card */}
        <div
          className="rounded-2xl border border-border overflow-hidden"
          style={{ background: '#17181C' }}
        >
          {/* Scrollable wrapper for mobile */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: 560 }}>

              {/* Column headers */}
              <div className="flex border-b border-border/60" style={{ background: '#1D1F24' }}>
                {/* Name column header */}
                <div className="flex items-center px-4 shrink-0" style={{ width: 220, minWidth: 180, height: 48 }}>
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Habit</span>
                </div>
                {/* Streak column header */}
                <div className="flex items-center justify-center shrink-0 px-2" style={{ width: 64, height: 48 }}>
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Streak</span>
                </div>
                {/* Day headers */}
                {weekDays.map((day, i) => {
                  const dk = toKey(day)
                  const isToday = dk === todayKey
                  const isFuture = day > today()
                  return (
                    <div
                      key={dk}
                      className="flex flex-col items-center justify-center relative"
                      style={{
                        flex: 1,
                        minWidth: 40,
                        height: 48,
                        ...(isToday ? {
                          background: 'linear-gradient(180deg, rgba(255,184,106,0.08) 0%, rgba(255,184,106,0.04) 100%)',
                          borderLeft: '1px solid rgba(255,184,106,0.14)',
                          borderRight: '1px solid rgba(255,184,106,0.14)',
                        } : {})
                      }}
                    >
                      <span
                        className={[
                          'text-xs font-medium mb-0.5',
                          isToday ? '' : isFuture ? 'text-muted/50' : 'text-muted'
                        ].join(' ')}
                        style={isToday ? { color: '#FFB86A' } : {}}
                      >
                        {DAY_LABELS[i]}
                      </span>
                      <div
                        className={[
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold tabular-nums',
                          isToday ? '' : isFuture ? 'text-muted/40' : 'text-secondary'
                        ].join(' ')}
                        style={isToday ? {
                          background: 'linear-gradient(135deg, #FFB86A, #FF8A4C)',
                          color: '#0F0F11',
                          fontSize: '0.7rem',
                        } : {}}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Habit rows */}
              <AnimatePresence initial={false}>
                {state.habits.length === 0 ? (
                  <EmptyState key="empty" />
                ) : (
                  state.habits.map((habit, i) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      completions={state.completions}
                      weekDays={weekDays}
                      todayKey={todayKey}
                      onToggle={toggleCompletion}
                      onDelete={deleteHabit}
                      onRename={renameHabit}
                      index={i}
                    />
                  ))
                )}
              </AnimatePresence>

              {/* Add habit form */}
              <AddHabitForm onAdd={addHabit} existingNames={existingNames} />

            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted/40 mt-8">
          Data saved locally in your browser.
        </p>
      </main>
    </div>
  )
}
