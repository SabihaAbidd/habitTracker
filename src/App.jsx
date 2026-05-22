import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Plus, Trash2, Pencil, Check, ChevronLeft,
  ChevronRight, RotateCcw, Sparkles, Zap
} from 'lucide-react'

// ─── Date Utilities ────────────────────────────────────────────────────────

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
function toKey(d) { return d.toISOString().slice(0, 10) }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function getMondayOf(d) {
  const r = new Date(d); r.setHours(0, 0, 0, 0)
  const dow = r.getDay()
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
  if (a.getMonth() === b.getMonth()) return `${mo(a)} ${a.getDate()} – ${b.getDate()}`
  return `${mo(a)} ${a.getDate()} – ${mo(b)} ${b.getDate()}`
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Storage ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'streak_v1'
function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw) } catch {}
  return { habits: [], completions: {} }
}
function saveState(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {} }

// ─── Streak Logic ──────────────────────────────────────────────────────────

function calcStreak(completions, habitId) {
  const c = completions[habitId] || {}
  const todayKey = toKey(today())
  let d = new Date(today())
  if (!c[todayKey]) d = addDays(d, -1)
  let streak = 0
  while (true) {
    const k = toKey(d)
    if (c[k]) { streak++; d = addDays(d, -1) } else break
    if (streak > 3650) break
  }
  return streak
}

// ─── Streak Badge ──────────────────────────────────────────────────────────

function StreakBadge({ count }) {
  const isHot = count >= 7
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.02]">
        <Flame size={10} className="opacity-40" />
        <span className="tabular-nums">0</span>
      </span>
    )
  }
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="relative inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{
        background: 'linear-gradient(135deg, rgba(217,255,63,0.18), rgba(184,255,92,0.08))',
        border: '1px solid rgba(217,255,63,0.35)',
        color: '#D9FF3F',
        boxShadow: isHot ? '0 0 14px rgba(217,255,63,0.35)' : '0 0 6px rgba(217,255,63,0.15)',
      }}
    >
      <motion.span
        animate={isHot ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.6 }}
      >
        <Flame size={10} fill="#D9FF3F" />
      </motion.span>
      <span className="tabular-nums">{count}</span>
    </motion.span>
  )
}

// ─── Check Cell ────────────────────────────────────────────────────────────

function CheckCell({ checked, onToggle, isFuture, isToday, habitName, dateKey }) {
  return (
    <motion.button
      whileHover={!isFuture ? { scale: 1.12 } : {}}
      whileTap={!isFuture ? { scale: 0.88 } : {}}
      onClick={!isFuture ? onToggle : undefined}
      disabled={isFuture}
      aria-label={`${checked ? 'Uncheck' : 'Check'} ${habitName} on ${dateKey}`}
      aria-pressed={checked}
      className="focus-ring relative w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors duration-200"
      style={{
        cursor: isFuture ? 'not-allowed' : 'pointer',
        opacity: isFuture ? 0.18 : 1,
      }}
    >
      <span
        className="absolute inset-0 rounded-full transition-all duration-300"
        style={{
          border: checked
            ? '1.5px solid rgba(217,255,63,0.7)'
            : `1.5px solid ${isToday ? 'rgba(217,255,63,0.35)' : 'rgba(255,255,255,0.12)'}`,
          background: checked
            ? 'radial-gradient(circle at 30% 30%, rgba(217,255,63,0.35), rgba(184,255,92,0.18) 60%, rgba(217,255,63,0.05))'
            : 'transparent',
          boxShadow: checked
            ? '0 0 16px rgba(217,255,63,0.45), inset 0 0 8px rgba(217,255,63,0.25)'
            : 'none',
        }}
      />
      <AnimatePresence mode="wait">
        {checked && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 22 }}
            className="relative"
          >
            <Check size={14} strokeWidth={3} style={{ color: '#07090D' }} />
            <span
              className="absolute inset-0 rounded-full -z-10"
              style={{ boxShadow: '0 0 10px rgba(217,255,63,0.6)' }}
            />
          </motion.span>
        )}
      </AnimatePresence>
      {checked && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ border: '1px solid rgba(217,255,63,0.5)' }}
        />
      )}
    </motion.button>
  )
}

// ─── Habit Row ─────────────────────────────────────────────────────────────

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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      <div
        className="relative flex items-center rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 transition-all duration-300 glass hover:border-white/[0.10] min-h-[56px] sm:min-h-[64px]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: '0 0 0 1px rgba(217,255,63,0.15), 0 14px 40px -10px rgba(217,255,63,0.15)' }}
        />

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-[118px] sm:w-[260px]">
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
              className="focus-ring flex-1 bg-white/5 border border-lime/40 rounded-xl px-3 py-1.5 text-sm text-primary outline-none"
              maxLength={60}
            />
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] sm:text-[15px] text-primary truncate font-medium tracking-tight" title={habit.name}>
                    {habit.name}
                  </span>
                </div>
                <div className="mt-1">
                  <StreakBadge count={streak} />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setEditVal(habit.name); setEditing(true) }}
                  aria-label={`Rename ${habit.name}`}
                  className="focus-ring w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-lime hover:bg-white/5 transition-colors"
                >
                  <Pencil size={12} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(habit.id)}
                  aria-label={`Delete ${habit.name}`}
                  className="focus-ring w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 size={12} />
                </motion.button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-1 ml-1 sm:ml-2">
          {weekDays.map((day) => {
            const dk = toKey(day)
            const isToday = dk === todayKey
            const isFuture = day > today()
            const checked = !!(completions[habit.id]?.[dk])
            return (
              <div
                key={dk}
                className="flex items-center justify-center min-w-0"
                style={{ flex: 1, height: 36 }}
              >
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
      </div>
    </motion.div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center justify-center py-14 sm:py-24 px-6 text-center overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute top-8 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full ambient-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(217,255,63,0.18) 0%, rgba(217,255,63,0) 60%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        className="float-y relative mb-7 w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(217,255,63,0.18), rgba(184,255,92,0.08))',
          border: '1px solid rgba(217,255,63,0.35)',
          boxShadow: '0 0 50px rgba(217,255,63,0.30), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <Sparkles size={30} style={{ color: '#D9FF3F' }} />
        <span
          aria-hidden
          className="absolute inset-0 rounded-3xl pulse-glow"
          style={{ pointerEvents: 'none' }}
        />
      </motion.div>

      <h3 className="relative text-2xl sm:text-3xl font-semibold tracking-tight text-primary mb-3">
        Build momentum.
      </h3>
      <p className="relative text-sm sm:text-[15px] text-muted max-w-sm leading-relaxed">
        Small actions repeated daily become transformation.
      </p>
      <p className="relative text-xs text-muted/60 mt-4">
        Add your first habit below to begin.
      </p>
    </motion.div>
  )
}

// ─── Add Habit Form ────────────────────────────────────────────────────────

function AddHabitForm({ onAdd, existingNames }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
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
    <div className="mt-6">
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 1px rgba(217,255,63,0.55), 0 0 40px -8px rgba(217,255,63,0.45)'
            : '0 0 0 1px rgba(255,255,255,0.06)',
        }}
        transition={{ duration: 0.25 }}
        className="flex gap-2 items-center rounded-full p-1.5 glass"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); if (error) setError('') }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Add a habit…"
          maxLength={60}
          className="focus:outline-none flex-1 min-w-0 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm text-primary placeholder:text-muted/80"
          aria-label="New habit name"
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          className="focus-ring flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-sm font-semibold shrink-0 transition-all"
          style={{
            background: 'linear-gradient(135deg, #D9FF3F 0%, #B8FF5C 100%)',
            color: '#07090D',
            boxShadow: '0 0 24px rgba(217,255,63,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
          aria-label="Add habit"
        >
          <Plus size={15} strokeWidth={3} />
          <span className="hidden sm:inline">Add</span>
        </motion.button>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-danger mt-2 px-3"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Week Header (day pills) ───────────────────────────────────────────────

function WeekHeader({ weekDays, todayKey }) {
  return (
    <div className="flex items-center px-3 sm:px-5 mb-2">
      <div className="shrink-0 w-[118px] sm:w-[260px]">
        <span className="text-[10px] font-medium text-muted/70 uppercase tracking-[0.18em]">Habit</span>
      </div>
      <div className="flex flex-1 ml-1 sm:ml-2">
        {weekDays.map((day, i) => {
          const dk = toKey(day)
          const isToday = dk === todayKey
          const isFuture = day > today()
          return (
            <div
              key={dk}
              className="relative flex flex-col items-center justify-center min-w-0"
              style={{ flex: 1 }}
            >
              <span
                className="text-[10px] font-medium uppercase tracking-[0.18em] mb-1.5"
                style={{
                  color: isToday ? '#D9FF3F' : isFuture ? 'rgba(139,147,167,0.4)' : 'rgba(139,147,167,0.7)',
                }}
              >
                {DAY_LABELS[i]}
              </span>
              <div className="relative">
                {isToday && (
                  <span
                    aria-hidden
                    className="absolute inset-0 -m-2 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(217,255,63,0.45), transparent 70%)',
                      filter: 'blur(8px)',
                    }}
                  />
                )}
                <div
                  className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-semibold tabular-nums"
                  style={
                    isToday
                      ? {
                          background: 'linear-gradient(135deg, #D9FF3F, #B8FF5C)',
                          color: '#07090D',
                          boxShadow: '0 0 14px rgba(217,255,63,0.55)',
                        }
                      : {
                          color: isFuture ? 'rgba(139,147,167,0.4)' : '#C9D0DE',
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }
                  }
                >
                  {day.getDate()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
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

  const { totalChecks, possible, pct, bestStreak } = useMemo(() => {
    const totalChecks = state.habits.reduce((acc, h) =>
      acc + weekDays.filter(d => state.completions[h.id]?.[toKey(d)]).length, 0)
    const possible = state.habits.length * weekDays.filter(d => d <= today()).length
    const pct = possible > 0 ? Math.round(totalChecks / possible * 100) : 0
    const bestStreak = state.habits.length
      ? Math.max(...state.habits.map(h => calcStreak(state.completions, h.id)))
      : 0
    return { totalChecks, possible, pct, bestStreak }
  }, [state, weekDays])

  return (
    <div className="relative min-h-screen font-sans isolate">
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(217,255,63,0.10) 0%, rgba(217,255,63,0) 60%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3 sm:pt-5">
        <div className="max-w-5xl mx-auto">
          <div className="glass-strong rounded-2xl px-2.5 sm:px-5 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center"
                   style={{
                     background: 'linear-gradient(135deg, rgba(217,255,63,0.2), rgba(184,255,92,0.05))',
                     border: '1px solid rgba(217,255,63,0.35)',
                     boxShadow: '0 0 14px rgba(217,255,63,0.35)',
                   }}>
                <Zap size={12} fill="#D9FF3F" stroke="#D9FF3F" />
              </div>
              <h1 className="font-display text-lg sm:text-xl italic tracking-tight leading-none">
                <span className="text-primary">streak</span>
                <span className="not-italic font-medium text-gradient-lime">.</span>
              </h1>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setWeekOffset(o => o - 1)}
                aria-label="Previous week"
                className="focus-ring w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-secondary hover:text-lime transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <ChevronLeft size={14} />
              </motion.button>

              <span className="text-[11.5px] sm:text-sm font-medium text-primary min-w-[88px] sm:min-w-[140px] text-center tabular-nums tracking-tight px-1">
                {formatWeekRange(weekDays)}
              </span>

              <motion.button
                whileHover={!(weekOffset >= 0) ? { scale: 1.08 } : {}}
                whileTap={!(weekOffset >= 0) ? { scale: 0.9 } : {}}
                onClick={() => setWeekOffset(o => o + 1)}
                disabled={weekOffset >= 0}
                aria-label="Next week"
                className="focus-ring w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-secondary hover:text-lime transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <ChevronRight size={14} />
              </motion.button>
            </div>

            <div className="shrink-0 w-[28px] sm:w-[110px] flex justify-end">
              <AnimatePresence>
                {!isCurrent && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setWeekOffset(0)}
                    className="focus-ring flex items-center justify-center gap-1.5 w-7 h-7 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full text-[11px] font-medium transition-colors"
                    style={{
                      background: 'rgba(217,255,63,0.10)',
                      border: '1px solid rgba(217,255,63,0.30)',
                      color: '#D9FF3F',
                    }}
                  >
                    <RotateCcw size={11} />
                    <span className="hidden sm:inline">Today</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 pt-6 sm:pt-12 pb-16">

        <section className="mb-6 sm:mb-10 px-1 sm:px-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted/80 mb-2">
              {isCurrent ? 'This week' : 'Reviewing'}
            </p>
            <h2 className="font-display text-[26px] sm:text-5xl leading-[1.1] tracking-tight text-primary">
              Stay <span className="italic text-gradient-lime">consistent</span>,
              <br /> compound the gains.
            </h2>
          </motion.div>

          {state.habits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-6 flex items-center gap-2 sm:gap-3 flex-wrap"
            >
              <StatPill label="Checks" value={totalChecks} />
              {possible > 0 && (
                <StatPill label="Completion" value={`${pct}%`} accent={pct >= 70} />
              )}
              {bestStreak > 1 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(217,255,63,0.18), rgba(184,255,92,0.06))',
                    border: '1px solid rgba(217,255,63,0.35)',
                    color: '#D9FF3F',
                    boxShadow: '0 0 18px rgba(217,255,63,0.25)',
                  }}
                >
                  <Flame size={12} fill="#D9FF3F" />
                  <span className="tabular-nums">{bestStreak}-day best</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </section>

        <section className="relative">
          <div>
            <div>
              <WeekHeader weekDays={weekDays} todayKey={todayKey} />

              <div className="flex flex-col gap-2.5">
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
              </div>

              <AddHabitForm onAdd={addHabit} existingNames={existingNames} />
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

function StatPill({ label, value, accent = false }) {
  return (
    <div
      className="flex items-baseline gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: accent ? '#D9FF3F' : '#C9D0DE',
      }}
    >
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted/80 uppercase tracking-[0.14em] text-[10px]">{label}</span>
    </div>
  )
}
