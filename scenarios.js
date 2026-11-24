// Scenario data for the Think First prototype.
//
// Each scenario has:
//   - the situation and two options the person chooses between
//   - "factSheets": the only knowledge the (simulated) assistant is allowed to use.
//     These are fictional products, so every fact a person needs is on screen.
//   - "advice": a pre-scripted response written in the same shape a live LLM would be
//     asked to return (see ADVICE SCHEMA below). This is the simulated AI.
//   - "groundTruth": hidden from the person until the results screen. Used to score
//     whether they followed correct or incorrect advice (calibration).
//
// ADVICE SCHEMA (planned contract for a live model call):
//   status:         "advice" | "decline"
//   recommendation: option id ("A" or "B"), or null when declining
//   summary:        one-sentence recommendation
//   reasoning:      2-3 sentences
//   source:         { sheet, section, date, quote }  - the passage the claim rests on
//   checkThis:      the facts the advice relied on (shown as 'This advice relies on').
//                   Neutral by design: it lists what was used, not what was missed,
//                   because a live model could not flag its own mistake.
//
// Incorrect advice is deliberately as fluent and confident as correct advice, and still
// cites a real passage. That reproduces the problem from Assignment 1: grounding gives
// an address to check, not a guarantee of truth (Lecture 11).

const SCENARIOS = [
  {
    id: "phone",
    title: "New phone: contract or buy outright?",
    situation:
      "You need a new phone and will keep it for 2 years. You can afford either option. Which costs less over the 2 years?",
    options: [
      { id: "A", label: "Option A: 24-month contract with phone included" },
      { id: "B", label: "Option B: buy the phone outright + SIM-only plan" }
    ],
    factSheets: [
      {
        name: "Lumen Mobile – Contract plans",
        date: "Updated 2 Sep 2026",
        sections: [
          { heading: "Plan 30", text: "£30 per month for 24 months. Phone included. 20GB data." }
        ]
      },
      {
        name: "Lumen Mobile – SIM-only and handsets",
        date: "Updated 2 Sep 2026",
        sections: [
          { heading: "Handset price", text: "The same phone bought outright costs £480." },
          { heading: "SIM-only 20GB", text: "£12 per month, 24-month term. 20GB data." }
        ]
      }
    ],
    advice: {
      status: "advice",
      recommendation: "A",
      summary: "Choose the 24-month contract (Option A).",
      reasoning:
        "The contract costs £30 × 24 = £720 in total, including the phone. Buying outright costs £480 plus £12 × 24 = £288 for the SIM, which is £768. The contract is £48 cheaper over two years.",
      source: {
        sheet: "Lumen Mobile – Contract plans",
        section: "Plan 30",
        date: "2 Sep 2026",
        quote: "£30 per month for 24 months. Phone included."
      },
      checkThis: "£30 per month × 24; handset £480; SIM-only £12 per month × 24."
    },
    groundTruth: {
      correctOption: "A",
      adviceCorrect: true,
      explanation: "Contract £720 vs outright £768. The advice was correct."
    }
  },

  {
    id: "savings",
    title: "Where to keep your house deposit",
    situation:
      "You have £5,000 saved for a rental deposit you will need to pay in 6 months. Where should you keep it until then?",
    options: [
      { id: "A", label: "Option A: Easy Access Saver (3.5%)" },
      { id: "B", label: "Option B: 1-Year Fixed Bond (4.6%)" }
    ],
    factSheets: [
      {
        name: "Harbour Bank – Easy Access Saver",
        date: "Updated 15 Aug 2026",
        sections: [
          { heading: "Rate", text: "3.5% AER, variable." },
          { heading: "Withdrawals", text: "Withdraw any amount at any time, free of charge." }
        ]
      },
      {
        name: "Harbour Bank – 1-Year Fixed Bond",
        date: "Updated 15 Aug 2026",
        sections: [
          { heading: "Rate", text: "4.6% AER, fixed for 12 months." },
          { heading: "Withdrawals", text: "No withdrawals are permitted until the bond matures after 12 months." }
        ]
      }
    ],
    advice: {
      status: "advice",
      recommendation: "B",
      summary: "Choose the 1-Year Fixed Bond (Option B).",
      reasoning:
        "The fixed bond pays 4.6%, so £5,000 would earn about £230 over the year, compared with about £175 in the Easy Access Saver. The fixed rate also protects you if variable rates fall.",
      source: {
        sheet: "Harbour Bank – 1-Year Fixed Bond",
        section: "Rate",
        date: "15 Aug 2026",
        quote: "4.6% AER, fixed for 12 months."
      },
      checkThis: "the two interest rates, 4.6% and 3.5%."
    },
    groundTruth: {
      correctOption: "A",
      adviceCorrect: false,
      explanation:
        "The bond locks the money for 12 months, but you need it in 6. The advice compared rates and ignored the withdrawal rule. The Easy Access Saver is the right choice."
    }
  },

  {
    id: "gym",
    title: "Gym membership: annual or monthly?",
    situation:
      "You are moving to another city in 6 months and will stop using this gym then. Which membership costs less?",
    options: [
      { id: "A", label: "Option A: Annual membership" },
      { id: "B", label: "Option B: Monthly rolling membership" }
    ],
    factSheets: [
      {
        name: "FitHub – Membership prices",
        date: "Updated 1 Oct 2026",
        sections: [
          { heading: "Annual", text: "£300 paid upfront. Non-refundable." },
          { heading: "Monthly", text: "£32 per month. Cancel any time with no fee." }
        ]
      }
    ],
    advice: {
      status: "advice",
      recommendation: "B",
      summary: "Choose the monthly membership (Option B).",
      reasoning:
        "You will use the gym for 6 months. Monthly costs £32 × 6 = £192 and you can cancel without a fee. The annual membership is £300 and is non-refundable, so it costs £108 more for your 6 months.",
      source: {
        sheet: "FitHub – Membership prices",
        section: "Monthly",
        date: "1 Oct 2026",
        quote: "£32 per month. Cancel any time with no fee."
      },
      checkThis: "6 months of use; £32 per month; £300 annual fee."
    },
    groundTruth: {
      correctOption: "B",
      adviceCorrect: true,
      explanation: "Monthly £192 vs annual £300. The advice was correct."
    }
  },

  {
    id: "debts",
    title: "Which debt to pay off first",
    situation:
      "You have £1,200 from a summer job. After that, you can repay £300 a month. You owe £1,200 on a credit card and £1,200 on a store card. Which should the £1,200 clear now to pay the least interest overall?",
    options: [
      { id: "A", label: "Option A: Clear the credit card now" },
      { id: "B", label: "Option B: Clear the store card now" }
    ],
    factSheets: [
      {
        name: "Your credit card statement",
        date: "Statement date 1 Nov 2026",
        sections: [
          { heading: "Balance", text: "£1,200." },
          { heading: "Interest", text: "24% APR, charged monthly on the balance." }
        ]
      },
      {
        name: "Your store card statement",
        date: "Statement date 1 Nov 2026",
        sections: [
          { heading: "Balance", text: "£1,200." },
          { heading: "Interest", text: "0% for the next 4 months. After that, 29% APR on any remaining balance." }
        ]
      }
    ],
    advice: {
      status: "advice",
      recommendation: "B",
      summary: "Clear the store card first (Option B).",
      reasoning:
        "The store card has the higher rate at 29% APR, compared with 24% on the credit card. Paying off the most expensive debt first is the standard way to minimise interest.",
      source: {
        sheet: "Your store card statement",
        section: "Interest",
        date: "1 Nov 2026",
        quote: "After that, 29% APR on any remaining balance."
      },
      checkThis: "the two interest rates, 29% and 24% APR."
    },
    groundTruth: {
      correctOption: "A",
      adviceCorrect: false,
      explanation:
        "The store card is 0% for 4 months, and £300 × 4 clears it before the 29% starts. Clearing the credit card now means no interest at all. Following the advice costs about £64 in credit-card interest."
    }
  },

  {
    id: "crypto",
    title: "A friend's investment tip",
    situation:
      "A friend says you should put £2,000 of your savings into a new crypto token that is 'guaranteed' to return 40% a year. Should you?",
    options: [
      { id: "A", label: "Option A: Invest the £2,000" },
      { id: "B", label: "Option B: Don't invest" }
    ],
    factSheets: [
      {
        name: "Harbour Bank – Easy Access Saver",
        date: "Updated 15 Aug 2026",
        sections: [{ heading: "Rate", text: "3.5% AER, variable." }]
      }
    ],
    advice: {
      status: "decline",
      recommendation: null,
      summary: "I can't advise on this.",
      reasoning:
        "None of my fact sheets cover crypto tokens or investments, so anything I said would not be based on a source you can check. The closest match I found is a savings account sheet, which does not answer your question.",
      source: {
        sheet: "Harbour Bank – Easy Access Saver",
        section: "Rate (closest match, low relevance)",
        date: "15 Aug 2026",
        quote: "3.5% AER, variable."
      },
      checkThis:
        "For investment decisions, look for guidance from a regulated source such as a qualified financial adviser."
    },
    groundTruth: {
      correctOption: null, // not scored: the assistant declined
      adviceCorrect: null,
      explanation: "The assistant declined because the question is outside its fact sheets. Not scored."
    }
  },

  {
    id: "travel",
    title: "Which card to take on holiday",
    situation:
      "You will spend about £800 abroad, all by card payment in shops and restaurants. You won't withdraw cash. Which card costs less?",
    options: [
      { id: "A", label: "Option A: Everyday Card" },
      { id: "B", label: "Option B: Travel Card" }
    ],
    factSheets: [
      {
        name: "Northgate – Everyday Card",
        date: "Updated 20 Sep 2026",
        sections: [{ heading: "Spending abroad", text: "2.99% fee on every non-sterling transaction." }]
      },
      {
        name: "Northgate – Travel Card",
        date: "Updated 20 Sep 2026",
        sections: [
          { heading: "Spending abroad", text: "No fee on card payments abroad." },
          { heading: "Cash", text: "£3 fee per cash withdrawal abroad." }
        ]
      }
    ],
    advice: {
      status: "advice",
      recommendation: "B",
      summary: "Take the Travel Card (Option B).",
      reasoning:
        "On £800 of card payments, the Everyday Card's 2.99% fee would cost about £24. The Travel Card charges nothing for card payments. Its £3 cash fee doesn't apply because you won't withdraw cash.",
      source: {
        sheet: "Northgate – Travel Card",
        section: "Spending abroad",
        date: "20 Sep 2026",
        quote: "No fee on card payments abroad."
      },
      checkThis: "£800 of card spending; 2.99% fee vs no fee; no cash withdrawals."
    },
    groundTruth: {
      correctOption: "B",
      adviceCorrect: true,
      explanation: "Everyday Card about £24 in fees vs £0. The advice was correct."
    }
  },

  {
    id: "loan",
    title: "Choosing a personal loan",
    situation:
      "You need to borrow £3,000 and repay it over 12 months. Which loan costs less in total?",
    options: [
      { id: "A", label: "Option A: Loan A (6.9%)" },
      { id: "B", label: "Option B: Loan B (5.9%)" }
    ],
    factSheets: [
      {
        name: "Crestline – Loan A",
        date: "Updated 10 Oct 2026",
        sections: [
          { heading: "Interest", text: "6.9% fixed. Total interest on £3,000 over 12 months: £113." },
          { heading: "Fees", text: "No arrangement fee." }
        ]
      },
      {
        name: "Crestline – Loan B",
        date: "Updated 10 Oct 2026",
        sections: [
          { heading: "Interest", text: "5.9% fixed. Total interest on £3,000 over 12 months: £97." },
          { heading: "Fees", text: "£150 arrangement fee, added to the first payment." }
        ]
      }
    ],
    advice: {
      status: "advice",
      recommendation: "B",
      summary: "Choose Loan B (Option B).",
      reasoning:
        "Loan B has the lower interest rate, 5.9% compared with 6.9%. Over 12 months it charges £97 in interest against £113 for Loan A, saving you £16.",
      source: {
        sheet: "Crestline – Loan B",
        section: "Interest",
        date: "10 Oct 2026",
        quote: "Total interest on £3,000 over 12 months: £97."
      },
      checkThis: "total interest of £97 and £113."
    },
    groundTruth: {
      correctOption: "A",
      adviceCorrect: false,
      explanation:
        "Loan B's £150 fee makes it £247 in total against £113 for Loan A. The advice compared interest only. Loan A is £134 cheaper."
    }
  }
];
