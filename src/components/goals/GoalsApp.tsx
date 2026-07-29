"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type View =
  | "dashboard"
  | "detail"
  | "edit"
  | "contributors"
  | "category"
  | "initial"
  | "sip"
  | "horizon"
  | "risk"
  | "confirm";

type GoalStatus = "active" | "past";
type Risk = "Conservative" | "Moderate" | "Aggressive";
type Frequency = "Monthly" | "Quarterly";

type Contributor = {
  id: string;
  name: string;
  role: "Owner" | "Accepted" | "Pending invite";
  amount?: string;
  initials: string;
};

type GoalValuePoint = {
  label: string;
  value: number;
  kind: "actual" | "projected";
};

type Goal = {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  projectedStatus: "Ahead" | "On track" | "Behind";
  adherenceStatus: "On schedule" | "Missed payments";
  status: GoalStatus;
  contributors: Contributor[];
  recentActivity: string[];
  valueHistory: GoalValuePoint[];
};

type GoalCategory = {
  id: string;
  label: string;
  icon: string;
  defaultYears: number;
  defaultTarget: number;
};

type InviteResult = {
  kind: "existing" | "external";
  title: string;
  subtitle: string;
  initials: string;
};

const categories: GoalCategory[] = [
  { id: "education", label: "Education", icon: "ED", defaultYears: 8, defaultTarget: 4500000 },
  { id: "home", label: "Home purchase", icon: "HM", defaultYears: 5, defaultTarget: 3500000 },
  { id: "retirement", label: "Retirement", icon: "RT", defaultYears: 20, defaultTarget: 20000000 },
  { id: "wedding", label: "Wedding", icon: "WG", defaultYears: 3, defaultTarget: 1800000 },
  { id: "emergency", label: "Emergency fund", icon: "EF", defaultYears: 1, defaultTarget: 600000 },
  { id: "custom", label: "Custom goal", icon: "CG", defaultYears: 4, defaultTarget: 1200000 },
];

const initialGoals: Goal[] = [
  {
    id: "education",
    name: "Daughter's education",
    category: "Education",
    targetAmount: 4500000,
    currentAmount: 1830000,
    targetDate: "Mar 2034",
    projectedStatus: "On track",
    adherenceStatus: "On schedule",
    status: "active",
    contributors: [
      { id: "owner", name: "Ritik", role: "Owner", amount: "₹42,000/mo", initials: "RB" },
      { id: "spouse", name: "Ananya", role: "Accepted", amount: "₹20,000/mo", initials: "AS" },
    ],
    recentActivity: ["Ritik SIP credited: ₹42,000", "Ananya added ₹20,000", "Goal projection updated"],
    valueHistory: [
      { label: "Jan", value: 1240000, kind: "actual" },
      { label: "Feb", value: 1325000, kind: "actual" },
      { label: "Mar", value: 1450000, kind: "actual" },
      { label: "Apr", value: 1538000, kind: "actual" },
      { label: "May", value: 1642000, kind: "actual" },
      { label: "Jun", value: 1735000, kind: "actual" },
      { label: "Jul", value: 1830000, kind: "actual" },
      { label: "Dec", value: 2320000, kind: "projected" },
      { label: "2030", value: 3180000, kind: "projected" },
      { label: "2034", value: 4510000, kind: "projected" },
    ],
  },
  {
    id: "home",
    name: "Home down payment",
    category: "Home purchase",
    targetAmount: 3500000,
    currentAmount: 940000,
    targetDate: "Dec 2029",
    projectedStatus: "Behind",
    adherenceStatus: "On schedule",
    status: "active",
    contributors: [{ id: "owner", name: "Ritik", role: "Owner", amount: "₹28,000/mo", initials: "RB" }],
    recentActivity: ["SIP credited: ₹28,000", "Projected shortfall increased by ₹1.8L"],
    valueHistory: [
      { label: "Jan", value: 610000, kind: "actual" },
      { label: "Feb", value: 655000, kind: "actual" },
      { label: "Mar", value: 724000, kind: "actual" },
      { label: "Apr", value: 792000, kind: "actual" },
      { label: "May", value: 841000, kind: "actual" },
      { label: "Jun", value: 895000, kind: "actual" },
      { label: "Jul", value: 940000, kind: "actual" },
      { label: "Dec", value: 1220000, kind: "projected" },
      { label: "2028", value: 2050000, kind: "projected" },
      { label: "2029", value: 2860000, kind: "projected" },
    ],
  },
  {
    id: "emergency",
    name: "Emergency reserve",
    category: "Emergency fund",
    targetAmount: 600000,
    currentAmount: 600000,
    targetDate: "Completed Jan 2026",
    projectedStatus: "Ahead",
    adherenceStatus: "On schedule",
    status: "past",
    contributors: [{ id: "owner", name: "Ritik", role: "Owner", amount: "Completed", initials: "RB" }],
    recentActivity: ["Goal completed", "Moved to liquid fund"],
    valueHistory: [
      { label: "Aug", value: 180000, kind: "actual" },
      { label: "Sep", value: 250000, kind: "actual" },
      { label: "Oct", value: 330000, kind: "actual" },
      { label: "Nov", value: 420000, kind: "actual" },
      { label: "Dec", value: 515000, kind: "actual" },
      { label: "Jan", value: 600000, kind: "actual" },
    ],
  },
];

const existingUserResult: InviteResult = {
  kind: "existing",
  title: "Ananya Sharma",
  subtitle: "FundsIndia user · ananya@example.com",
  initials: "AS",
};

function rupee(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function progress(goal: Goal) {
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

function remainingAmount(goal: Goal) {
  return Math.max(0, goal.targetAmount - goal.currentAmount);
}

function goalStory(goal: Goal) {
  if (goal.id === "education") {
    return "This is the college fund Ritik and Ananya are building together, one SIP at a time.";
  }
  if (goal.id === "home") {
    return "This is the first home fund. It is close enough to feel real, but needs one planning decision.";
  }
  if (goal.id === "emergency") {
    return "This reserve gives the family breathing room before taking bigger investment risk.";
  }
  return "This goal turns a future plan into a monthly investment habit.";
}

function milestoneCopy(goal: Goal) {
  const pct = progress(goal);
  if (pct >= 100) return "Goal completed. The next step is protecting access and withdrawal timing.";
  if (pct >= 50) return "Halfway moment is close. A small SIP increase could protect the timeline.";
  if (pct >= 35) return "The foundation is in place. The next milestone is crossing 50% funded.";
  return "Early build phase. Consistency matters more than chasing returns right now.";
}

function contributionMoment(goal: Goal) {
  const hasPartner = goal.contributors.length > 1;
  if (hasPartner) return `${goal.contributors[1].name} is already contributing ${goal.contributors[1].amount}.`;
  return "Invite a spouse or family member to turn this into a shared plan.";
}

function StepHeader({
  eyebrow,
  title,
  onBack,
  progressValue,
}: {
  eyebrow: string;
  title: string;
  onBack: () => void;
  progressValue?: number;
}) {
  return (
    <>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="fi-pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-sm"
        >
          ‹
        </button>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">{eyebrow}</p>
          <h1 className="text-2xl font-bold leading-tight text-slate-950">{title}</h1>
        </div>
      </div>
      {progressValue ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="fi-progress h-full rounded-full bg-[linear-gradient(90deg,#00c781,#006bff)]" style={{ width: `${progressValue}%` }} />
        </div>
      ) : null}
    </>
  );
}

function BottomAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="fi-bottom-sheet fixed inset-x-0 bottom-20 z-30 mx-auto w-full max-w-md border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
      <button
        type="button"
        onClick={onClick}
        className="fi-pressable h-12 w-full rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] text-sm font-bold text-white shadow-lg shadow-emerald-900/10"
      >
        {label}
      </button>
    </div>
  );
}

function ContributorAvatar({ contributor }: { contributor: Contributor }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#00c781,#006bff)] text-[10px] font-black text-white shadow-sm">
      {contributor.initials}
    </span>
  );
}

function GoalCard({ goal, onOpen }: { goal: Goal; onOpen: () => void }) {
  const pct = progress(goal);
  const statusColor =
    goal.projectedStatus === "Behind"
      ? "bg-amber-50 text-amber-700"
      : goal.projectedStatus === "Ahead"
        ? "bg-[#eef7ff] text-[#006bff]"
        : "bg-[#ecfff7] text-[#00a76f]";

  return (
    <button type="button" onClick={onOpen} className="fi-card fi-pressable w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">{goal.category}</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">{goal.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {rupee(goal.currentAmount)} of {rupee(goal.targetAmount)} · {goal.targetDate}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>{goal.projectedStatus}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="fi-progress h-full rounded-full bg-[linear-gradient(90deg,#00c781,#006bff)]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">{pct}% funded</span>
        <span className="text-xs font-semibold text-slate-500">{goal.adherenceStatus}</span>
      </div>
      <p className="mt-3 rounded-2xl bg-[#f8fafc] p-3 text-xs leading-5 text-slate-600">{milestoneCopy(goal)}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="-space-x-2 flex">
          {goal.contributors.map((contributor) => (
            <ContributorAvatar key={contributor.id} contributor={contributor} />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-500">
          {goal.contributors.length > 1 ? `${goal.contributors.length} contributors` : "Solo goal"}
        </span>
      </div>
    </button>
  );
}

function buildGoalHistory(goal: Goal): GoalValuePoint[] {
  if (goal.valueHistory.length) return goal.valueHistory;

  const halfway = Math.max(goal.currentAmount * 0.72, goal.currentAmount - 240000);
  const projected = goal.projectedStatus === "Behind" ? goal.targetAmount * 0.82 : goal.targetAmount * 1.01;

  return [
    { label: "Start", value: Math.max(0, goal.currentAmount * 0.45), kind: "actual" },
    { label: "Q1", value: halfway, kind: "actual" },
    { label: "Now", value: goal.currentAmount, kind: "actual" },
    { label: "Next", value: (goal.currentAmount + projected) / 2, kind: "projected" },
    { label: "Target", value: projected, kind: "projected" },
  ];
}

function linePath(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
}

function PortfolioValueChart({ goal }: { goal: Goal }) {
  const data = buildGoalHistory(goal);
  const width = 320;
  const height = 164;
  const paddingX = 20;
  const paddingTop = 18;
  const paddingBottom = 34;
  const maxValue = Math.max(goal.targetAmount, ...data.map((point) => point.value)) * 1.08;
  const minValue = Math.min(0, ...data.map((point) => point.value));
  const plotHeight = height - paddingTop - paddingBottom;
  const plotWidth = width - paddingX * 2;
  const scaleX = (index: number) => paddingX + (plotWidth * index) / Math.max(1, data.length - 1);
  const scaleY = (value: number) => paddingTop + ((maxValue - value) / Math.max(1, maxValue - minValue)) * plotHeight;
  const points = data.map((point, index) => ({ ...point, x: scaleX(index), y: scaleY(point.value) }));
  const actualPoints = points.filter((point) => point.kind === "actual");
  const projectedPoints = points.slice(Math.max(0, actualPoints.length - 1));
  const targetY = scaleY(goal.targetAmount);
  const latest = data.findLast((point) => point.kind === "actual") ?? data[data.length - 1];
  const first = data[0];
  const change = latest.value - first.value;
  const changePct = first.value > 0 ? (change / first.value) * 100 : 0;

  return (
    <div className="fi-card rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-950">Portfolio value over time</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">Actual history with projected path to target.</p>
        </div>
        <span className="rounded-full bg-[#ecfff7] px-2.5 py-1 text-xs font-bold text-[#00a76f]">
          +{changePct.toFixed(1)}%
        </span>
      </div>
      <div className="rounded-3xl bg-[linear-gradient(180deg,#f8fbff,#f2fff8)] px-2 pt-3">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${goal.name} portfolio value line graph`} className="h-44 w-full overflow-visible">
          <defs>
            <linearGradient id={`goal-line-${goal.id}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#00a76f" />
              <stop offset="100%" stopColor="#006bff" />
            </linearGradient>
            <linearGradient id={`goal-area-${goal.id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00a76f" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#006bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((line) => {
            const y = paddingTop + (plotHeight * line) / 2;
            return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#dbe7f3" strokeWidth="1" />;
          })}
          <line x1={paddingX} x2={width - paddingX} y1={targetY} y2={targetY} stroke="#006bff" strokeDasharray="5 5" strokeWidth="1.5" />
          <text x={width - paddingX} y={targetY - 6} textAnchor="end" className="fill-[#006bff] text-[10px] font-bold">
            Target {rupee(goal.targetAmount)}
          </text>
          <path
            d={`${linePath(actualPoints)} L ${actualPoints[actualPoints.length - 1].x.toFixed(1)} ${height - paddingBottom} L ${actualPoints[0].x.toFixed(1)} ${height - paddingBottom} Z`}
            fill={`url(#goal-area-${goal.id})`}
          />
          <path d={linePath(actualPoints)} fill="none" stroke={`url(#goal-line-${goal.id})`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d={linePath(projectedPoints)} fill="none" stroke="#006bff" strokeDasharray="6 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          {points.map((point) => (
            <g key={`${point.label}-${point.kind}`}>
              <circle cx={point.x} cy={point.y} r={point.kind === "actual" ? 4.5 : 3.5} fill={point.kind === "actual" ? "#00a76f" : "#ffffff"} stroke={point.kind === "actual" ? "#ffffff" : "#006bff"} strokeWidth="2" />
              <text x={point.x} y={height - 12} textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="grid grid-cols-3 gap-2 border-t border-white/70 px-2 py-3">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Start</p>
            <p className="text-sm font-black text-slate-950">{rupee(first.value)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Current</p>
            <p className="text-sm font-black text-slate-950">{rupee(latest.value)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Target</p>
            <p className="text-sm font-black text-slate-950">{rupee(goal.targetAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GoalsApp() {
  const [view, setView] = useState<View>("dashboard");
  const [tab, setTab] = useState<GoalStatus>("active");
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [selectedGoalId, setSelectedGoalId] = useState(initialGoals[0].id);
  const [goalCategory, setGoalCategory] = useState(categories[0]);
  const [initialInvestment, setInitialInvestment] = useState(500000);
  const [sipAmount, setSipAmount] = useState(35000);
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [horizonYears, setHorizonYears] = useState(8);
  const [risk, setRisk] = useState<Risk>("Moderate");
  const [comparisonRisk, setComparisonRisk] = useState<Risk>("Moderate");
  const [inviteQuery, setInviteQuery] = useState("ananya@example.com");
  const [pendingInvites, setPendingInvites] = useState<Contributor[]>([
    { id: "pending-parent", name: "Meera Sharma", role: "Pending invite", initials: "MS" },
  ]);
  const [editName, setEditName] = useState(initialGoals[0].name);
  const [editTargetAmount, setEditTargetAmount] = useState(initialGoals[0].targetAmount);
  const [editCurrentAmount, setEditCurrentAmount] = useState(initialGoals[0].currentAmount);
  const [editTargetDate, setEditTargetDate] = useState(initialGoals[0].targetDate);

  const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0];
  const visibleGoals = goals.filter((goal) => goal.status === tab);
  const activeGoalRemaining = goals
    .filter((goal) => goal.status === "active")
    .reduce((total, goal) => total + remainingAmount(goal), 0);
  const inviteLooksExisting = inviteQuery.toLowerCase().includes("ananya") || inviteQuery.includes("@example.com");
  const inviteResult: InviteResult = inviteLooksExisting
    ? existingUserResult
    : {
        kind: "external",
        title: inviteQuery || "External invite",
        subtitle: "Not on FundsIndia yet · send invite link",
        initials: "EX",
      };

  const projectedOutcome = useMemo(() => {
    const monthly = frequency === "Monthly" ? sipAmount : sipAmount / 3;
    const base = initialInvestment + monthly * horizonYears * 12;
    const multiplier = comparisonRisk === "Aggressive" ? 1.34 : comparisonRisk === "Moderate" ? 1.22 : 1.12;
    return Math.round(base * multiplier);
  }, [comparisonRisk, frequency, horizonYears, initialInvestment, sipAmount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const goalId = params.get("goal");
    const viewParam = params.get("view");

    if (!goalId || viewParam !== "detail" || !initialGoals.some((goal) => goal.id === goalId)) return;

    const timeout = window.setTimeout(() => {
      setSelectedGoalId(goalId);
      setView("detail");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const showDashboard = () => {
    setView("dashboard");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/goals");
    }
  };

  const openGoalDetail = (goalId: string) => {
    setSelectedGoalId(goalId);
    setView("detail");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/goals?goal=${goalId}&view=detail`);
    }
  };

  const startEditGoal = () => {
    setEditName(selectedGoal.name);
    setEditTargetAmount(selectedGoal.targetAmount);
    setEditCurrentAmount(selectedGoal.currentAmount);
    setEditTargetDate(selectedGoal.targetDate);
    setView("edit");
  };

  const saveGoalEdits = () => {
    const safeTarget = Math.max(1, editTargetAmount);
    const safeCurrent = Math.max(0, editCurrentAmount);
    const nextStatus =
      safeCurrent >= safeTarget ? "Ahead" : safeCurrent / safeTarget >= 0.35 ? "On track" : "Behind";

    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== selectedGoal.id) return goal;

        const updatedHistory = goal.valueHistory.length
          ? goal.valueHistory.map((point, index, history) =>
              index === history.findLastIndex((item) => item.kind === "actual")
                ? { ...point, value: safeCurrent }
                : point,
            )
          : buildGoalHistory({ ...goal, targetAmount: safeTarget, currentAmount: safeCurrent, valueHistory: [] });

        return {
          ...goal,
          name: editName.trim() || goal.name,
          targetAmount: safeTarget,
          currentAmount: safeCurrent,
          targetDate: editTargetDate.trim() || goal.targetDate,
          projectedStatus: nextStatus,
          recentActivity: ["Goal details updated", ...goal.recentActivity.slice(0, 3)],
          valueHistory: updatedHistory,
        };
      }),
    );
    setView("detail");
  };

  const createGoal = () => {
    const id = `${goalCategory.id}-${Date.now()}`;
    const newGoal: Goal = {
      id,
      name: goalCategory.label,
      category: goalCategory.label,
      targetAmount: goalCategory.defaultTarget,
      currentAmount: initialInvestment,
      targetDate: `Jul ${2026 + horizonYears}`,
      projectedStatus: projectedOutcome >= goalCategory.defaultTarget ? "On track" : "Behind",
      adherenceStatus: "On schedule",
      status: "active",
      contributors: [{ id: "owner", name: "Ritik", role: "Owner", amount: `${rupee(sipAmount)}/mo`, initials: "RB" }],
      recentActivity: ["Goal created", `${frequency} SIP planned: ${rupee(sipAmount)}`],
      valueHistory: buildGoalHistory({
        id,
        name: goalCategory.label,
        category: goalCategory.label,
        targetAmount: goalCategory.defaultTarget,
        currentAmount: initialInvestment,
        targetDate: `Jul ${2026 + horizonYears}`,
        projectedStatus: projectedOutcome >= goalCategory.defaultTarget ? "On track" : "Behind",
        adherenceStatus: "On schedule",
        status: "active",
        contributors: [],
        recentActivity: [],
        valueHistory: [],
      }),
    };
    setGoals((current) => [newGoal, ...current]);
    setSelectedGoalId(id);
    setView("dashboard");
  };

  const inviteContributor = () => {
    const nextInvite: Contributor = {
      id: `pending-${Date.now()}`,
      name: inviteResult.title,
      role: "Pending invite",
      initials: inviteResult.initials,
    };
    setPendingInvites((current) => [nextInvite, ...current]);
  };

  if (view === "detail") {
    return (
      <div className="fi-screen space-y-5 px-4 pb-28">
        <StepHeader eyebrow={selectedGoal.category} title={selectedGoal.name} onBack={showDashboard} />
        <section className="fi-card rounded-[28px] border border-[#caefe3] bg-[linear-gradient(135deg,#f0fff8_0%,#eef7ff_54%,#ffffff_100%)] p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Target amount</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">{rupee(selectedGoal.targetAmount)}</h1>
              <p className="mt-1 text-sm text-slate-600">Target date: {selectedGoal.targetDate}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#006bff] shadow-sm">
              {progress(selectedGoal)}%
            </span>
          </div>
          <p className="mt-4 rounded-2xl bg-white/75 p-3 text-sm leading-6 text-slate-700">{goalStory(selectedGoal)}</p>
        </section>
        <section className="fi-card rounded-3xl border border-[#d7edf8] bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">
              MS
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Next milestone</p>
              <h2 className="mt-1 font-bold text-slate-950">{milestoneCopy(selectedGoal)}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {rupee(remainingAmount(selectedGoal))} remains. Rekha can review whether the current SIP and fund mix are still enough.
              </p>
            </div>
          </div>
          <Link
            href={`/advisor-calls?goal=${selectedGoal.id}&goalName=${encodeURIComponent(selectedGoal.name)}&category=portfolio_review&returnTo=${encodeURIComponent(`/goals?goal=${selectedGoal.id}&view=detail`)}`}
            className="fi-pressable mt-4 flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-[#006bff]"
          >
            Ask Rekha about this goal
          </Link>
        </section>
        <PortfolioValueChart goal={selectedGoal} />
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Projected completion</p>
            <h2 className="mt-2 text-lg font-bold text-slate-950">{selectedGoal.projectedStatus}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Based on current contribution pace.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">Contribution adherence</p>
            <h2 className="mt-2 text-lg font-bold text-slate-950">{selectedGoal.adherenceStatus}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Checks whether SIPs are happening.</p>
          </div>
        </section>
        <section className="fi-card rounded-3xl border border-[#f7e3bf] bg-[linear-gradient(135deg,#fffdf7,#f8fbff)] p-4 shadow-sm">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xs font-black text-amber-700">
              TX
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-amber-700">Before redemption</p>
              <h2 className="font-bold text-slate-950">Tax and exit-load guide</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                When this goal is ready, FundsIndia can explain capital gains tax, exit load, and the cleanest withdrawal order before you redeem.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Tax view", "Exit load", "Advisor check"].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-3 text-center text-[11px] font-bold text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Contributors</h2>
          <button onClick={() => setView("contributors")} className="fi-pressable rounded-xl px-2 py-1 text-sm font-bold text-[#006bff]">
              Add
            </button>
          </div>
          <p className="mb-3 rounded-2xl bg-[#ecfff7] p-3 text-xs font-semibold leading-5 text-[#00a76f]">
            {contributionMoment(selectedGoal)}
          </p>
          <div className="space-y-3">
            {selectedGoal.contributors.map((contributor) => (
              <div key={contributor.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <ContributorAvatar contributor={contributor} />
                  <div>
                    <p className="text-sm font-bold text-slate-950">{contributor.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{contributor.role}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600">{contributor.amount ?? "Contributor"}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-slate-950">Recent activity</h2>
          <div className="mt-3 space-y-2">
            {selectedGoal.recentActivity.map((activity) => (
              <p key={activity} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {activity}
              </p>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startEditGoal}
            className="fi-pressable h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm"
          >
            Edit goal
          </button>
          <Link
            href={`/advisor-calls?goal=${selectedGoal.id}&goalName=${encodeURIComponent(selectedGoal.name)}&category=new_investment&returnTo=${encodeURIComponent(`/goals?goal=${selectedGoal.id}&view=detail`)}`}
            className="fi-pressable flex h-12 items-center justify-center rounded-2xl bg-[#006bff] text-sm font-bold text-white shadow-sm"
          >
            Talk to advisor
          </Link>
        </div>
      </div>
    );
  }

  if (view === "edit") {
    const remaining = Math.max(0, editTargetAmount - editCurrentAmount);

    return (
      <div className="fi-screen space-y-5 px-4 pb-28">
        <StepHeader eyebrow={selectedGoal.category} title="Edit goal" onBack={() => setView("detail")} />
        <section className="fi-card rounded-[28px] border border-[#caefe3] bg-[linear-gradient(135deg,#f0fff8_0%,#eef7ff_54%,#ffffff_100%)] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">Goal health</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">{rupee(remaining)} left</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Update the core goal details and FundsIndia will refresh progress, projections, and advisor context.
          </p>
        </section>
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-bold text-slate-900" htmlFor="edit-goal-name">
            Goal name
          </label>
          <input
            id="edit-goal-name"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition-colors duration-200 focus:border-[#00a76f]"
          />
          <label className="block text-sm font-bold text-slate-900" htmlFor="edit-target-amount">
            Target amount
          </label>
          <input
            id="edit-target-amount"
            type="number"
            value={editTargetAmount}
            onChange={(event) => setEditTargetAmount(Number(event.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition-colors duration-200 focus:border-[#00a76f]"
          />
          <label className="block text-sm font-bold text-slate-900" htmlFor="edit-current-amount">
            Current value
          </label>
          <input
            id="edit-current-amount"
            type="number"
            value={editCurrentAmount}
            onChange={(event) => setEditCurrentAmount(Number(event.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition-colors duration-200 focus:border-[#00a76f]"
          />
          <label className="block text-sm font-bold text-slate-900" htmlFor="edit-target-date">
            Target date
          </label>
          <input
            id="edit-target-date"
            value={editTargetDate}
            onChange={(event) => setEditTargetDate(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition-colors duration-200 focus:border-[#00a76f]"
          />
        </section>
        <section className="rounded-3xl border border-[#d7edf8] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Advisor memory</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Rekha will see these updated numbers when you schedule a goal-related call, along with contribution history and recent activity.
          </p>
        </section>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setView("detail")}
            className="fi-pressable h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveGoalEdits}
            className="fi-pressable h-12 rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] text-sm font-bold text-white shadow-sm"
          >
            Save changes
          </button>
        </div>
      </div>
    );
  }

  if (view === "contributors") {
    return (
      <div className="fi-screen space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Shared goal" title="Add contributor" onBack={() => setView("detail")} />
        <section className="fi-card rounded-3xl border border-[#caefe3] bg-[linear-gradient(135deg,#f0fff8,#eef7ff)] p-4 shadow-sm">
          <h2 className="font-bold text-slate-950">Build this goal together</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Invite a spouse, parent, or family member to contribute toward {selectedGoal.name}. Existing FundsIndia users
            receive an in-app request; everyone else gets an invite link.
          </p>
        </section>
        <label className="block text-sm font-bold text-slate-900" htmlFor="invite-search">
          Search by name, email, or phone
        </label>
        <input
          id="invite-search"
          value={inviteQuery}
          onChange={(event) => setInviteQuery(event.target.value)}
          className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-colors duration-200 focus:border-[#00a76f]"
          placeholder="Search by name, email, or phone"
        />
        <section className="fi-card rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">
            {inviteResult.kind === "existing" ? "Existing FundsIndia user" : "External invite"}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00c781,#006bff)] text-xs font-black text-white">
                {inviteResult.initials}
              </span>
              <div>
                <h2 className="font-bold text-slate-950">{inviteResult.title}</h2>
                <p className="text-sm text-slate-500">{inviteResult.subtitle}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={inviteContributor}
            className="fi-pressable mt-4 h-11 w-full rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] text-sm font-bold text-white"
          >
            {inviteResult.kind === "existing" ? "Send in-app invite" : "Invite externally"}
          </button>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-slate-950">Pending invites</h2>
          <div className="mt-3 space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ContributorAvatar contributor={invite} />
                    <div>
                      <p className="text-sm font-bold text-slate-950">{invite.name}</p>
                      <p className="text-xs font-semibold text-slate-500">{invite.role}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="fi-pressable h-9 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600">
                    Resend
                  </button>
                  <button
                    onClick={() => setPendingInvites((current) => current.filter((item) => item.id !== invite.id))}
                    className="fi-pressable h-9 rounded-xl border border-rose-100 bg-white text-xs font-bold text-rose-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <button onClick={() => setView("detail")} className="fi-pressable h-12 w-full rounded-2xl bg-[#006bff] text-sm font-bold text-white">
          Done
        </button>
        <p className="text-xs leading-5 text-slate-500">
          Scope note: approval rules and per-person contribution accounting are still open product questions.
        </p>
      </div>
    );
  }

  if (view === "category") {
    return (
      <div className="fi-screen space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Step 1 of 5" title="What are you planning for?" progressValue={20} onBack={() => setView("dashboard")} />
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setGoalCategory(category);
                setHorizonYears(category.defaultYears);
                setInitialInvestment(Math.min(500000, Math.round(category.defaultTarget * 0.12)));
                setView("initial");
              }}
              className="fi-card fi-pressable min-h-32 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">
                {category.icon}
              </span>
              <strong className="mt-4 block text-slate-950">{category.label}</strong>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "initial") {
    return (
      <div className="fi-screen space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 2 of 5" title="How much are you starting with?" progressValue={40} onBack={() => setView("category")} />
        <section className="fi-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-bold text-slate-900" htmlFor="initial-investment">
            Initial investment
          </label>
          <input
            id="initial-investment"
            type="number"
            value={initialInvestment}
            onChange={(event) => setInitialInvestment(Number(event.target.value))}
            className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xl font-black text-slate-950 outline-none transition-colors duration-200 focus:border-[#00a76f]"
          />
          <button type="button" onClick={() => setInitialInvestment(0)} className="fi-pressable mt-4 rounded-xl px-2 py-1 text-sm font-bold text-[#006bff]">
            Starting from zero
          </button>
        </section>
        <BottomAction label="Continue" onClick={() => setView("sip")} />
      </div>
    );
  }

  if (view === "sip") {
    const estimate = initialInvestment + sipAmount * 12 * horizonYears;

    return (
      <div className="fi-screen space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 3 of 5" title="What can you contribute regularly?" progressValue={60} onBack={() => setView("initial")} />
        <section className="fi-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-bold text-slate-900" htmlFor="sip-amount">
            SIP amount
          </label>
          <input
            id="sip-amount"
            type="number"
            value={sipAmount}
            onChange={(event) => setSipAmount(Number(event.target.value))}
            className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xl font-black text-slate-950 outline-none transition-colors duration-200 focus:border-[#00a76f]"
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["Monthly", "Quarterly"] as Frequency[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFrequency(option)}
                className={`fi-pressable h-11 rounded-2xl border text-sm font-bold ${
                  frequency === option ? "border-[#006bff] bg-[#eef7ff] text-[#006bff]" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-[#ecfff7] px-3 py-3 text-sm font-semibold leading-5 text-[#00a76f]">
            At this pace, you&apos;ll invest about {rupee(estimate)} before returns.
          </p>
        </section>
        <BottomAction label="Continue" onClick={() => setView("horizon")} />
      </div>
    );
  }

  if (view === "horizon") {
    return (
      <div className="fi-screen space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 4 of 5" title="When do you need this money?" progressValue={80} onBack={() => setView("sip")} />
        <section className="fi-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Time horizon</span>
            <strong className="text-2xl font-black text-slate-950">{horizonYears} years</strong>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={horizonYears}
            onChange={(event) => setHorizonYears(Number(event.target.value))}
            className="mt-6 w-full accent-[#006bff]"
            aria-label="Time horizon in years"
          />
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Based on {goalCategory.label}, we pre-filled a sensible starting point. You can change it anytime.
          </p>
        </section>
        <BottomAction label="Continue" onClick={() => setView("risk")} />
      </div>
    );
  }

  if (view === "risk") {
    return (
      <div className="fi-screen space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 5 of 5" title="How much risk feels comfortable?" progressValue={100} onBack={() => setView("horizon")} />
        <div className="space-y-3">
          {(["Conservative", "Moderate", "Aggressive"] as Risk[]).map((option) => (
            <button
              key={option}
              onClick={() => {
                setRisk(option);
                setComparisonRisk(option);
              }}
              className={`fi-card fi-pressable w-full rounded-3xl border p-4 text-left shadow-sm ${
                risk === option ? "border-[#00a76f] bg-[linear-gradient(135deg,#f0fff8,#eef7ff)]" : "border-slate-200 bg-white"
              }`}
            >
              <strong className="block text-slate-950">{option}</strong>
              <span className="mt-1 block text-sm leading-5 text-slate-500">
                {option === "Conservative"
                  ? "Prioritize steadiness over higher upside."
                  : option === "Moderate"
                    ? "Balance growth potential and comfort."
                    : "Accept more movement for higher long-term upside."}
              </span>
            </button>
          ))}
        </div>
        <BottomAction label="Continue" onClick={() => setView("confirm")} />
      </div>
    );
  }

  if (view === "confirm") {
    const fundMix =
      comparisonRisk === "Aggressive"
        ? "75% equity funds · 15% hybrid · 10% debt"
        : comparisonRisk === "Moderate"
          ? "55% equity funds · 25% hybrid · 20% debt"
          : "30% equity funds · 20% hybrid · 50% debt";

    return (
      <div className="fi-screen space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Confirmation" title="Your goal plan" onBack={() => setView("risk")} />
        <section className="fi-card rounded-[28px] border border-[#caefe3] bg-[linear-gradient(135deg,#f0fff8_0%,#eef7ff_54%,#ffffff_100%)] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">{goalCategory.label}</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">{rupee(goalCategory.defaultTarget)} target</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            With {rupee(initialInvestment)} upfront and {rupee(sipAmount)} {frequency.toLowerCase()}, you&apos;re projected to reach{" "}
            <strong>{rupee(projectedOutcome)}</strong> by Jul {2026 + horizonYears}.
          </p>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-slate-950">Risk profile comparison</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["Conservative", "Moderate", "Aggressive"] as Risk[]).map((option) => (
              <button
                key={option}
                onClick={() => setComparisonRisk(option)}
                className={`fi-pressable rounded-2xl border px-2 py-3 text-xs font-bold ${
                  comparisonRisk === option ? "border-[#006bff] bg-[#eef7ff] text-[#006bff]" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Suggested plan</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{fundMix}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Saved risk appetite remains {risk} unless you confirm a change later.</p>
          </div>
        </section>
        <section className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          {[
            ["Initial investment", rupee(initialInvestment)],
            ["SIP", `${rupee(sipAmount)} · ${frequency}`],
            ["Time horizon", `${horizonYears} years`],
            ["Risk appetite", risk],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-slate-500">{label}</span>
              <strong className="text-right text-sm text-slate-900">{value}</strong>
            </div>
          ))}
        </section>
        <button onClick={createGoal} className="fi-pressable h-12 w-full rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] text-sm font-bold text-white">
          Confirm goal
        </button>
        <Link
          href={`/advisor-calls?goal=new-${goalCategory.id}&goalName=${encodeURIComponent(goalCategory.label)}&category=new_investment`}
          onClick={createGoal}
          className="fi-pressable flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-[#006bff] shadow-sm"
        >
          Talk to advisor
        </Link>
      </div>
    );
  }

  return (
    <div className="fi-screen space-y-6 px-4 pb-28">
      <section className="fi-card fi-hero-glow overflow-hidden rounded-[28px] border border-[#caefe3] bg-[linear-gradient(135deg,#f0fff8_0%,#eef7ff_54%,#ffffff_100%)] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <Image
            src="/fundsindia-logo.png"
            alt="FundsIndia"
            width={132}
            height={69}
            className="h-10 w-auto object-contain mix-blend-multiply"
          />
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#006bff] shadow-sm">Goals</span>
        </div>
        <h1 className="mt-5 text-3xl font-black leading-tight text-slate-950">Invest toward the life you&apos;re building</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Each goal is a story, a timeline, and a shared contribution plan that Rekha can help you keep on track.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            [rupee(activeGoalRemaining), "Still to fund"],
            ["2", "Shared people"],
            ["1", "Needs Rekha"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/75 p-3">
              <strong className="block text-sm font-black text-slate-950">{value}</strong>
              <span className="text-[11px] font-semibold leading-4 text-slate-500">{label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setView("category")}
          className="fi-pressable mt-5 h-12 rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10"
        >
          Create new goal
        </button>
      </section>

      <section className="fi-card rounded-3xl border border-[#f7e3bf] bg-[linear-gradient(135deg,#fffdf7,#f8fbff)] p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xs font-black text-amber-700">
            ST
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-amber-700">Progress story</p>
            <h2 className="mt-1 font-bold text-slate-950">The education fund is now past its early build phase</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Ritik and Ananya have crossed ₹18.3L together. The next emotional milestone is halfway funded.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {(["active", "past"] as GoalStatus[]).map((nextTab) => (
            <button
              key={nextTab}
              onClick={() => setTab(nextTab)}
              className={`fi-pressable h-11 rounded-2xl text-sm font-bold capitalize ${
                tab === nextTab ? "bg-[#006bff] text-white" : "text-slate-500"
              }`}
            >
              {nextTab}
            </button>
          ))}
        </div>
      </section>

      {visibleGoals.length ? (
        <section className="space-y-3">
          {visibleGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onOpen={() => openGoalDetail(goal.id)}
            />
          ))}
        </section>
      ) : (
        <section className="fi-card rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#eef7ff] text-xl font-black text-[#006bff]">
            ◎
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">No goals here yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Create a goal to see progress, projections, and contributors.</p>
          <button onClick={() => setView("category")} className="fi-pressable mt-5 h-11 rounded-2xl bg-[#006bff] px-5 text-sm font-bold text-white">
            Create first goal
          </button>
        </section>
      )}

      <section className="fi-card rounded-3xl border border-[#d7edf8] bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">
            CG
          </span>
          <div>
            <h2 className="font-bold text-slate-950">Collaborative goals</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Share a goal with your spouse or family member so both of you can contribute toward the same target.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedGoalId("education");
              setView("contributors");
            }}
            className="fi-pressable h-11 rounded-2xl bg-[#00a76f] text-sm font-bold text-white"
          >
            Invite contributor
          </button>
          <Link href="/advisor-calls?category=portfolio_review" className="fi-pressable flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-[#006bff]">
            Ask Rekha
          </Link>
        </div>
      </section>
    </div>
  );
}
