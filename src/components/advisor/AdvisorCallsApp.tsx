"use client";

import { useMemo, useState } from "react";

type Step = "home" | "topic" | "context" | "brief" | "advisor" | "time" | "confirm" | "success" | "history" | "detail";

type Topic = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type Advisor = {
  id: string;
  name: string;
  specialty: string;
  languages: string;
  nextSlot: string;
  initials: string;
};

const topics: Topic[] = [
  {
    id: "portfolio",
    title: "Portfolio review",
    description: "Check allocation, underperformers, and next steps.",
    icon: "PR",
  },
  {
    id: "sip",
    title: "SIP increase",
    description: "Discuss income changes and goal timelines.",
    icon: "SI",
  },
  {
    id: "tax",
    title: "Tax or redemption",
    description: "Understand exit load, capital gains, and cash needs.",
    icon: "TX",
  },
  {
    id: "family",
    title: "Family goals",
    description: "Coordinate spouse, children, and shared goals.",
    icon: "FG",
  },
  {
    id: "nri",
    title: "NRI investing",
    description: "Handle account rules, remittance, and India goals.",
    icon: "NR",
  },
];

const advisors: Advisor[] = [
  {
    id: "meera",
    name: "Meera Iyer",
    specialty: "Goal planning specialist",
    languages: "English, Hindi",
    nextSlot: "Today 11:30 AM",
    initials: "MI",
  },
  {
    id: "rohan",
    name: "Rohan Menon",
    specialty: "Tax and redemption specialist",
    languages: "English, Malayalam",
    nextSlot: "Tomorrow 2:00 PM",
    initials: "RM",
  },
];

const priorCalls = [
  {
    date: "Jun 16",
    title: "Education goal recalibration",
    summary: "Discussed increasing SIP by ₹12,000 if bonus income becomes recurring.",
    tag: "Follow-up due",
  },
  {
    date: "Apr 09",
    title: "Tax-saving funds and liquidity",
    summary: "No redemption recommended because emergency fund was below target.",
    tag: "ELSS",
  },
  {
    date: "Feb 21",
    title: "Family account setup",
    summary: "Explored spouse visibility for shared home down-payment tracking.",
    tag: "Family goals",
  },
];

const slots = ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM", "6:00 PM"];
const dates = ["Today", "Wed", "Thu", "Fri"];

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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700"
          aria-label="Go back"
        >
          ‹
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">{eyebrow}</p>
          <h1 className="text-2xl font-bold leading-tight text-slate-950">{title}</h1>
        </div>
      </div>
      {progress ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </>
  );
}

function BottomAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-30 mx-auto w-full max-w-md border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
      <button
        type="button"
        onClick={onClick}
        className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-sm"
      >
        {label}
      </button>
    </div>
  );
}

export function AdvisorCallsApp() {
  const [step, setStep] = useState<Step>("home");
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [note, setNote] = useState(
    "I want to know if my current SIP is enough for my daughter's education goal. My salary increased recently and I am unsure whether to add more to equity funds or keep money in safer debt funds.",
  );
  const [includeHistory, setIncludeHistory] = useState(true);
  const [sharePortfolio, setSharePortfolio] = useState(true);
  const [selectedAdvisor, setSelectedAdvisor] = useState(advisors[0]);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState("11:30 AM");
  const [calendarConnected, setCalendarConnected] = useState(false);

  const brief = useMemo(() => {
    const firstSentence = note.trim().split(/[.!?]/)[0] || "The investor wants guidance before taking action";
    const priorContext = includeHistory ? " Prior call summaries will be attached for context." : "";
    return `Ritik needs help with ${selectedTopic.title.toLowerCase()}. Main concern: ${firstSentence}.${priorContext}`;
  }, [includeHistory, note, selectedTopic.title]);

  const goBack = () => {
    const order: Step[] = ["home", "topic", "context", "brief", "advisor", "time", "confirm", "success"];
    const currentIndex = order.indexOf(step);
    setStep(currentIndex > 1 ? order[currentIndex - 1] : "home");
  };

  if (step === "history") {
    return (
      <div className="space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Memory" title="Previous advisor calls" onBack={() => setStep("home")} />
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Search summaries, topics, advisors
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Goals", "Tax", "SIP"].map((filter, index) => (
            <span
              key={filter}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                index === 0 ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {filter}
            </span>
          ))}
        </div>
        <div className="space-y-3">
          {priorCalls.map((call) => (
            <button
              type="button"
              key={call.title}
              onClick={() => setStep("detail")}
              className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left"
            >
              <p className="text-xs font-bold text-cyan-700">{call.date}</p>
              <h2 className="mt-1 text-base font-bold text-slate-950">{call.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{call.summary}</p>
              <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {call.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "detail") {
    return (
      <div className="space-y-5 px-4 pb-28">
        <StepHeader eyebrow="Jun 16 · Meera Iyer" title="Education goal recalibration" onBack={() => setStep("history")} />
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
          <h2 className="text-base font-bold text-slate-950">Summary</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Discussed increasing SIP by ₹12,000 if bonus income becomes recurring. Advisor suggested a risk review
            before adding more equity.
          </p>
        </section>
        <section className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-4">
          {[
            ["Decision", "Wait for salary revision confirmation"],
            ["Action item", "Review goal projection in July"],
            ["Related goal", "Daughter's education"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-slate-500">{label}</span>
              <strong className="text-right text-sm text-slate-900">{value}</strong>
            </div>
          ))}
        </section>
        <button className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white">Schedule follow-up</button>
        <button className="h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
          Download summary
        </button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="space-y-5 px-4 pb-28">
        <section className="mt-8 rounded-3xl bg-white p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-2xl font-bold text-emerald-700">
            OK
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Call scheduled</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {selectedAdvisor.name} will review your brief before the call.
          </p>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
              <strong>21</strong>
              <span className="text-xs text-slate-500">Jul</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-950">{selectedTopic.title}</h2>
              <p className="text-sm text-slate-500">
                {selectedSlot} · {selectedAdvisor.name}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
              Add calendar
            </button>
            <button onClick={() => setStep("home")} className="h-11 rounded-2xl bg-emerald-600 text-sm font-bold text-white">
              Done
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (step === "topic") {
    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 1 of 5" title="What do you need help with?" progress={20} onBack={goBack} />
        <div className="space-y-3">
          {topics.map((topic) => (
            <button
              type="button"
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`flex w-full items-center gap-3 rounded-3xl border p-4 text-left ${
                selectedTopic.id === topic.id
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-bold text-emerald-700">
                {topic.icon}
              </span>
              <span>
                <strong className="block text-slate-950">{topic.title}</strong>
                <small className="mt-1 block text-sm leading-5 text-slate-500">{topic.description}</small>
              </span>
            </button>
          ))}
        </div>
        <BottomAction label="Continue" onClick={() => setStep("context")} />
      </div>
    );
  }

  if (step === "context") {
    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 2 of 5" title="Tell your advisor what is on your mind" progress={40} onBack={goBack} />
        <label className="block text-sm font-bold text-slate-900" htmlFor="advisor-note">
          Investor note
        </label>
        <textarea
          id="advisor-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="min-h-40 w-full resize-none rounded-3xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 outline-none focus:border-emerald-500"
        />
        <div className="flex flex-wrap gap-2">
          {["Is my SIP enough?", "Should I redeem?", "How much tax?"].map((prompt) => (
            <button key={prompt} type="button" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              {prompt}
            </button>
          ))}
        </div>
        <section className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex justify-between gap-4 py-3 first:pt-0">
            <span className="text-sm text-slate-500">Goal</span>
            <strong className="text-right text-sm text-slate-900">Daughter&apos;s education</strong>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <span className="text-sm text-slate-500">Portfolio area</span>
            <strong className="text-right text-sm text-slate-900">Equity mutual funds</strong>
          </div>
        </section>
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
          <label className="flex items-center justify-between gap-4 text-sm font-bold text-slate-900">
            Include previous call summaries
            <input type="checkbox" checked={includeHistory} onChange={(event) => setIncludeHistory(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm font-bold text-slate-900">
            Share portfolio snapshot
            <input type="checkbox" checked={sharePortfolio} onChange={(event) => setSharePortfolio(event.target.checked)} />
          </label>
        </section>
        <BottomAction label="Create advisor brief" onClick={() => setStep("brief")} />
      </div>
    );
  }

  if (step === "brief") {
    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 3 of 5" title="Review what your advisor will see" progress={60} onBack={goBack} />
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-950">Advisor brief</h2>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">Ready</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{brief}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Education goal", "SIP adequacy", "Income change", "Risk comfort"].map((tag) => (
              <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-slate-950">Prior context attached</h2>
          <div className="mt-3 space-y-3">
            {priorCalls.slice(0, includeHistory ? 2 : 0).map((call) => (
              <div key={call.title} className="flex justify-between gap-4 border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                <span className="text-sm text-cyan-700">{call.date}</span>
                <strong className="text-right text-sm text-slate-900">{call.title}</strong>
              </div>
            ))}
            {!includeHistory ? <p className="text-sm text-slate-500">Prior call summaries are not included.</p> : null}
          </div>
        </section>
        <button onClick={() => setStep("context")} className="h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
          Edit brief
        </button>
        <BottomAction label="Continue" onClick={() => setStep("advisor")} />
      </div>
    );
  }

  if (step === "advisor") {
    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 4 of 5" title="Choose who you want to speak with" progress={80} onBack={goBack} />
        <button className="flex w-full items-center gap-3 rounded-3xl border border-emerald-600 bg-emerald-50 p-4 text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            FI
          </span>
          <span className="min-w-0">
            <strong className="block text-slate-950">Best available advisor</strong>
            <small className="block text-sm text-slate-600">Fastest conflict-free slot for this topic</small>
          </span>
        </button>
        <div className="space-y-3">
          {advisors.map((advisor) => (
            <button
              key={advisor.id}
              type="button"
              onClick={() => setSelectedAdvisor(advisor)}
              className={`w-full rounded-3xl border p-4 text-left ${
                selectedAdvisor.id === advisor.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {advisor.initials}
                </span>
                <span>
                  <strong className="block text-slate-950">{advisor.name}</strong>
                  <small className="text-sm text-slate-500">{advisor.specialty}</small>
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{advisor.languages}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">Next: {advisor.nextSlot}</span>
              </div>
            </button>
          ))}
        </div>
        <BottomAction label="Choose time" onClick={() => setStep("time")} />
      </div>
    );
  }

  if (step === "time") {
    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Step 5 of 5" title="Pick a conflict-free time" progress={100} onBack={goBack} />
        <button
          type="button"
          onClick={() => setCalendarConnected((connected) => !connected)}
          className="flex w-full gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-bold text-cyan-700">
            G
          </span>
          <span>
            <strong className="block text-slate-950">
              {calendarConnected ? "Google Calendar connected" : "Connect Google Calendar"}
            </strong>
            <small className="mt-1 block text-sm leading-5 text-slate-600">
              {calendarConnected
                ? "Showing slots that avoid investor and advisor conflicts."
                : "Suggest times that avoid conflicts for you and the advisor."}
            </small>
          </span>
        </button>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`min-h-16 min-w-20 rounded-2xl border px-3 text-sm font-bold ${
                selectedDate === date ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {date}
              <span className="block text-xs font-medium text-slate-500">Jul</span>
            </button>
          ))}
        </div>
        <section>
          <h2 className="mb-3 text-base font-bold text-slate-950">Available slots</h2>
          <div className="grid grid-cols-2 gap-3">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`h-12 rounded-2xl border text-sm font-bold ${
                  selectedSlot === slot ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Selected</p>
          <h2 className="mt-1 font-bold text-slate-950">
            {selectedDate} · {selectedSlot} with {selectedAdvisor.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">30 min phone call · IST</p>
        </section>
        <BottomAction label="Review booking" onClick={() => setStep("confirm")} />
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="space-y-5 px-4 pb-36">
        <StepHeader eyebrow="Confirm" title="Review and schedule" onBack={goBack} />
        <section className="rounded-3xl bg-white p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-sm font-bold text-emerald-700">
            OK
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">Advisor is ready with your context</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your brief, related goal, and past conversation summaries will be attached.
          </p>
        </section>
        <section className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-4">
          {[
            ["Topic", selectedTopic.title],
            ["Advisor", selectedAdvisor.name],
            ["Time", `${selectedDate}, ${selectedSlot}`],
            ["Calendar", calendarConnected ? "Connected" : "Not connected"],
            ["Portfolio snapshot", sharePortfolio ? "Shared" : "Not shared"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <span className="text-sm text-slate-500">{label}</span>
              <strong className="text-right text-sm text-slate-900">{value}</strong>
            </div>
          ))}
        </section>
        <BottomAction label="Schedule call" onClick={() => setStep("success")} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-28">
      <section className="rounded-3xl bg-emerald-50 p-5">
        <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">Advisor calls</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-950">Get guidance with context already prepared</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Schedule a call for your portfolio, SIPs, goals, taxes, or redemptions. Your advisor sees the right
          context before the conversation starts.
        </p>
        <button onClick={() => setStep("topic")} className="mt-4 h-11 rounded-full bg-emerald-600 px-5 text-sm font-bold text-white">
          Schedule a call
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Upcoming</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Confirmed</span>
        </div>
        <div className="flex gap-3">
          <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <strong>21</strong>
            <span className="text-xs text-slate-500">Jul</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-950">Education goal review</h3>
            <p className="text-sm text-slate-500">11:30 AM · Meera Iyer</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => setStep("context")} className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
            Add context
          </button>
          <button onClick={() => setStep("detail")} className="h-11 rounded-2xl bg-emerald-600 text-sm font-bold text-white">
            View details
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Suggested for you</h2>
          <span className="text-sm text-slate-500">Based on goals</span>
        </div>
        <button
          onClick={() => {
            setSelectedTopic(topics[1]);
            setStep("context");
          }}
          className="flex w-full gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-xs font-bold text-cyan-700">
            SI
          </span>
          <span>
            <strong className="block text-slate-950">Salary increased recently?</strong>
            <small className="mt-1 block text-sm leading-5 text-slate-600">
              Review whether your SIP should change for your daughter&apos;s education goal.
            </small>
          </span>
        </button>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Recent conversations</h2>
          <button onClick={() => setStep("history")} className="text-sm font-bold text-slate-500">
            View all
          </button>
        </div>
        <div className="space-y-3">
          {priorCalls.slice(0, 2).map((call) => (
            <button
              key={call.title}
              onClick={() => setStep("detail")}
              className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left"
            >
              <strong className="block text-slate-950">{call.title}</strong>
              <span className="text-sm text-slate-500">
                {call.date} · {call.tag}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
