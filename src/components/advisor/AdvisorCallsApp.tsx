"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Step = "home" | "category" | "context" | "time" | "confirm" | "history" | "detail" | "briefing";
type CategoryId = "portfolio_review" | "new_investment" | "miscellaneous";
type TimeMode = "suggested" | "manual";

type Category = {
  id: CategoryId;
  title: string;
  description: string;
  placeholder: string;
  icon: string;
  suggestedGoals: string[];
};

type Goal = {
  id: string;
  label: string;
};

type Slot = {
  day: string;
  date: string;
  time: string;
  note: string;
};

const assignedAdvisor = {
  id: "rekha",
  name: "Rekha Nair",
  title: "Your FundsIndia advisor",
  initials: "RN",
  availability: "Usually responds within 1 business day",
};

const categories: Category[] = [
  {
    id: "portfolio_review",
    title: "Portfolio review",
    description: "Check how your investments are doing.",
    placeholder: "e.g. I want to check if my SIPs still match my goals",
    icon: "PR",
    suggestedGoals: ["education", "retirement"],
  },
  {
    id: "new_investment",
    title: "New investment",
    description: "Put in new money or explore a new goal.",
    placeholder: "e.g. I have some extra money and want to know where to put it",
    icon: "NI",
    suggestedGoals: ["wealth", "home"],
  },
  {
    id: "miscellaneous",
    title: "Not sure — just let me explain",
    description: "Start with your question. Rekha will help classify it.",
    placeholder: "Tell us what's on your mind",
    icon: "NS",
    suggestedGoals: [],
  },
];

const goals: Goal[] = [
  { id: "education", label: "Daughter's education" },
  { id: "retirement", label: "Retirement" },
  { id: "home", label: "Home down payment" },
  { id: "wealth", label: "Long-term wealth" },
  { id: "tax", label: "Tax planning" },
];

const suggestedSlots: Slot[] = [
  { day: "Today", date: "28 Jul", time: "4:30 PM", note: "Best fit" },
  { day: "Wed", date: "29 Jul", time: "11:00 AM", note: "Good fit" },
  { day: "Thu", date: "30 Jul", time: "2:30 PM", note: "Open after lunch" },
  { day: "Fri", date: "31 Jul", time: "5:00 PM", note: "End of day" },
];

const manualDays = ["Today", "Wed", "Thu", "Fri", "Sat"];
const manualSlotsByDay: Record<string, Slot[]> = {
  Today: [
    { day: "Today", date: "28 Jul", time: "4:30 PM", note: "Best fit" },
    { day: "Today", date: "28 Jul", time: "6:00 PM", note: "Evening" },
  ],
  Wed: [
    { day: "Wed", date: "29 Jul", time: "10:30 AM", note: "Morning" },
    { day: "Wed", date: "29 Jul", time: "11:00 AM", note: "Good fit" },
    { day: "Wed", date: "29 Jul", time: "3:00 PM", note: "Afternoon" },
  ],
  Thu: [
    { day: "Thu", date: "30 Jul", time: "12:00 PM", note: "Midday" },
    { day: "Thu", date: "30 Jul", time: "2:30 PM", note: "Open after lunch" },
  ],
  Fri: [
    { day: "Fri", date: "31 Jul", time: "9:30 AM", note: "Early" },
    { day: "Fri", date: "31 Jul", time: "5:00 PM", note: "End of day" },
  ],
  Sat: [{ day: "Sat", date: "1 Aug", time: "11:30 AM", note: "Weekend" }],
};

const pastCalls = [
  {
    id: "education-review",
    date: "Jun 16",
    advisor: assignedAdvisor.name,
    category: "Portfolio review",
    title: "Education goal recalibration",
    summary: "Reviewed whether SIPs still match the education goal after income changed.",
    detail:
      "Rekha suggested reviewing the education goal projection in July before increasing equity exposure. The investor wanted confidence that the current SIP path was still reasonable.",
    action: "Review goal projection after salary revision settles.",
  },
  {
    id: "liquidity-tax",
    date: "Apr 09",
    advisor: assignedAdvisor.name,
    category: "New investment",
    title: "Tax-saving funds and liquidity",
    summary: "Discussed ELSS lock-in versus near-term liquidity needs.",
    detail:
      "No redemption was recommended because the emergency fund was below target. Rekha suggested building liquidity before adding more locked-in tax-saving exposure.",
    action: "Top up emergency fund before new ELSS allocation.",
  },
  {
    id: "family-visibility",
    date: "Feb 21",
    advisor: assignedAdvisor.name,
    category: "Not sure",
    title: "Family account setup",
    summary: "Explored spouse visibility without combining ownership.",
    detail:
      "The investor wanted shared goal tracking for a home down payment while keeping ownership and transaction permissions separate.",
    action: "Set up shared visibility once spouse profile is verified.",
  },
];

function categoryById(id: CategoryId) {
  return categories.find((category) => category.id === id) ?? categories[0];
}

function AdvisorAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-11 w-11" : "h-14 w-14";

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border-2 border-white bg-[linear-gradient(135deg,#00c781,#006bff)] shadow-sm`}
      aria-label={`${assignedAdvisor.name} photo`}
    >
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_24%,#e8fff6_0_18%,transparent_19%),linear-gradient(180deg,#dff7ff_0_44%,#12335f_45%)] text-xs font-black text-white">
        {assignedAdvisor.initials}
      </div>
    </div>
  );
}

function AdvisorIdentityBlock({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`flex gap-3 rounded-3xl border border-[#c8eee1] bg-[linear-gradient(135deg,#f0fff8,#eef7ff)] shadow-sm ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <AdvisorAvatar size={compact ? "sm" : "md"} />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">Assigned advisor</p>
        <h2 className="font-bold text-slate-950">{assignedAdvisor.name}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          Rekha already has your full history — just tell her what&apos;s on your mind.
        </p>
      </div>
    </section>
  );
}

function StepHeader({
  eyebrow,
  title,
  progress,
  onBack,
}: {
  eyebrow: string;
  title: string;
  progress?: number;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700 shadow-sm"
          aria-label="Go back"
        >
          ‹
        </button>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">{eyebrow}</p>
          <h1 className="text-2xl font-bold leading-tight text-slate-950">{title}</h1>
        </div>
      </div>
      {progress ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#00c781,#006bff)]" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </>
  );
}

function BottomAction({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-30 mx-auto w-full max-w-md border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`h-12 w-full rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/10 ${
          disabled
            ? "bg-slate-200 text-slate-400"
            : "bg-[linear-gradient(90deg,#00a76f,#006bff)] text-white"
        }`}
      >
        {label}
      </button>
    </div>
  );
}

export function AdvisorCallsApp() {
  const [step, setStep] = useState<Step>("home");
  const [categoryId, setCategoryId] = useState<CategoryId>("portfolio_review");
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [topicText, setTopicText] = useState(
    "I want to check if my SIPs still match my daughter's education goal after my salary increase.",
  );
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(["education", "retirement"]);
  const [timeMode, setTimeMode] = useState<TimeMode>("suggested");
  const [manualDay, setManualDay] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState<Slot>(suggestedSlots[0]);
  const [calendarConnected, setCalendarConnected] = useState(true);
  const [topicExpanded, setTopicExpanded] = useState(false);
  const [bookingCommitted, setBookingCommitted] = useState(false);
  const [selectedPastCallId, setSelectedPastCallId] = useState(pastCalls[0].id);

  const category = categoryById(categoryId);
  const selectedGoals = goals.filter((goal) => selectedGoalIds.includes(goal.id));
  const topicIsValid = topicText.trim().length > 0;
  const selectedPastCall = pastCalls.find((call) => call.id === selectedPastCallId) ?? pastCalls[0];

  const advisorBrief = useMemo(() => {
    const goalsText = selectedGoals.length ? selectedGoals.map((goal) => goal.label).join(", ") : "no specific goal tag";
    return {
      headline: `${category.title} call with ${assignedAdvisor.name}`,
      summary: `Investor wants to discuss: ${topicText.trim() || "No topic added yet"}`,
      context: `Category metadata: ${category.id}. Goal tags: ${goalsText}. Include recent call memory and portfolio snapshot before the call.`,
    };
  }, [category.id, category.title, selectedGoals, topicText]);

  const chooseCategory = (nextCategoryId: CategoryId) => {
    const nextCategory = categoryById(nextCategoryId);
    setCategoryId(nextCategoryId);
    setCategoryEditorOpen(false);
    setSelectedGoalIds(nextCategory.suggestedGoals);
    if (!topicText.trim()) {
      setTopicText("");
    }
    setStep("context");
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoalIds((current) =>
      current.includes(goalId) ? current.filter((id) => id !== goalId) : [...current, goalId],
    );
  };

  const scheduleFollowUp = () => {
    setCategoryId("portfolio_review");
    setSelectedGoalIds(["education"]);
    setTopicText(`Follow up on ${selectedPastCall.title}: ${selectedPastCall.action}`);
    setStep("context");
  };

  if (step === "history") {
    return (
      <div className="space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Call history" title="Past discussions with Rekha" onBack={() => setStep("home")} />
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Search summaries, categories, or action items
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Portfolio review", "New investment", "Not sure"].map((filter, index) => (
            <span
              key={filter}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                index === 0 ? "bg-[#006bff] text-white" : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {filter}
            </span>
          ))}
        </div>
        <div className="space-y-3">
          {pastCalls.map((call) => (
            <button
              type="button"
              key={call.id}
              onClick={() => {
                setSelectedPastCallId(call.id);
                setStep("detail");
              }}
              className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#006bff]">{call.date}</p>
                <span className="rounded-full bg-[#ecfff7] px-3 py-1 text-xs font-bold text-[#00a76f]">
                  {call.category}
                </span>
              </div>
              <h2 className="mt-2 text-base font-bold text-slate-950">{call.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{call.summary}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">Advisor: {call.advisor}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "detail") {
    return (
      <div className="space-y-5 px-4 pb-28">
        <StepHeader eyebrow={`${selectedPastCall.date} · ${selectedPastCall.advisor}`} title={selectedPastCall.title} onBack={() => setStep("history")} />
        <section className="rounded-3xl border border-[#bcebdc] bg-[linear-gradient(135deg,#f0fff8,#eef7ff)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AdvisorAvatar size="sm" />
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">AI summary</p>
              <h2 className="font-bold text-slate-950">{selectedPastCall.category}</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{selectedPastCall.detail}</p>
        </section>
        <section className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex justify-between gap-4 py-3 first:pt-0">
            <span className="text-sm text-slate-500">Key point</span>
            <strong className="text-right text-sm text-slate-900">{selectedPastCall.summary}</strong>
          </div>
          <div className="flex justify-between gap-4 py-3 last:pb-0">
            <span className="text-sm text-slate-500">Action item</span>
            <strong className="text-right text-sm text-slate-900">{selectedPastCall.action}</strong>
          </div>
        </section>
        <button onClick={scheduleFollowUp} className="h-12 w-full rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] text-sm font-bold text-white">
          Schedule follow-up
        </button>
      </div>
    );
  }

  if (step === "briefing") {
    return (
      <div className="space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Advisor briefing" title="Prepared for Rekha" onBack={() => setStep("home")} />
        <AdvisorIdentityBlock compact />
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Investor profile snapshot</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["₹46.8L", "Portfolio"],
              ["₹62K", "SIP"],
              ["Moderate", "Risk"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3">
                <strong className="block text-sm text-slate-950">{value}</strong>
                <span className="text-[11px] font-semibold text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-[#bcebdc] bg-[linear-gradient(135deg,#f0fff8,#eef7ff)] p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">This booking</p>
          <h2 className="mt-1 font-bold text-slate-950">{advisorBrief.headline}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{advisorBrief.summary}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{advisorBrief.context}</p>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-slate-950">Relevant past calls</h2>
          <div className="mt-3 space-y-3">
            {pastCalls.slice(0, 2).map((call) => (
              <div key={call.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-[#006bff]">{call.date}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{call.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{call.summary}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-2 gap-3">
          <button className="h-12 rounded-2xl bg-[#006bff] text-sm font-bold text-white">Start call</button>
          <button className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
            Add note
          </button>
        </div>
      </div>
    );
  }

  if (step === "category") {
    return (
      <div className="space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Page 1 of 4" title="What's this about?" progress={25} onBack={() => setStep("home")} />
        <div className="space-y-3">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseCategory(item.id)}
              className="flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">
                {item.icon}
              </span>
              <span>
                <strong className="block text-slate-950">{item.title}</strong>
                <small className="mt-1 block text-sm leading-5 text-slate-500">{item.description}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "context") {
    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Page 2 of 4" title="Tell Rekha what is on your mind" progress={50} onBack={() => setStep("category")} />

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ecfff7] px-3 py-2 text-xs font-bold text-[#00a76f]">
              {category.title}
            </span>
            <button
              type="button"
              onClick={() => setCategoryEditorOpen((open) => !open)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => setCategoryId("miscellaneous")}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500"
              aria-label="Remove category"
            >
              ×
            </button>
          </div>
          {categoryEditorOpen ? (
            <div className="mt-3 grid gap-2">
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseCategory(item.id)}
                  className={`rounded-2xl border px-3 py-3 text-left text-sm font-bold ${
                    item.id === categoryId ? "border-[#00a76f] bg-[#ecfff7] text-[#00a76f]" : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <AdvisorIdentityBlock />

        <label className="block text-sm font-bold text-slate-900" htmlFor="topic-text">
          What would you like to discuss?
        </label>
        <textarea
          id="topic-text"
          value={topicText}
          onChange={(event) => setTopicText(event.target.value)}
          placeholder={category.placeholder}
          className="min-h-44 w-full resize-none rounded-3xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 shadow-sm outline-none focus:border-[#00a76f]"
        />
        {!topicIsValid ? <p className="text-sm font-semibold text-rose-600">Add a short note before continuing.</p> : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-950">Optional goal tags</h2>
            <span className="text-xs font-semibold text-slate-500">Multi-select</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => {
              const selected = selectedGoalIds.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold ${
                    selected ? "border-[#006bff] bg-[#eef7ff] text-[#006bff]" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {goal.label}
                </button>
              );
            })}
          </div>
        </section>

        <BottomAction label="Continue" disabled={!topicIsValid} onClick={() => topicIsValid && setStep("time")} />
      </div>
    );
  }

  if (step === "time") {
    const visibleManualSlots = manualSlotsByDay[manualDay] ?? [];

    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Page 3 of 4" title="Find a time with Rekha" progress={75} onBack={() => setStep("context")} />
        <AdvisorIdentityBlock compact />

        {!calendarConnected ? (
          <section className="rounded-3xl border border-[#d7edf8] bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">
                G
              </span>
              <div>
                <h2 className="font-bold text-slate-950">Connect your calendar</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  FundsIndia can suggest times that work for you and Rekha.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCalendarConnected(true)}
              className="mt-4 h-11 w-full rounded-2xl bg-[#006bff] text-sm font-bold text-white"
            >
              Connect calendar
            </button>
          </section>
        ) : timeMode === "suggested" ? (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">AI suggested</p>
                  <h2 className="font-bold text-slate-950">Recommended slots</h2>
                </div>
                <span className="rounded-full bg-[#ecfff7] px-3 py-1 text-xs font-bold text-[#00a76f]">
                  Synced
                </span>
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-600">
                Based on your calendar and {assignedAdvisor.name}&apos;s availability.
              </p>
              <div className="mt-4 grid gap-3">
                {suggestedSlots.map((slot) => {
                  const selected = selectedSlot.day === slot.day && selectedSlot.time === slot.time;
                  return (
                    <button
                      key={`${slot.day}-${slot.time}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left ${
                        selected ? "border-[#006bff] bg-[#eef7ff]" : "border-slate-200 bg-white"
                      }`}
                    >
                      <span>
                        <strong className="block text-slate-950">
                          {slot.day}, {slot.time}
                        </strong>
                        <small className="text-sm text-slate-500">{slot.date}</small>
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#006bff]">{slot.note}</span>
                    </button>
                  );
                })}
              </div>
            </section>
            <button
              type="button"
              onClick={() => setTimeMode("manual")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm"
            >
              Pick a different time
            </button>
          </>
        ) : (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Manual fallback</p>
                  <h2 className="font-bold text-slate-950">Choose another available slot</h2>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {manualDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setManualDay(day)}
                    className={`min-h-16 min-w-20 rounded-2xl border px-3 text-sm font-bold ${
                      manualDay === day ? "border-[#00a76f] bg-[#ecfff7] text-[#00a76f]" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {day}
                    <span className="block text-xs font-medium text-slate-500">
                      {manualSlotsByDay[day]?.[0]?.date.replace(/^\w+\s/, "") ?? "Jul"}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                {visibleManualSlots.map((slot) => {
                  const selected = selectedSlot.day === slot.day && selectedSlot.time === slot.time;
                  return (
                    <button
                      key={`${slot.day}-${slot.time}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left ${
                        selected ? "border-[#006bff] bg-[#eef7ff]" : "border-slate-200 bg-white"
                      }`}
                    >
                      <span>
                        <strong className="block text-slate-950">{slot.time}</strong>
                        <small className="text-sm text-slate-500">{slot.note}</small>
                      </span>
                      {selected ? <span className="text-xs font-bold text-[#006bff]">Selected</span> : null}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setCalendarConnected(true)}
                className="mt-4 text-sm font-bold text-[#006bff]"
              >
                Not seeing enough slots? Sync your calendar
              </button>
            </section>
            <button
              type="button"
              onClick={() => setTimeMode("suggested")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm"
            >
              Back to suggested times
            </button>
          </>
        )}

        <BottomAction label="Confirm booking" onClick={() => setStep("confirm")} />
      </div>
    );
  }

  if (step === "confirm") {
    const visibleTopic = topicExpanded || topicText.length <= 92 ? topicText : `${topicText.slice(0, 92)}...`;

    return (
      <div className="space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Page 4 of 4" title="Confirm your call" progress={100} onBack={() => setStep("time")} />
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <AdvisorAvatar size="md" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">Call with</p>
              <h2 className="font-bold text-slate-950">{assignedAdvisor.name}</h2>
              <p className="text-sm text-slate-500">{selectedSlot.day}, {selectedSlot.date} · {selectedSlot.time}</p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            <div className="flex justify-between gap-4 py-3">
              <span className="text-sm text-slate-500">Category</span>
              <strong className="text-right text-sm text-slate-900">{category.title}</strong>
            </div>
            <div className="py-3">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500">Your note</span>
                <p className="max-w-[210px] text-right text-sm font-bold leading-5 text-slate-900">{visibleTopic}</p>
              </div>
              {topicText.length > 92 ? (
                <button
                  type="button"
                  onClick={() => setTopicExpanded((expanded) => !expanded)}
                  className="mt-2 text-sm font-bold text-[#006bff]"
                >
                  {topicExpanded ? "Show less" : "Read full note"}
                </button>
              ) : null}
            </div>
            <div className="flex justify-between gap-4 py-3">
              <span className="text-sm text-slate-500">Goal tags</span>
              <strong className="text-right text-sm text-slate-900">
                {selectedGoals.length ? selectedGoals.map((goal) => goal.label).join(", ") : "None"}
              </strong>
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-[#bcebdc] bg-[linear-gradient(135deg,#f0fff8,#eef7ff)] p-4 shadow-sm">
          <p className="text-sm leading-6 text-slate-700">
            {assignedAdvisor.name} will review your notes and recent call history before the call.
          </p>
          <p className="mt-2 text-sm font-semibold text-[#00a76f]">Calendar event added to your synced calendar.</p>
        </section>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStep("context")}
            className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm"
          >
            Edit details
          </button>
          <button
            type="button"
            onClick={() => setStep("time")}
            className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm"
          >
            Change time
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setBookingCommitted(true);
            setStep("home");
          }}
          className="h-12 w-full rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] text-sm font-bold text-white shadow-lg shadow-emerald-900/10"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-28">
      <section className="overflow-hidden rounded-[28px] border border-[#caefe3] bg-[linear-gradient(135deg,#f0fff8_0%,#eef7ff_54%,#ffffff_100%)] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <Image
            src="/fundsindia-logo.png"
            alt="FundsIndia"
            width={132}
            height={69}
            className="h-10 w-auto object-contain mix-blend-multiply"
          />
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#006bff] shadow-sm">Advisor ready</span>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-normal text-[#00a76f]">Advisor calls</p>
        <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950">Talk to your advisor</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Rekha already knows your portfolio, goals, and past conversations. Tell her what feels unclear and pick a time.
        </p>
        <button onClick={() => setStep("category")} className="mt-5 h-12 rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10">
          Talk to your advisor
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Upcoming calls</h2>
          <button onClick={() => setStep("history")} className="text-sm font-bold text-slate-500">
            History
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <strong>{bookingCommitted ? "28" : "21"}</strong>
            <span className="text-xs text-slate-500">Jul</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-950">{bookingCommitted ? category.title : "Education goal review"}</h3>
            <p className="text-sm text-slate-500">
              {bookingCommitted ? selectedSlot.time : "11:30 AM"} · {assignedAdvisor.name}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => setStep("context")} className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
            Add context
          </button>
          <button onClick={() => setStep("briefing")} className="h-11 rounded-2xl bg-[#006bff] text-sm font-bold text-white">
            Advisor brief
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Suggested for you</h2>
          <span className="text-sm text-slate-500">Contextual trigger</span>
        </div>
        <button
          onClick={() => {
            setCategoryId("portfolio_review");
            setSelectedGoalIds(["education"]);
            setTopicText("I want to talk through whether my current SIP still matches my daughter's education goal.");
            setStep("context");
          }}
          className="flex w-full gap-3 rounded-3xl border border-[#d7edf8] bg-white p-4 text-left shadow-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-bold text-[#006bff]">
            SIP
          </span>
          <span>
            <strong className="block text-slate-950">Want to talk this through with Rekha first?</strong>
            <small className="mt-1 block text-sm leading-5 text-slate-600">
              Your SIP is close to the education goal plan. Ask Rekha before changing it.
            </small>
          </span>
        </button>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Recent discussions</h2>
          <button onClick={() => setStep("history")} className="text-sm font-bold text-slate-500">
            View all
          </button>
        </div>
        <div className="space-y-3">
          {pastCalls.slice(0, 2).map((call) => (
            <button
              key={call.id}
              onClick={() => {
                setSelectedPastCallId(call.id);
                setStep("detail");
              }}
              className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="block text-slate-950">{call.title}</strong>
                <span className="shrink-0 rounded-full bg-[#ecfff7] px-2 py-1 text-[11px] font-bold text-[#00a76f]">
                  {call.category}
                </span>
              </div>
              <span className="mt-1 block text-sm text-slate-500">
                {call.date} · {call.summary}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
