# Think First: an AI advice prototype for calibrated reliance

Interactive Intelligent Systems, Assignment 2.
README prose word count: about 780 (excluding code, commands and file paths).

Think First is a browser prototype. It tests whether asking people to commit their own answer before they see an AI's advice helps them follow correct advice and reject wrong advice on everyday money decisions.

## Project status

| Part | Status |
|---|---|
| 7 decision scenarios with fictional, dated fact sheets | Implemented |
| Think First condition (commit an answer before advice is shown) and Baseline condition | Implemented |
| Advice card with cited passage, date, "Show in fact sheet" and "relies on" facts | Implemented |
| Differs/matches flag comparing the advice with the person's answer | Implemented |
| Decline when the question is outside the fact sheets | Implemented (one scripted case) |
| Trust rating (1–5) and final decision, logged per scenario; CSV download | Implemented |
| Results screen: correct vs wrong advice followed, with explanations | Implemented |
| AI advice | **Simulated**: pre-scripted in the same JSON shape a live model would return (3 correct, 3 wrong, 1 decline) |
| Live LLM pipeline (retrieval, context assembly, model call, validator) | Planned |
| Study with participants and analysis by condition | Planned |
| Adaptive forcing (commit-first only for high-stakes decisions) | Planned |

## Technology stack

- **HTML, CSS and plain JavaScript.** No framework or build step, so anyone can open and inspect it.
- **`scenarios.js`**: scenario data, fact sheets, scripted advice and hidden ground truth.
- **`app.js`**: conditions, the commit-first gate, the advice card, logging and the results screen.
- **Node.js** (optional): only needed to run the data checks.
- **AI model: undecided.** The planned live version would call an LLM API with a JSON schema for the advice. Which provider and model to use is still open.

## Running or inspecting the work

No installation is needed:

```
git clone https://github.com/jacobnamps/IIS_assignment_2
cd IIS_assignment_2
open index.html        # or double-click index.html in your file manager
```

On the start screen, choose **Think first** or **Baseline**, then work through the 7 decisions. At the end you can download your log as a CSV.

To check the scenario data (that every quote exists in its fact sheet and the ground truth is consistent):

```
node tests/check-scenarios.js
```

No API key is used or needed. If a live model is added later, the key will be read from a local file excluded by `.gitignore`, and reviewers will supply their own.

## Development record

- **Scope from Assignment 1.** Assignment 1 proposed testing interface adaptations that help people tell correct from incorrect AI advice. I chose personal finance over study advice because the answers can be checked from the given facts. That gives every scenario a ground truth, which is needed to tell calibration apart from general scepticism.
- **Simulated advice instead of a live model.** A live LLM would not let me control which advice is wrong. The scripted advice uses the same JSON shape planned for the model, so it can be swapped out later. Commit: *Add scenarios with fictional fact sheets and scripted advice*.
- **Wrong advice is as fluent as correct advice.** Each wrong answer cites a real passage but misses one fact (a lock-in period, a 0% window, a fee). This reproduces "grounded but wrong".
- **Think First gate and Baseline condition.** Commit: *Add app logic: conditions, commit-first gate, advice card, results and CSV log*.
- **Changed the "check this" line.** The first version told people what to check, for example "check the withdrawal rules", and for wrong advice this pointed straight at the flaw. A live model couldn't do that, so it would have overstated the effect. The line now neutrally lists the facts the advice relied on. Commit: *Make the 'relies on' line neutral*.
- **Data checks.** Added a script that runs the checks the planned Validator would run. Commit: *Add scenario data checks*.
- **What I checked.** A headless-browser run through both conditions with no console errors (screenshots in `docs/`). The CSV fields match the decisions made. Every calculation in the scenarios was recomputed, for example loan interest from the repayment formula.

## AI assistance

- **Tool:** Claude (Anthropic).
- **What I asked it to do:** map my Week 1–4 lecture concepts onto design choices; write the prototype code and helped come up with scenario text; draw the system diagram and the screenshot storyboards; formatted and finalized the report and this README.
- **How I used or changed its suggestions:** I chose the domain, the scripted-AI approach and a simple stack. The neutral "relies on" change came from reviewing the first version. I added scenario text and drafted the report and this README.
- **How I checked the results:** I ran the data checks and the browser run-through, recomputed the scenario arithmetic, and checked that each concept cited in the report appears in the lecture slides. 

## Additional files

- `docs/figures/`: the system diagram and storyboards used in the report.
- `docs/screenshots/`: full-page screenshots of every screen from the test run.
- No ZIP file is needed; everything is in the repository.
