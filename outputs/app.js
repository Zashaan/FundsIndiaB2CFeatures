const state = {
  topic: "Portfolio review",
  advisor: "Meera Iyer",
  specialty: "Goal planning specialist",
  day: "Today",
  time: "11:30 AM",
  calendarConnected: false,
};

const notes = document.querySelector("#meeting-notes");
const briefText = document.querySelector("#brief-text");
const briefTags = document.querySelector("#brief-tags");
const prepTopic = document.querySelector("#prep-topic");
const prepConcern = document.querySelector("#prep-concern");
const selectedCall = document.querySelector("#selected-call");
const calendarState = document.querySelector("#calendar-state");
const toast = document.querySelector("#toast");

function setActive(elements, selected) {
  elements.forEach((element) => element.classList.toggle("active", element === selected));
}

function updateSelectedCall() {
  selectedCall.textContent = `${state.day} · ${state.time} with ${state.advisor}`;
}

function extractTags(text, topic) {
  const normalized = text.toLowerCase();
  const tags = new Set([topic]);

  if (normalized.includes("education") || normalized.includes("daughter") || normalized.includes("college")) tags.add("Education goal");
  if (normalized.includes("salary") || normalized.includes("income") || normalized.includes("bonus")) tags.add("Income change");
  if (normalized.includes("sip")) tags.add("SIP adequacy");
  if (normalized.includes("debt") || normalized.includes("safe") || normalized.includes("risk")) tags.add("Risk comfort");
  if (normalized.includes("tax") || normalized.includes("redeem")) tags.add("Tax impact");
  if (normalized.includes("spouse") || normalized.includes("family")) tags.add("Family planning");

  return [...tags].slice(0, 5);
}

function summarizeNote() {
  const text = notes.value.trim();
  const fallback = "Investor has not added a note yet. Advisor should start by asking what decision they want help making.";
  const firstSentence = text ? text.replace(/\s+/g, " ").split(/[.!?]/)[0] : fallback;
  const topicPhrase = state.topic.toLowerCase();
  const historyPhrase = document.querySelector("#share-history").checked
    ? " Prior conversation summaries should be reviewed before the call."
    : "";

  briefText.textContent = text
    ? `Ananya needs help with ${topicPhrase}. Main concern: ${firstSentence}.${historyPhrase}`
    : fallback;

  const tags = extractTags(text, state.topic);
  briefTags.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join("");
  prepTopic.textContent = state.topic;
  prepConcern.textContent = tags.length > 1 ? tags.slice(1).join(", ") + "." : "Clarify investor concern during the call.";
}

document.querySelectorAll(".topic-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.topic = button.dataset.topic;
    setActive(document.querySelectorAll(".topic-card"), button);
    summarizeNote();
  });
});

document.querySelectorAll(".advisor-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.advisor = button.dataset.advisor;
    state.specialty = button.dataset.specialty;
    setActive(document.querySelectorAll(".advisor-option"), button);
    updateSelectedCall();
  });
});

document.querySelectorAll(".chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.day = button.dataset.day;
    setActive(document.querySelectorAll(".chip"), button);
    updateSelectedCall();
  });
});

document.querySelectorAll(".slot").forEach((button) => {
  button.addEventListener("click", () => {
    state.time = button.dataset.time;
    setActive(document.querySelectorAll(".slot"), button);
    updateSelectedCall();
  });
});

document.querySelector("#generate-brief").addEventListener("click", summarizeNote);

document.querySelector("#share-history").addEventListener("change", summarizeNote);

document.querySelector("#connect-calendar").addEventListener("click", (event) => {
  state.calendarConnected = !state.calendarConnected;
  event.target.textContent = state.calendarConnected ? "Google Calendar connected" : "Connect Google Calendar";
  calendarState.innerHTML = state.calendarConnected
    ? `<div class="calendar-icon">G</div><div><strong>Google Calendar connected</strong><span>Showing slots that avoid investor and advisor conflicts.</span></div>`
    : `<div class="calendar-icon">G</div><div><strong>Calendar not connected</strong><span>Slots are based on advisor availability only.</span></div>`;
});

document.querySelector("#schedule-call").addEventListener("click", () => {
  toast.textContent = `${state.day} at ${state.time} is booked with ${state.advisor}. Advisor brief and prior summaries have been attached.`;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3600);
});

document.querySelector("#clear-form").addEventListener("click", () => {
  notes.value = "";
  state.topic = "Portfolio review";
  setActive(document.querySelectorAll(".topic-card"), document.querySelector(".topic-card"));
  summarizeNote();
});

document.querySelector("#history-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll(".timeline-item").forEach((item) => {
    const haystack = `${item.textContent} ${item.dataset.keywords}`.toLowerCase();
    item.classList.toggle("hidden", query.length > 0 && !haystack.includes(query));
  });
});

summarizeNote();
updateSelectedCall();
