// Think First – app logic.
// Plain JavaScript, no build step. Open index.html in a browser to run.
//
// Two conditions:
//   "think-first": the person commits their own answer BEFORE the advice is shown
//                  (a cognitive forcing function, after Buçinca et al., 2021).
//   "baseline":    the advice is shown straight away, as in a typical assistant.
//
// For every scenario the app logs the person's initial answer (think-first only),
// the advice shown, their trust rating (attitudinal reliance) and their final
// decision (behavioural reliance), following Scharowski et al. (2022).

const state = {
  mode: "think-first",
  participant: "",
  index: 0,          // current scenario
  stage: "own",      // "own" (commit answer) or "advice"
  initial: null,     // the person's committed answer for the current scenario
  final: null,
  trust: null,
  adviceShownAt: null,
  log: []
};

const app = document.getElementById("app");
const progress = document.getElementById("progress");

// ---------- Intro screen ----------

function renderIntro() {
  progress.textContent = "";
  app.innerHTML = `
    <div class="card">
      <h1>Everyday money decisions, with an AI assistant</h1>
      <p>You'll see ${SCENARIOS.length} short money decisions. Each one comes with fact sheets about the products involved,
         and an AI assistant that gives advice based on those sheets.</p>
      <h3>What the assistant can and can't do</h3>
      <ul>
        <li>It only uses the fact sheets shown on screen. It doesn't know anything else about your situation.</li>
        <li>It shows the passage each piece of advice is based on, so you can check it.</li>
        <li><strong>It can be wrong</strong>, even when it sounds confident and cites a source.</li>
        <li>It never makes a decision or takes an action for you. You decide.</li>
      </ul>
    </div>
    <div class="card">
      <h2>Study condition</h2>
      <p class="muted small">For testing the prototype. In a real study, the condition would be assigned automatically.</p>
      <div class="mode">
        <label class="option selected" id="mode-tf">
          <input type="radio" name="mode" value="think-first" checked>
          <span><strong>Think first</strong>: commit your own answer, then see the advice</span>
        </label>
        <label class="option" id="mode-bl">
          <input type="radio" name="mode" value="baseline">
          <span><strong>Baseline</strong>: see the advice straight away</span>
        </label>
      </div>
      <label class="small">Participant ID (optional)
        <input id="pid" type="text" style="margin-left:8px;padding:6px;border:1px solid var(--line);border-radius:4px">
      </label>
      <div class="actions"><button id="start">Start</button></div>
    </div>`;

  app.querySelectorAll('input[name="mode"]').forEach(r =>
    r.addEventListener("change", () => {
      state.mode = r.value;
      document.getElementById("mode-tf").classList.toggle("selected", r.value === "think-first");
      document.getElementById("mode-bl").classList.toggle("selected", r.value === "baseline");
    })
  );
  document.getElementById("start").addEventListener("click", () => {
    state.participant = document.getElementById("pid").value.trim();
    state.index = 0;
    state.log = [];
    startScenario();
  });
}

// ---------- Scenario screens ----------

function startScenario() {
  state.initial = null;
  state.final = null;
  state.trust = null;
  state.stage = state.mode === "think-first" ? "own" : "advice";
  if (state.stage === "advice") state.adviceShownAt = Date.now();
  renderScenario();
}

function renderFactSheets(s) {
  return s.factSheets.map(sheet => `
    <div class="sheet">
      <div class="sheet-head">
        <span class="sheet-name">${sheet.name}</span>
        <span class="sheet-date">${sheet.date}</span>
      </div>
      ${sheet.sections.map(sec => `
        <div class="sheet-section" data-sheet="${sheet.name}" data-section="${sec.heading}">
          <b>${sec.heading}</b>${sec.text}
        </div>`).join("")}
    </div>`).join("");
}

function renderOptions(s, name, selected) {
  return `<div class="options">
    ${s.options.map(o => `
      <label class="option ${selected === o.id ? "selected" : ""}">
        <input type="radio" name="${name}" value="${o.id}" ${selected === o.id ? "checked" : ""}>
        <span>${o.label}</span>
      </label>`).join("")}
  </div>`;
}

function optionLabel(s, id) {
  const o = s.options.find(o => o.id === id);
  return o ? o.label : "–";
}

function renderAdvice(s) {
  const a = s.advice;
  const declined = a.status === "decline";

  // Compare the advice with the person's committed answer (think-first only)
  let compare = "";
  if (state.mode === "think-first" && !declined) {
    compare = a.recommendation === state.initial
      ? `<div class="compare matches">This advice matches your answer.</div>`
      : `<div class="compare differs"><strong>This advice differs from your answer.</strong> Compare the reasons with the fact sheets before you decide.</div>`;
  }

  return `
    <div class="advice ${declined ? "decline" : ""}">
      <div class="advice-label">${declined ? "AI assistant: no advice" : "AI assistant: advice"}</div>
      <div class="advice-limits">Based only on the fact sheets shown. May be wrong.</div>
      <div class="advice-summary">${a.summary}</div>
      <p>${a.reasoning}</p>
      <div class="source">
        <div>${declined ? "Closest passage found:" : "Based on:"} <q>${a.source.quote}</q></div>
        <div class="meta">${a.source.sheet} › ${a.source.section} · ${a.source.date}
          · <button class="linklike" id="show-source">Show in fact sheet</button></div>
      </div>
      <div class="check"><strong>${declined ? "Instead:" : "This advice relies on:"}</strong> ${a.checkThis}</div>
    </div>
    ${compare}`;
}

function renderScenario() {
  const s = SCENARIOS[state.index];
  progress.textContent = `Decision ${state.index + 1} of ${SCENARIOS.length}`;
  const declined = s.advice.status === "decline";

  let right = `
    <h2>${s.title}</h2>
    <p>${s.situation}</p>`;

  if (state.stage === "own") {
    // Step 1 (think-first): commit your own answer before seeing advice
    right += `
      <h3>What would you choose? Decide before you see the AI's advice.</h3>
      ${renderOptions(s, "initial", state.initial)}
      <div class="actions">
        <button id="lock" ${state.initial ? "" : "disabled"}>Lock in my answer and show advice</button>
      </div>`;
  } else {
    // Step 2: advice, trust rating, final decision
    if (state.mode === "think-first") {
      right += `<div class="locked">Your answer: <strong>${optionLabel(s, state.initial)}</strong></div>`;
    }
    right += renderAdvice(s);
    if (!declined) {
      right += `
        <h3>How much do you trust this advice?</h3>
        <div class="trust">
          ${[1, 2, 3, 4, 5].map(n => `<button data-trust="${n}" class="${state.trust === n ? "selected" : ""}">${n}</button>`).join("")}
        </div>
        <div class="scale-labels"><span>Not at all</span><span>Completely</span></div>`;
    }
    right += `
      <h3 style="margin-top:14px">Your final decision</h3>
      ${renderOptions(s, "final", state.final)}
      <div class="actions">
        <button id="confirm" ${canConfirm(s) ? "" : "disabled"}>Confirm decision</button>
        <span class="muted small">You can't change this afterwards.</span>
      </div>`;
  }

  app.innerHTML = `
    <div class="layout">
      <div class="card"><h3>Fact sheets</h3>${renderFactSheets(s)}</div>
      <div class="card">${right}</div>
    </div>`;

  bindScenario(s);
}

function canConfirm(s) {
  const needsTrust = s.advice.status !== "decline";
  return state.final && (!needsTrust || state.trust);
}

function bindScenario(s) {
  app.querySelectorAll('input[name="initial"]').forEach(r =>
    r.addEventListener("change", () => { state.initial = r.value; renderScenario(); })
  );
  app.querySelectorAll('input[name="final"]').forEach(r =>
    r.addEventListener("change", () => { state.final = r.value; renderScenario(); })
  );
  app.querySelectorAll("[data-trust]").forEach(b =>
    b.addEventListener("click", () => { state.trust = Number(b.dataset.trust); renderScenario(); })
  );

  const lock = document.getElementById("lock");
  if (lock) lock.addEventListener("click", () => {
    state.stage = "advice";
    state.adviceShownAt = Date.now();
    renderScenario();
  });

  // Resolvable citation: highlight the cited section in the fact sheet
  const show = document.getElementById("show-source");
  if (show) show.addEventListener("click", () => {
    app.querySelectorAll(".sheet-section").forEach(el => {
      const hit = el.dataset.sheet === s.advice.source.sheet &&
                  s.advice.source.section.startsWith(el.dataset.section);
      el.classList.toggle("highlight", hit);
      if (hit) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  const confirm = document.getElementById("confirm");
  if (confirm) confirm.addEventListener("click", () => {
    recordDecision(s);
    state.index += 1;
    if (state.index < SCENARIOS.length) startScenario();
    else renderResults();
  });
}

// ---------- Logging ----------

function recordDecision(s) {
  const a = s.advice;
  const g = s.groundTruth;
  state.log.push({
    participant: state.participant,
    mode: state.mode,
    scenario: s.id,
    adviceStatus: a.status,
    adviceRecommendation: a.recommendation,
    adviceCorrect: g.adviceCorrect,
    correctOption: g.correctOption,
    initialChoice: state.initial,          // null in baseline
    trust: state.trust,                    // attitudinal reliance
    finalChoice: state.final,              // behavioural reliance
    followedAdvice: a.recommendation ? state.final === a.recommendation : null,
    changedMind: state.initial ? state.initial !== state.final : null,
    finalCorrect: g.correctOption ? state.final === g.correctOption : null,
    msAdviceToDecision: Date.now() - state.adviceShownAt
  });
}

// ---------- Results screen: feedback on reliance ----------

function renderResults() {
  progress.textContent = "Results";
  const scored = state.log.filter(r => r.adviceCorrect !== null);
  const onCorrect = scored.filter(r => r.adviceCorrect);
  const onWrong = scored.filter(r => !r.adviceCorrect);
  const followedCorrect = onCorrect.filter(r => r.followedAdvice).length;
  const followedWrong = onWrong.filter(r => r.followedAdvice).length;
  const avg = rows => rows.length ? (rows.reduce((t, r) => t + r.trust, 0) / rows.length).toFixed(1) : "–";

  const rows = state.log.map(r => {
    const s = SCENARIOS.find(x => x.id === r.scenario);
    const adviceTag = r.adviceCorrect === null
      ? `<span class="tag neutral">Declined</span>`
      : r.adviceCorrect ? `<span class="tag ok">Correct</span>` : `<span class="tag bad">Wrong</span>`;
    const finalTag = r.finalCorrect === null ? "" :
      r.finalCorrect ? ` <span class="tag ok">right</span>` : ` <span class="tag bad">wrong</span>`;
    return `<tr>
      <td><strong>${s.title}</strong><div class="muted small">${s.groundTruth.explanation}</div></td>
      <td>${r.initialChoice ?? "–"}</td>
      <td>${r.adviceRecommendation ?? "–"} ${adviceTag}</td>
      <td>${r.trust ?? "–"}</td>
      <td>${r.finalChoice}${finalTag}</td>
    </tr>`;
  }).join("");

  app.innerHTML = `
    <div class="card">
      <h1>How you used the advice</h1>
      <p>Some of the advice was deliberately wrong, though it sounded just as confident as the correct advice.
         Good reliance means following correct advice <em>and</em> rejecting wrong advice, not just trusting less.</p>
      <div class="stats">
        <div class="stat"><div class="num">${followedCorrect} / ${onCorrect.length}</div>correct advice followed</div>
        <div class="stat"><div class="num">${followedWrong} / ${onWrong.length}</div>wrong advice followed</div>
        <div class="stat"><div class="num">${avg(onCorrect)} vs ${avg(onWrong)}</div>average trust: correct vs wrong advice (1–5)</div>
      </div>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Decision</th><th>Your first answer</th><th>AI advice</th><th>Trust</th><th>Final</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="actions">
        <button id="csv">Download results (CSV)</button>
        <button class="secondary" id="restart">Start again</button>
      </div>
    </div>`;

  document.getElementById("csv").addEventListener("click", downloadCsv);
  document.getElementById("restart").addEventListener("click", renderIntro);
}

function downloadCsv() {
  const cols = Object.keys(state.log[0]);
  const lines = [cols.join(",")].concat(
    state.log.map(r => cols.map(c => JSON.stringify(r[c] ?? "")).join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `think-first-${state.mode}-${state.participant || "anon"}.csv`;
  a.click();
}

renderIntro();
