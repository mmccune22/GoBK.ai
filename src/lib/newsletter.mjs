/** Only a public Brevo-hosted form belongs in the static site. Never an API key. */
export function newsletterConfig(env = {}) {
  const raw = (env.PUBLIC_GOBK_NEWSLETTER_FORM_URL ?? '').trim();
  let formUrl = '';
  if (raw) {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !/^[a-z0-9-]+\.sibforms\.com$/i.test(url.hostname) ||
        !/^\/serve\/[^/]+\/?$/.test(url.pathname) || url.search || url.hash) {
      throw new Error('Use the public HTTPS Brevo hosted signup URL (https://….sibforms.com/serve/…), without credentials or query parameters.');
    }
    formUrl = url.href;
  }
  const enabled = env.PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED === 'true';
  if (enabled && !formUrl) throw new Error('Newsletter signup requires a verified Brevo hosted form URL.');
  return { formUrl, enabled };
}

export const NEWSLETTER = {
  name: 'The GoBK Guide', promise: 'Debt questions. Clear answers.', cadence: 'Twice a month',
  disclaimer: 'General educational information, not legal advice. Your circumstances should be reviewed with a qualified attorney.',
};
const basics = { label: 'U.S. Courts: Bankruptcy Basics', url: 'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics' };

/** Editorial drafts. An experimental preview is not content approval or a mailing. */
export const newsletterEmails = [
  {
    slug: 'welcome', kind: 'Welcome email', number: null,
    subject: 'Welcome to The GoBK Guide', preheader: 'Your subscription is confirmed. One question at a time.', title: 'A clearer next step starts here.',
    intro: [
      'Thanks for confirming your subscription to The GoBK Guide. We’re glad you’re here.',
      'Debt can bring a lot of questions at once. You do not have to learn every term or make every decision today. Twice a month, we’ll take one topic and explain it in plain English.',
      'Expect a short explanation, a practical checklist, and questions you can bring to an attorney. The aim is to help you feel more prepared to explore your options, without pressure to choose a particular path.',
    ],
    heading: 'What to expect',
    paragraphs: ['Our first issues cover where to start, what to gather before a consultation, unfamiliar bankruptcy terms, and questions to ask an attorney. You can read at your own pace.'],
    checklistTitle: 'A useful first step', checklist: ['Choose one question you want answered.', 'Keep that question in your own notes.', 'Read the first issue when you have a quiet moment.'],
    nextStep: 'Start with our first issue: “Debt feels overwhelming. Where do you start?”',
    nextSlug: 'where-to-start', nextLabel: 'Read the first issue', sources: [],
  },
  {
    slug: 'where-to-start', kind: 'Issue draft', number: 1,
    subject: 'Debt feels overwhelming. Where do you start?', preheader: 'You don’t have to understand everything today.', title: 'Start with your questions.',
    intro: [
      'When you’re dealing with debt, even knowing which questions to ask can feel difficult. A stack of letters, unfamiliar terms, and worries about the future can make everything seem urgent at once.',
      'The GoBK Guide is here to make the conversation easier to follow. We’ll cover one topic at a time, in plain English, with practical ways to prepare for a conversation with an attorney.',
    ],
    heading: 'What do you most want to understand?',
    paragraphs: [
      'You might be wondering about your home or car, what different bankruptcy chapters mean, or what happens during a first consultation. You may also want to ask about options other than bankruptcy. There is room for all of those questions.',
      'An article can explain a general idea. An attorney can review the details of your circumstances. You don’t need to know the answer before asking the question.',
    ],
    checklistTitle: 'A ten-minute starting list', checklist: ['Write down your three biggest questions.', 'Note any dates printed on court papers or other notices.', 'Choose one topic you want explained first.'],
    nextStep: 'Keep the list for your own use or bring it to an attorney. If you have a dated notice or court paper, ask about its timing directly rather than waiting for a newsletter.',
    nextSlug: 'before-your-consultation', nextLabel: 'Next: prepare for a consultation', sources: [basics],
  },
  {
    slug: 'before-your-consultation', kind: 'Issue draft', number: 2,
    subject: 'Your first attorney conversation: what to gather', preheader: 'A simple preparation list, without the pressure to have every answer.', title: 'Bring a clearer picture, not a perfect one.',
    intro: [
      'If you’re preparing to talk with a bankruptcy attorney, it’s easy to worry that your paperwork is not organized enough. Start by asking the office what it wants for an initial consultation and how to provide it securely.',
      'The list below can help you organize your thoughts. It is preparation for a conversation, not a filing checklist. The office’s specific instructions should guide what you bring.',
    ],
    heading: 'Make room for the unknowns',
    paragraphs: [
      'You may not know an exact balance or have every statement available. Write down what you know and mark anything you need to confirm. That gives you a useful question to ask rather than a reason to put off the conversation.',
      'Include the things you most want to discuss: a home, a vehicle, a particular debt, a pending notice, or uncertainty about the available options. Ask whether anyone else in your household should attend the consultation.',
    ],
    checklistTitle: 'Ask the office what to bring', checklist: ['A rough list of debts and who is owed.', 'Notes about income and usual household expenses.', 'Questions about property, loans, or shared debts.', 'Court papers and other notices, including their dates.', 'Your three most important questions.'],
    nextStep: 'Confirm the appointment, consultation cost, requested documents, and secure delivery method with the office. Keep financial records out of newsletter replies.',
    nextSlug: 'bankruptcy-words', nextLabel: 'Next: bankruptcy words explained', sources: [],
  },
  {
    slug: 'bankruptcy-words', kind: 'Issue draft', number: 3,
    subject: 'Chapter 7 and Chapter 13: start with the words', preheader: 'Two common terms, and the questions behind them.', title: 'You can ask for a plain-English explanation.',
    intro: [
      'Bankruptcy conversations can start to sound like a list of chapter numbers. Before comparing options, it helps to understand what those names refer to.',
      'These descriptions are a starting point. They do not tell you whether you qualify, which path fits your circumstances, or what would happen to a particular debt or piece of property.',
    ],
    heading: 'Two terms you will hear',
    paragraphs: [
      'Chapter 7 involves liquidation: a trustee may sell property that is not protected by an applicable exemption and distribute the proceeds to creditors. Questions about exemptions and property need a review of your circumstances.',
      'Chapter 13 involves a repayment plan for individuals with regular income. Plans commonly run for three to five years. The details of the plan, eligibility, and treatment of debts require individual review.',
      'A familiar chapter number is not a recommendation. Ask an attorney to explain what each available option would mean for your income, property, debts, costs, and timeline.',
    ],
    checklistTitle: 'Questions to bring to the conversation', checklist: ['Which options are available in my circumstances?', 'What would happen to the property I am concerned about?', 'Which debts would need separate attention?', 'What costs and ongoing responsibilities should I understand?'],
    nextStep: 'Read the U.S. Courts introductions below, then write down one term you want an attorney to explain using your own circumstances.',
    nextSlug: 'questions-for-an-attorney', nextLabel: 'Next: questions for an attorney',
    sources: [{ label: 'U.S. Courts: Chapter 7', url: basics.url + '/chapter-7-bankruptcy-basics' }, { label: 'U.S. Courts: Chapter 13', url: basics.url + '/chapter-13-bankruptcy-basics' }],
  },
  {
    slug: 'questions-for-an-attorney', kind: 'Issue draft', number: 4,
    subject: 'Five questions for a useful attorney conversation', preheader: 'Leave with a clearer understanding of the next step.', title: 'Make the conversation work for you.',
    intro: [
      'A first conversation with an attorney can bring up more information than you expected. A short list of questions helps you keep track of what matters most to you.',
      'You can ask for an explanation in everyday language, take notes, and check that you understood the answer. You do not have to pretend a term is familiar when it isn’t.',
    ],
    heading: 'Ask about the whole picture',
    paragraphs: [
      'Discuss the options the attorney sees, what information is still missing, and what would happen next. Ask about alternatives as well as bankruptcy, and explain the concerns you want the attorney to consider.',
      'Before ending the conversation, repeat back the next step in your own words. Clarify who is doing what, whether there is a deadline, and how the office wants you to communicate or send documents.',
    ],
    checklistTitle: 'Five questions worth writing down', checklist: ['What options should we discuss, including alternatives to bankruptcy?', 'What facts or documents do you still need?', 'What should I understand about my home, vehicle, and specific debts?', 'What would the fees, responsibilities, and timeline look like?', 'What is the next step, who owns it, and is there a deadline?'],
    nextStep: 'Keep a private note of the agreed next step. Ask the office how to follow up if you think of another question after the appointment.', nextSlug: null, nextLabel: null, sources: [],
  },
];
