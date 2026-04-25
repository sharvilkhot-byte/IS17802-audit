/**
 * UNCLINQ DESIGN SYSTEM — LIVE STYLE GUIDE
 *
 * Route: /style-guide  (add to App.jsx router for dev use)
 *
 * Visual reference for every token and component in the design system.
 * Shows colors, typography, spacing, shadows, and all component variants.
 */

import { color, shadow, radius, type, gradient, space } from './tokens'
import {
  Spinner, LoadingScreen, Card, CardInteractive, ActionCard,
  MiniCard, MiniCardHeader, SectionLabel, Label, CardTitle,
  HeroHeading, SerifQuote, QuotePull, Badge, Tag, Divider,
  ButtonPrimary, ButtonSecondary, ButtonGhost, TextLink, CTAButton,
  Input, Textarea, ProgressBar, Skeleton, EmptyState,
  PillFilter, DotSeparator, PageShell,
} from './components'
import { BookOpen, Wind, Zap, Sparkles } from 'lucide-react'
import { useState } from 'react'

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <p className="label" style={{ color: color.terra.DEFAULT }}>{title}</p>
        <div className="flex-1 h-px" style={{ background: color.border.DEFAULT }} />
      </div>
      {children}
    </section>
  )
}

function Row({ label, children, gap = '12px' }) {
  return (
    <div className="mb-4">
      {label && <p className="t-caption mb-2">{label}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'flex-start' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Color swatch ─────────────────────────────────────────────────────────────

function Swatch({ hex, name, light = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '72px' }}>
      <div
        style={{
          width: '72px',
          height: '56px',
          borderRadius: '10px',
          background: hex,
          border: light ? `1px solid ${color.border.DEFAULT}` : 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      />
      <p style={{ fontSize: '10px', fontWeight: 600, color: color.text.muted }}>{name}</p>
      <p style={{ fontSize: '9px', color: color.text.muted, fontFamily: 'monospace' }}>{hex}</p>
    </div>
  )
}

// ─── Typography row ───────────────────────────────────────────────────────────

function TypeRow({ label, element }) {
  return (
    <div className="mb-5 pb-5 border-b" style={{ borderColor: color.border.DEFAULT }}>
      <p className="t-caption mb-2" style={{ color: color.text.muted }}>{label}</p>
      {element}
    </div>
  )
}

// ─── Shadow card ──────────────────────────────────────────────────────────────

function ShadowCard({ name, shadowValue }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '140px' }}>
      <div
        style={{
          width: '140px',
          height: '80px',
          borderRadius: '12px',
          background: color.surface.card,
          boxShadow: shadowValue,
          border: `1px solid ${color.border.DEFAULT}`,
        }}
      />
      <p style={{ fontSize: '11px', fontWeight: 600, color: color.text.muted }}>{name}</p>
    </div>
  )
}

// ─── Main style guide ─────────────────────────────────────────────────────────

export default function StyleGuide() {
  const [pillActive, setPillActive] = useState('all')

  return (
    <div style={{ background: color.surface.page, minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(248,241,231,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${color.border.DEFAULT}`,
        }}
      >
        <div>
          <h1 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 500, color: color.text.primary }}>
            Design System
          </h1>
          <p className="t-caption">Unclinq · Home screen design language</p>
        </div>
        <Badge>v1.0</Badge>
      </div>

      <div className="px-6 pt-8 max-w-2xl mx-auto">

        {/* ── Color ──────────────────────────────────────────────────────── */}
        <Section title="Color">

          <Row label="Surface — warm parchment">
            <Swatch hex={color.surface.page}     name="page"     light />
            <Swatch hex={color.surface.card}     name="card"     light />
            <Swatch hex={color.surface.elevated} name="elevated" light />
            <Swatch hex={color.surface.subtle}   name="subtle"   light />
            <Swatch hex={color.surface.cream}    name="cream"    light />
            <Swatch hex={color.surface.cream2}   name="cream2"   light />
            <Swatch hex={color.surface.mini}     name="mini"     light />
          </Row>

          <Row label="Terra — terracotta (primary action)">
            <Swatch hex={color.terra.DEFAULT} name="DEFAULT" />
            <Swatch hex={color.terra.hover}   name="hover"   />
            <Swatch hex={color.terra.light}   name="light"   />
            <Swatch hex={color.terra.soft}    name="soft"    />
          </Row>

          <Row label="Text hierarchy">
            <Swatch hex={color.text.primary}   name="primary"   />
            <Swatch hex={color.text.dark}      name="dark"      />
            <Swatch hex={color.text.secondary} name="secondary" />
            <Swatch hex={color.text.muted}     name="muted"     />
          </Row>

          <Row label="Sage — botanical greens">
            <Swatch hex={color.sage.DEFAULT} name="DEFAULT" />
            <Swatch hex={color.sage.light}   name="light"   />
            <Swatch hex={color.sage.dark}    name="dark"    />
          </Row>

          <Row label="Gold + Earth">
            <Swatch hex={color.gold.DEFAULT} name="gold" />
            <Swatch hex={color.earth.pot}    name="pot"  />
            <Swatch hex={color.earth.soil}   name="soil" />
          </Row>

          <Row label="States">
            <Swatch hex={color.state.stable}    name="stable"    />
            <Swatch hex={color.state.activated} name="activated" />
            <Swatch hex={color.state.crisis}    name="crisis"    />
          </Row>

          <Row label="Rescue / dark mode">
            <Swatch hex={color.rescue.bg}     name="bg"     />
            <Swatch hex={color.rescue.bgDeep} name="bgDeep" />
            <Swatch hex={color.rescue.red}    name="red"    />
            <Swatch hex={color.rescue.orange} name="orange" />
          </Row>

        </Section>

        <Divider className="mb-12" />

        {/* ── Gradients ──────────────────────────────────────────────────── */}
        <Section title="Gradients">
          {[
            { name: 'card (action card)',   value: gradient.card },
            { name: 'emora (chat bubble)',  value: gradient.emora },
            { name: 'rescueCard',           value: gradient.rescueCard },
            { name: 'heroRadial',           value: gradient.heroRadial },
          ].map(g => (
            <div key={g.name} className="mb-4">
              <p className="t-caption mb-1">{g.name}</p>
              <div style={{
                height: '56px', borderRadius: '12px',
                background: g.value,
                border: `1px solid ${color.border.DEFAULT}`,
              }} />
              <p style={{ fontSize: '10px', color: color.text.muted, fontFamily: 'monospace', marginTop: '4px' }}>
                {g.value.slice(0, 80)}…
              </p>
            </div>
          ))}
        </Section>

        <Divider className="mb-12" />

        {/* ── Typography ─────────────────────────────────────────────────── */}
        <Section title="Typography">

          <div
            className="mb-6 p-4 rounded-2xl"
            style={{ background: color.surface.mini, border: `1px solid ${color.border.DEFAULT}` }}
          >
            <p className="t-caption mb-1">Font families</p>
            <p className="font-serif text-text-primary mt-2">Newsreader — serif (headings, emotional moments)</p>
            <p className="font-sans text-text-secondary mt-1" style={{ fontSize: '14px' }}>Satoshi / Nunito — sans-serif (body, labels, UI)</p>
          </div>

          <TypeRow label=".t-display · 2rem · 800 · -0.03em" element={
            <p className="t-display">Display Heading</p>
          } />
          <TypeRow label=".t-h1 · 1.625rem · 700 · -0.025em" element={
            <p className="t-h1">Heading 1</p>
          } />
          <TypeRow label=".t-h2 · 1.25rem · 700 · -0.018em" element={
            <p className="t-h2">Heading 2</p>
          } />
          <TypeRow label=".t-h3 · 1.0625rem · 600 · -0.01em" element={
            <p className="t-h3">Heading 3</p>
          } />
          <TypeRow label="Hero greeting · 2.25rem · serif · 500 (Home.jsx)" element={
            <HeroHeading>Good morning, Sharvil.</HeroHeading>
          } />
          <TypeRow label="Card title · 1.5rem · serif · 500 (action card)" element={
            <CardTitle>Grounding the Vine</CardTitle>
          } />
          <TypeRow label=".t-body-lg · 1rem · 400 · lh 1.65" element={
            <p className="t-body-lg">Body large — supporting paragraph text. Used below card titles.</p>
          } />
          <TypeRow label=".t-body · 0.9375rem · 400 · lh 1.6" element={
            <p className="t-body">Body — standard copy. You're building something real here.</p>
          } />
          <TypeRow label=".t-body-sm · 0.875rem · 400" element={
            <p className="t-body-sm">Body small — secondary info, timestamps, session details.</p>
          } />
          <TypeRow label=".t-caption · 0.75rem · 500" element={
            <p className="t-caption">Caption — supplementary info, read times, metadata.</p>
          } />
          <TypeRow label=".label · 0.6875rem · 700 · UPPERCASE · 0.1em tracking" element={
            <p className="label">Section Label</p>
          } />
          <TypeRow label="SectionLabel component · 10px ALL CAPS (mini cards)" element={
            <SectionLabel>Last Entry</SectionLabel>
          } />
          <TypeRow label="Serif italic quote" element={
            <SerifQuote>"You keep reaching, then pulling back — not because you don't care, but because caring feels dangerous."</SerifQuote>
          } />
        </Section>

        <Divider className="mb-12" />

        {/* ── Buttons ────────────────────────────────────────────────────── */}
        <Section title="Buttons">
          <Row label="ButtonPrimary (.btn-primary) — terracotta">
            <ButtonPrimary>Begin Reflection</ButtonPrimary>
            <ButtonPrimary disabled>Disabled</ButtonPrimary>
          </Row>
          <Row label="ButtonSecondary (.btn-secondary) — warm border">
            <ButtonSecondary>Log out for now</ButtonSecondary>
            <ButtonSecondary disabled>Disabled</ButtonSecondary>
          </Row>
          <Row label="ButtonGhost (.btn-ghost) — text only">
            <ButtonGhost>Not today</ButtonGhost>
          </Row>
          <Row label="TextLink — terracotta text, hover underline">
            <TextLink>See your report →</TextLink>
            <TextLink>Try again</TextLink>
          </Row>
          <Row label="CTAButton — full-width inside ActionCard (with arrow)">
            <CTAButton>Begin Reflection</CTAButton>
          </Row>
        </Section>

        <Divider className="mb-12" />

        {/* ── Cards ──────────────────────────────────────────────────────── */}
        <Section title="Cards">

          <div className="mb-6">
            <p className="t-caption mb-3">ActionCard — hero card on home screen</p>
            <ActionCard
              tag="Current Practice"
              icon={<Wind size={20} style={{ color: color.terra.DEFAULT, opacity: 0.8 }} strokeWidth={1.5} />}
              title="Grounding the Vine"
              body="Focus on three steady breaths. Your garden is resilient, even when the wind blows."
              cta={<CTAButton>Begin Reflection</CTAButton>}
            />
          </div>

          <div className="mb-6">
            <p className="t-caption mb-3">Card (.card) — settings sections, insight bodies</p>
            <Card className="space-y-3">
              <Label>Your pattern</Label>
              <p className="t-h3" style={{ color: color.terra.DEFAULT }}>Anxious</p>
              <p className="t-caption">Updates automatically as Emora learns your patterns.</p>
            </Card>
          </div>

          <div className="mb-6">
            <p className="t-caption mb-3">CardInteractive (.card-interactive) — clickable cards</p>
            <CardInteractive onClick={() => {}}>
              <Label>Pattern Report</Label>
              <SerifQuote className="mt-2">"You keep reaching, then pulling back."</SerifQuote>
              <TextLink className="mt-3 block">See your report →</TextLink>
            </CardInteractive>
          </div>

          <div className="mb-6">
            <p className="t-caption mb-3">MiniCard — 2-column stat cards</p>
            <div className="grid grid-cols-2 gap-4">
              <MiniCard>
                <MiniCardHeader
                  icon={<BookOpen size={16} style={{ color: color.terra.DEFAULT }} strokeWidth={1.5} />}
                  label="Last Entry"
                />
                <SerifQuote>"Your story starts here."</SerifQuote>
              </MiniCard>
              <MiniCard>
                <MiniCardHeader
                  icon={<Sparkles size={16} style={{ color: color.gold.DEFAULT }} strokeWidth={1.5} />}
                  label="Growth"
                />
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full border-2" style={{ background: color.sage.DEFAULT, borderColor: color.surface.cream }} />
                    <div className="w-6 h-6 rounded-full border-2" style={{ background: color.gold.DEFAULT, borderColor: color.surface.cream }} />
                    <div className="w-6 h-6 rounded-full border-2" style={{ background: color.terra.DEFAULT, borderColor: color.surface.cream }} />
                  </div>
                  <span className="font-sans font-bold ml-1" style={{ fontSize: '12px', color: color.terra.DEFAULT }}>Lvl 3</span>
                </div>
              </MiniCard>
            </div>
          </div>

        </Section>

        <Divider className="mb-12" />

        {/* ── Badges & Tags ──────────────────────────────────────────────── */}
        <Section title="Badges & Tags">
          <Row label="Badge variants (card header pills)">
            <Badge variant="default">Current Practice</Badge>
            <Badge variant="rescue">Rescue Mode</Badge>
            <Badge variant="stable">Stable</Badge>
            <Badge variant="active">Still active</Badge>
            <Badge variant="improving">Improving</Badge>
            <Badge variant="muted">Muted</Badge>
          </Row>
          <Row label="Tag (.tag) — ActionLab tier labels, category chips">
            <Tag>Awareness</Tag>
            <Tag>Interruption</Tag>
            <Tag>Replacement</Tag>
          </Row>
        </Section>

        <Divider className="mb-12" />

        {/* ── Inputs ─────────────────────────────────────────────────────── */}
        <Section title="Inputs">
          <div className="space-y-4">
            <div>
              <p className="t-caption mb-2">Input (.input-field)</p>
              <Input placeholder="What should Emora call you?" />
            </div>
            <div>
              <p className="t-caption mb-2">Textarea</p>
              <Textarea placeholder="Don't edit it. Just write." rows={3} />
            </div>
          </div>
        </Section>

        <Divider className="mb-12" />

        {/* ── Pill filter ────────────────────────────────────────────────── */}
        <Section title="Pill Filter">
          <p className="t-caption mb-3">Horizontal scroll filter — InsightTabs theme filter, Settings situation pills</p>
          <PillFilter
            options={[
              { value: 'all', label: 'All' },
              { value: 'avoidance', label: 'Avoidance' },
              { value: 'anxiety', label: 'Anxiety' },
              { value: 'communication', label: 'Communication' },
              { value: 'self_worth', label: 'Self-worth' },
            ]}
            active={pillActive}
            onChange={setPillActive}
          />
        </Section>

        <Divider className="mb-12" />

        {/* ── Quoted text ────────────────────────────────────────────────── */}
        <Section title="Quote Pull">
          <p className="t-caption mb-3">Left-border italic block — insight tab detail, pattern report</p>
          <QuotePull>
            There's a difference between needing space and creating distance before anyone can get close enough to leave.
          </QuotePull>
        </Section>

        <Divider className="mb-12" />

        {/* ── Shadows ────────────────────────────────────────────────────── */}
        <Section title="Shadows">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <ShadowCard name="card"      shadowValue={shadow.card} />
            <ShadowCard name="cardLg"    shadowValue={shadow.cardLg} />
            <ShadowCard name="cardHover" shadowValue={shadow.cardHover} />
            <ShadowCard name="btn"       shadowValue={shadow.btn} />
            <ShadowCard name="glass"     shadowValue={shadow.glass} />
            <ShadowCard name="dark"      shadowValue={shadow.dark} />
          </div>
        </Section>

        <Divider className="mb-12" />

        {/* ── Border radius ──────────────────────────────────────────────── */}
        <Section title="Border Radius">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            {[
              { name: 'sm · 8px',       r: '8px',   size: 48 },
              { name: 'md · 12px',      r: '12px',  size: 56 },
              { name: 'lg · 16px',      r: '16px',  size: 64 },
              { name: '2xl · 16px',     r: '16px',  size: 72 },
              { name: '3xl · 24px',     r: '24px',  size: 72 },
              { name: 'full · pill',    r: '9999px',size: 80 },
            ].map(item => (
              <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <div style={{
                  width: item.size, height: item.size,
                  borderRadius: item.r,
                  background: gradient.card,
                  border: `1px solid ${color.border.DEFAULT}`,
                }} />
                <p style={{ fontSize: '10px', color: color.text.muted, textAlign: 'center', maxWidth: '72px' }}>{item.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <p className="t-caption">Organic shapes (hand-drawn feel)</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { name: 'organic', r: radius.organic },
                { name: 'leaf',    r: radius.leaf },
                { name: 'stone',   r: radius.stone },
              ].map(item => (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                  <div style={{
                    width: 80, height: 80,
                    borderRadius: item.r,
                    background: gradient.card,
                    border: `1px solid ${color.border.DEFAULT}`,
                  }} />
                  <p style={{ fontSize: '10px', color: color.text.muted }}>{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider className="mb-12" />

        {/* ── Loading states ──────────────────────────────────────────────── */}
        <Section title="Loading & Feedback">

          <Row label="Spinner sizes">
            <div className="flex items-center gap-4">
              <Spinner size={16} />
              <Spinner size={20} />
              <Spinner size={24} />
              <Spinner size={32} />
            </div>
          </Row>

          <div className="mb-6">
            <p className="t-caption mb-3">ProgressBar</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <ProgressBar percent={30} className="flex-1" />
                <span className="t-caption">30%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ProgressBar percent={60} className="flex-1" />
                <span className="t-caption">60%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ProgressBar percent={100} className="flex-1" />
                <span className="t-caption">100%</span>
              </div>
            </div>
          </div>

          <div>
            <p className="t-caption mb-3">Skeleton shimmer</p>
            <div className="space-y-3">
              <Skeleton style={{ height: '20px', width: '60%' }} />
              <Skeleton style={{ height: '16px', width: '80%' }} />
              <Skeleton style={{ height: '16px', width: '45%' }} />
            </div>
          </div>

        </Section>

        <Divider className="mb-12" />

        {/* ── Dividers ───────────────────────────────────────────────────── */}
        <Section title="Dividers">
          <p className="t-caption mb-3">.divider — 1px warm border (used between card sections)</p>
          <Divider />
          <p className="t-caption mt-6 mb-3">Dot separator — used in hero subtitle (· Seed Stage ·)</p>
          <div className="flex items-center gap-2">
            <DotSeparator />
            <span className="text-sm font-medium" style={{ color: color.text.secondary }}>Growing Plant Stage</span>
            <DotSeparator />
          </div>
        </Section>

        <Divider className="mb-12" />

        {/* ── Animation classes ──────────────────────────────────────────── */}
        <Section title="Motion">
          <div className="space-y-3">
            {[
              { cls: 'animate-fade-in',   desc: '0.35s ease-out — page loads, card reveals' },
              { cls: 'animate-slide-up',  desc: '0.3s ease-out — lists, tab content' },
              { cls: 'animate-scale-in',  desc: '0.22s ease-out — modal open' },
              { cls: 'animate-spring-in', desc: '0.45s spring — completion states, milestones' },
              { cls: 'breathe',           desc: '4.5s breathing loop — Rescue Mode leaf' },
              { cls: 'glow-pulse',        desc: '2.5s glow — emotional state indicator' },
              { cls: 'emora-orb-ring',    desc: '4s scale — Emora avatar ring' },
            ].map(item => (
              <div key={item.cls} className="flex items-center gap-4">
                <code
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    background: color.surface.mini,
                    border: `1px solid ${color.border.DEFAULT}`,
                    borderRadius: '6px',
                    padding: '2px 8px',
                    color: color.terra.DEFAULT,
                    minWidth: '160px',
                  }}
                >
                  .{item.cls}
                </code>
                <p className="t-caption">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="t-caption mt-4" style={{ color: color.text.muted }}>
            Stagger helpers: .stagger-1 (0.04s) → .stagger-5 (0.24s) — for list item cascades
          </p>
        </Section>

        <Divider className="mb-12" />

        {/* ── Texture ────────────────────────────────────────────────────── */}
        <Section title="Paper Grain Texture">
          <p className="t-caption mb-3">
            Fixed overlay on the page shell. SVG fractalNoise · 4% opacity · multiply blend.
          </p>
          <div
            style={{
              height: '120px',
              borderRadius: '16px',
              background: color.surface.page,
              border: `1px solid ${color.border.DEFAULT}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
                mixBlendMode: 'multiply',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="t-caption">Paper texture visible here</p>
            </div>
          </div>
        </Section>

        <Divider className="mb-12" />

        {/* ── Empty state ────────────────────────────────────────────────── */}
        <Section title="Empty State">
          <EmptyState
            icon={<Wind size={24} style={{ color: color.text.muted }} strokeWidth={1.5} />}
            heading="Nothing yet."
            body="Actions are matched to what you're actually working through. Emora needs to hear it first."
            cta={<ButtonSecondary>Go to Emora</ButtonSecondary>}
          />
        </Section>

      </div>
    </div>
  )
}
