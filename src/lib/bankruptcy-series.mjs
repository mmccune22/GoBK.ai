export const BANKRUPTCY_SERIES = {
  name: 'Bankruptcy Getting Started',
  promise: 'Understand the process, prepare your questions, and explore your next step.',
  schedule: 'Six short emails over two weeks: Days 1, 3, 5, 7, 10, and 14.',
  description: 'A calm introduction for people dealing with debt and considering bankruptcy, from a private snapshot to understanding what a case can involve.',
  scheduleNote: 'Day 1 arrives immediately after you confirm your subscription. The day numbers describe the email schedule, not filing deadlines or how long a bankruptcy case takes.',
  disclaimer: 'General educational information, not legal advice. Your circumstances should be reviewed with a qualified attorney.',
  reviewStatus: 'Draft — Matt review pending',
};

const basicsUrl = 'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics';
const sources = {
  basics: { label: 'U.S. Courts: Bankruptcy Basics', url: basicsUrl },
  process: { label: 'U.S. Courts: The Bankruptcy Process', url: `${basicsUrl}/process-bankruptcy-basics` },
  attorney: { label: 'U.S. Courts: Filing Without an Attorney', url: 'https://www.uscourts.gov/court-programs/bankruptcy/filing-without-attorney' },
  chapter7: { label: 'U.S. Courts: Chapter 7', url: `${basicsUrl}/chapter-7-bankruptcy-basics` },
  chapter13: { label: 'U.S. Courts: Chapter 13', url: `${basicsUrl}/chapter-13-bankruptcy-basics` },
  courses: { label: 'U.S. Courts: Credit Counseling and Debtor Education', url: 'https://www.uscourts.gov/court-programs/bankruptcy/credit-counseling-and-debtor-education-courses' },
  discharge: { label: 'U.S. Courts: Discharge in Bankruptcy', url: `${basicsUrl}/discharge-bankruptcy-bankruptcy-basics` },
};

/** Editorial drafts. These delivery days are not a filing plan. Matt review is pending. */
export const bankruptcySeriesEmails = [
  {
    slug: 'understand-your-options', day: 1,
    subject: 'Start here: understand your bankruptcy options',
    preheader: 'The first of six short emails to help you prepare, without pressure to file.',
    title: 'You can start learning before you decide.',
    intro: [
      'Thanks for confirming your subscription to Bankruptcy Getting Started. If debt has become hard to manage, a clearer picture of your options can make the next conversation easier.',
      'You’ll receive six short emails over two weeks. The day numbers are our delivery schedule, not court deadlines or a timetable for your case. You do not need to decide to file to follow along.',
    ],
    heading: 'What bankruptcy can involve',
    paragraphs: [
      'Bankruptcy is a federal court process that can address certain debts. Different chapters work differently, and a case can affect property as well as debt. Eligibility, costs, and the treatment of particular debts need individual review.',
      'The useful first question is broader than “Which chapter?” Ask what options are available in your circumstances, including alternatives to bankruptcy, and what each would involve. This series will help you organize that conversation.',
    ],
    checklistTitle: 'Choose a starting point',
    checklist: [
      'Write down the debt or property concern you most want help understanding.',
      'Set aside any court papers or notices and note the dates shown on them.',
      'Choose one question to bring to a qualified attorney.',
    ],
    nextStep: 'Keep your notes private. If a notice has a deadline or an event is approaching, seek timely legal help rather than waiting for another email.',
    sources: [sources.basics, sources.process],
  },
  {
    slug: 'make-a-private-snapshot', day: 3,
    subject: 'Put the basics in one private snapshot',
    preheader: 'Debts, income, expenses, property, and dated notices—start with what you know.',
    title: 'Make the picture easier to explain.',
    intro: [
      'You do not have to sort every paper today. Start with a short private snapshot that helps you explain what is happening and where you need answers.',
      'Approximate amounts are useful for getting organized. Mark anything uncertain and ask an attorney what records or exact figures are needed for advice or a filing.',
    ],
    heading: 'More than a total balance',
    paragraphs: [
      'The kinds of debts involved, household income and expenses, and concerns about property all matter to the conversation. An attorney may also ask about prior cases, recent changes, payments, or property transfers.',
      'These notes are preparation for a conversation. They do not determine whether you qualify or what would happen to a debt or asset, and they do not replace the complete information required in court papers.',
    ],
    checklistTitle: 'Your five-part snapshot',
    checklist: [
      'Debts: who you owe, the type of debt, and an approximate balance.',
      'Income: what comes into your household and any recent changes.',
      'Expenses: housing, utilities, food, transportation, and other regular needs.',
      'Property: a home, vehicle, account, or shared property you want to discuss.',
      'Notices: keep dated letters and court papers together, with approaching dates clearly marked.',
    ],
    nextStep: 'Spend a few minutes on the snapshot, then list the gaps. Keep it in your own files; newsletter replies are not a secure way to send financial documents.',
    sources: [sources.chapter7, sources.attorney],
  },
  {
    slug: 'prepare-for-a-consultation', day: 5,
    subject: 'Prepare for a conversation with an attorney',
    preheader: 'Ask what the office needs and bring the questions that matter most to you.',
    title: 'Bring your questions and the facts you have.',
    intro: [
      'A consultation is a chance to understand your options using your own circumstances. Before an appointment, ask the office about the cost, which records it needs, and how to share them securely.',
      'Start with your snapshot and the documents you already have. If something is missing, tell the office and ask what is needed for the first conversation.',
    ],
    heading: 'Ask about the whole picture',
    paragraphs: [
      'Explain the concerns you most want answered, including any dated notices. Ask about alternatives, the effect on debts and property, eligibility, fees, and the responsibilities a case would involve.',
      'You can ask the attorney to explain unfamiliar terms in everyday language. Before the conversation ends, repeat the next step in your own words and check who is responsible for it.',
    ],
    checklistTitle: 'Questions to bring',
    checklist: [
      'What options should I consider, and what are their tradeoffs?',
      'What would happen to the debts and property I am most concerned about?',
      'What facts or documents are still needed before you can advise me?',
      'What would the costs and my responsibilities be?',
      'What happens next, who will do it, and is there a deadline?',
    ],
    nextStep: 'Write a private recap of the options discussed, missing information, and the agreed next action. Ask the office how to follow up if a question or notice arrives later.',
    sources: [sources.attorney],
  },
  {
    slug: 'compare-chapter-7-and-13', day: 7,
    subject: 'Chapter 7 and Chapter 13: the basic difference',
    preheader: 'Understand the approaches before asking which, if either, fits your circumstances.',
    title: 'Different chapters bring different responsibilities.',
    intro: [
      'Chapter numbers describe different approaches to bankruptcy. Learning the basic difference can help you ask better questions, but it does not identify the right option for you.',
    ],
    heading: 'Liquidation and a repayment plan',
    paragraphs: [
      'In Chapter 7, a trustee may sell property that is not protected by an applicable exemption and distribute the proceeds to creditors. Exemptions protect certain property under rules and limits that require individual review.',
      'Chapter 13 is available to individuals with regular income who meet its requirements. It involves a court-approved repayment plan, generally lasting three to five years. The required payments and treatment of debts and property depend on the case.',
      'Neither description promises that you qualify, will keep particular property, or will have every debt discharged. Ask an attorney to compare the available options using your income, debts, property, and history.',
    ],
    checklistTitle: 'Compare what matters to you',
    checklist: [
      'Which chapters, if any, are available to me?',
      'How would my home, vehicle, and other property be treated?',
      'Which debts could remain or need separate attention?',
      'What would I pay, and what would I need to do throughout the case?',
    ],
    nextStep: 'Read the court introductions below and choose one point to ask an attorney to explain using your circumstances. The day number on this email is not a filing deadline.',
    sources: [sources.chapter7, sources.chapter13],
  },
  {
    slug: 'prepare-if-you-decide-to-file', day: 10,
    subject: 'If you decide to file: prepare with your attorney',
    preheader: 'Documents, accurate information, and the separate course requirements.',
    title: 'Use a checklist that fits your case.',
    intro: [
      'If you and your attorney decide to move toward filing, ask the office for its document checklist and instructions. If you are still exploring your options, this is simply a look ahead.',
    ],
    heading: 'Records and required preparation',
    paragraphs: [
      'The attorney may request income records, tax information, account statements, debt records, and property information. Ask which records and time periods apply. Court papers require complete and accurate information; tell the attorney about missing records or anything you do not understand before signing.',
      'Individuals generally must complete credit counseling before filing, with limited exceptions. A separate debtor education course is generally required after filing to receive a discharge. They serve different purposes and should not be treated as one course.',
      'Ask your attorney which requirements apply, which providers are approved for your court, and when certificates must be submitted. Use the court information below to understand the distinction.',
    ],
    checklistTitle: 'Confirm with the office',
    checklist: [
      'Which documents are needed, for what dates, and how should I send them securely?',
      'What information is still missing or needs clarification?',
      'Which approved counseling provider should I use, and what must be completed before filing?',
      'How will I review the papers and correct mistakes before signing?',
    ],
    nextStep: 'Use your attorney’s instructions for timing and preparation. Bring questions about payments or property decisions to the attorney, along with any missing records or unclear information.',
    sources: [sources.chapter7, sources.courses, sources.chapter13],
  },
  {
    slug: 'understand-what-follows-filing', day: 14,
    subject: 'After filing: understand the steps that remain',
    preheader: 'Court notices, trustee requests, education, and ongoing responsibilities.',
    title: 'Filing is one step in a longer process.',
    intro: [
      'If you have not filed, this final email is a look ahead. If you have, follow your case notices and your attorney’s instructions for the next steps.',
      'Day 14 marks the end of these emails, not the end of a case. Case timelines vary, and some responsibilities continue for years.',
    ],
    heading: 'Stay involved as the case moves forward',
    paragraphs: [
      'A personal bankruptcy case generally includes a meeting of creditors, where the trustee and creditors can ask about your finances. Ask your attorney how to prepare and attend, respond to case-specific requests, and track dates in your notices.',
      'Separate debtor education is generally required for a discharge, with limited exceptions. Chapter 13 also involves ongoing plan responsibilities. Confirm course deadlines, payments, and other next steps with your attorney.',
      'A discharge removes personal liability for certain debts. Some debts and rights under liens can remain. Ask what the orders in your case mean for your remaining debts, property, and obligations.',
    ],
    checklistTitle: 'Keep a private action list',
    checklist: [
      'Confirm meetings and deadlines from your case notices with your attorney.',
      'Track requested documents, course certificates, and required payments.',
      'Ask what remains to be done and who is responsible for each step.',
      'Keep copies of important notices and orders, and ask about anything unclear.',
    ],
    nextStep: 'Bring your action list to your next conversation with the office. Keep asking for clarification as the case proceeds; this series is general education, not legal advice.',
    sources: [sources.process, sources.courses, sources.chapter13, sources.discharge],
  },
];
