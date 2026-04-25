/**
 * PHASE PROGRESS INDICATOR
 * Subtle phase indicator — shows current phase and quiet progress within it.
 * No countdown to next phase. No "X more to unlock." Just: where you are.
 * Behavioral, not time-based. Moves when write-back detects progress.
 */

import { useApp } from '../context/AppContext'

const PHASE_CONFIG = {
  discovery: {
    label: 'Discovery',
    description: 'Getting familiar with your patterns',
    maxSessions: 3,
    index: 0,
  },
  awareness: {
    label: 'Awareness',
    description: 'Noticing the pattern',
    maxSessions: 10,
    index: 1,
  },
  interruption: {
    label: 'Interruption',
    description: 'Catching it in real time',
    maxSessions: 15,
    index: 2,
  },
  replacement: {
    label: 'Replacement',
    description: 'Choosing differently',
    maxSessions: 25,
    index: 3,
  },
  consolidation: {
    label: 'Consolidation',
    description: 'Holding it under pressure',
    maxSessions: 20,
    index: 4,
  },
  maintenance: {
    label: 'Maintenance',
    description: 'Earned security',
    maxSessions: 999, // open-ended — no graduation from maintenance
    index: 5,
  },
}

const PHASES = ['discovery', 'awareness', 'interruption', 'replacement', 'consolidation', 'maintenance']

// Maintenance mode gets a different, quieter card
function MaintenanceCard() {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-xs uppercase tracking-widest">Where you are</p>
        <span className="text-xs font-medium" style={{ color: sp }}>Maintenance</span>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed">
        Earned security. Check in when something stirs.
      </p>
    </div>
  )
}

export default function PhaseProgressIndicator({ currentPhase, phaseSessions }) {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  const config = PHASE_CONFIG[currentPhase] || PHASE_CONFIG.discovery
  const phaseIndex = config.index

  // Maintenance has its own simplified card
  if (currentPhase === 'maintenance') return <MaintenanceCard />

  // Fill within current phase — capped at 90% so it never "looks done"
  const fillPercent = Math.min(90, Math.round((phaseSessions / config.maxSessions) * 100))

  // Show at most 3 phases at a time, centred on current phase
  const startIdx = Math.max(0, Math.min(phaseIndex - 1, PHASES.length - 3))
  const visiblePhases = PHASES.slice(startIdx, startIdx + 3)

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-xs uppercase tracking-widest">Where you are</p>
      </div>

      {/* Phase labels — only show surrounding phases, not full roadmap */}
      <div className="flex items-center gap-1 text-xs overflow-hidden">
        {visiblePhases.map((phase, i) => {
          const absoluteIndex = PHASE_CONFIG[phase].index
          const isActive = absoluteIndex === phaseIndex
          const isPast = absoluteIndex < phaseIndex
          return (
            <div key={phase} className="flex items-center gap-1 min-w-0">
              <span
                className={`truncate ${isPast ? 'text-text-muted' : !isActive ? 'text-surface-border' : 'font-medium'}`}
                style={isActive ? { color: sp } : {}}
              >
                {PHASE_CONFIG[phase].label}
              </span>
              {i < visiblePhases.length - 1 && (
                <span className="text-surface-border mx-0.5 flex-shrink-0">→</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar — within current phase only */}
      <div className="space-y-1">
        <div className="h-0.5 bg-surface-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${fillPercent}%`, background: `${sp}66` }}
          />
        </div>
        <p className="text-text-muted text-xs">{config.description}</p>
      </div>
    </div>
  )
}
