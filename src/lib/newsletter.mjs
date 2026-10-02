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
    subject: 'Welcome to The GoBK Guide', preheader: 'Your subscription is confirmed. Start with a simple debt snapshot.', title: 'Understand your options, one question at a time.',
    intro: [
      'Thanks for confirming your subscription to The GoBK Guide. We’re glad you’re here.',
      'If bills are becoming hard to manage, or you’re wondering whether bankruptcy makes sense, you’re in the right place. You do not have to decide about filing before you start learning about your options.',
      'Expect a short explanation, a practical checklist, and questions you can bring to an attorney. The aim is to help you feel more prepared to explore your options, without pressure to choose a particular path.',
    ],
    heading: 'What to expect',
    paragraphs: ['Twice a month once the guide launches, we’ll explain one common question. Our first issues cover a simple debt snapshot, preparing for a consultation, Chapter 7 and Chapter 13, and getting a clear next step from an attorney.'],
    checklistTitle: 'A useful first step', checklist: ['Read the first issue and make a private five-part snapshot.', 'Write down the concern you most want answered.', 'Keep financial records in your own files; newsletter replies are not a secure document channel.'],
    nextStep: 'Start with our first issue: “Debt feels overwhelming? Start with a five-part snapshot.” If a notice has a deadline, seek timely help rather than waiting for the next email.',
    nextSlug: 'where-to-start', nextLabel: 'Read the first issue', sources: [],
  },
  {
    slug: 'where-to-start', kind: 'Issue draft', number: 1,
    subject: 'Debt feels overwhelming? Start with a five-part snapshot.', preheader: 'A ten-minute way to organize what you owe, what comes in, and what needs attention.', title: 'Start with a clearer picture.',
    intro: [
      'A stack of bills can make it feel as though you have to solve everything at once. Start smaller: put the basic facts in one place so you can see what you need help understanding.',
      'You do not have to choose bankruptcy to learn about it or ask an attorney about your options. This first guide helps you prepare for that conversation, with no pressure to file.',
    ],
    heading: 'The question behind the balances',
    paragraphs: [
      '“How much do I owe?” is useful, but it is only part of the picture. What comes in, what your household needs each month, the kinds of debts involved, and concerns about property or deadlines are worth discussing too.',
      'Your goal today is to organize facts, not decide which debts would go away or whether you qualify for a particular chapter. An attorney can review the details and explain the available options, including alternatives to bankruptcy.',
    ],
    checklistTitle: 'Your private five-part snapshot', checklist: ['Debts: who you owe, the kind of debt, and an approximate balance. Mark anything you are unsure about.', 'Income: the money coming into your household and any recent changes.', 'Essential expenses: housing, utilities, food, transportation, and other regular needs.', 'Property concerns: a home, vehicle, account, or shared property you want to ask about.', 'Dated notices: court papers, collection notices, or scheduled events. Keep the documents and write down their dates.'],
    nextStep: 'Spend ten minutes on this snapshot, then write one question: “Given this picture, what options should I explore?” Keep it private and bring it to a consultation. If a court paper or notice has a deadline, contact a qualified attorney promptly; do not wait for the next issue.',
    nextSlug: 'before-your-consultation', nextLabel: 'Next: prepare for a consultation', sources: [basics],
  },
  {
    slug: 'before-your-consultation', kind: 'Issue draft', number: 2,
    subject: 'Before your first consultation: gather what you have.', preheader: 'Organize the facts, ask what the office needs, and make room for unknowns.', title: 'Bring a clearer picture, not a perfect one.',
    intro: [
      'If you’re preparing to talk with a bankruptcy attorney, it’s easy to worry that your paperwork is not organized enough. Start by asking the office what it wants for an initial consultation and how to provide it securely.',
      'The list below can help you organize your thoughts. It is preparation for a conversation, not a filing checklist. The office’s specific instructions should guide what you bring.',
    ],
    heading: 'Start with your snapshot and your questions',
    paragraphs: [
      'Put your debt, income, expense, property, and notice notes together. Keep any statements or papers you already have nearby. You may not know an exact balance or have every document; mark the gaps and ask the office what is needed for the first conversation.',
      'Add relevant history you want to explain, such as a prior bankruptcy, a recent move, or payments and property transfers. Ask the attorney which details matter rather than trying to interpret their legal effect yourself.',
    ],
    checklistTitle: 'Before the appointment', checklist: ['Ask about the consultation cost, length, and whether anyone else should attend.', 'Ask which documents are needed now and how to share them securely.', 'Bring your five-part snapshot, with unknown amounts clearly marked.', 'Keep dated notices together and flag any deadline when you contact the office.', 'Choose your three most important questions, including options other than bankruptcy.'],
    nextStep: 'Confirm the appointment, consultation cost, requested documents, and secure delivery method with the office. Keep financial records out of newsletter replies.',
    nextSlug: 'bankruptcy-words', nextLabel: 'Next: compare Chapter 7 and Chapter 13', sources: [],
  },
  {
    slug: 'bankruptcy-words', kind: 'Issue draft', number: 3,
    subject: 'Chapter 7 and Chapter 13: what changes?', preheader: 'The basic difference between liquidation and a repayment plan.', title: 'Two chapters. Different approaches.',
    intro: [
      'Bankruptcy conversations can start to sound like a list of chapter numbers. Before comparing options, it helps to understand what those names refer to.',
      'These descriptions are a starting point. They do not tell you whether you qualify, which path fits your circumstances, or what would happen to a particular debt or piece of property.',
    ],
    heading: 'What each chapter generally involves',
    paragraphs: [
      'Chapter 7 involves liquidation: a trustee may sell property that is not protected by an applicable exemption and distribute the proceeds to creditors. An exemption is a legal protection for certain property, subject to applicable rules and limits. What you could keep needs individual review.',
      'Chapter 13 involves a court-supervised repayment plan for individuals with regular income. Plans commonly run for three to five years. What payments would be required, and how particular debts and property would be treated, depends on the case.',
      'The comparison is about how the process works, not a shortcut for choosing a chapter. Ask an attorney about eligibility, debts that may remain, property, costs, and ongoing responsibilities before deciding.',
    ],
    checklistTitle: 'Compare the answers that matter to you', checklist: ['Which chapters, if any, are available in my circumstances?', 'What would happen to my home, vehicle, and other property under each option?', 'Which debts could remain or need separate attention?', 'What would I pay, how long would the process take, and what would I need to do?'],
    nextStep: 'Read the U.S. Courts introductions below, then write down one term you want an attorney to explain using your own circumstances.',
    nextSlug: 'questions-for-an-attorney', nextLabel: 'Next: questions for an attorney',
    sources: [{ label: 'U.S. Courts: Chapter 7', url: basics.url + '/chapter-7-bankruptcy-basics' }, { label: 'U.S. Courts: Chapter 13', url: basics.url + '/chapter-13-bankruptcy-basics' }],
  },
  {
    slug: 'questions-for-an-attorney', kind: 'Issue draft', number: 4,
    subject: 'Leave your consultation knowing the next step.', preheader: 'Five questions about options, costs, missing facts, and what happens next.', title: 'Leave with a next step you understand.',
    intro: [
      'A first conversation with an attorney can bring up more information than you expected. A short list of questions helps you keep track of what matters most to you.',
      'You can ask for an explanation in everyday language, take notes, and check that you understood the answer. You do not have to pretend a term is familiar when it isn’t.',
    ],
    heading: 'Ask about the whole picture',
    paragraphs: [
      'Discuss the options the attorney sees, what information is still missing, and what would happen next. Ask about alternatives as well as bankruptcy, and explain the concerns you want the attorney to consider.',
      'Before ending the conversation, repeat back the next step in your own words. Clarify who is doing what, whether there is a deadline, and how the office wants you to communicate or send documents.',
    ],
    checklistTitle: 'Five questions worth writing down', checklist: ['What options are available, including alternatives to bankruptcy, and what are the tradeoffs?', 'What would happen to the property and debts I am most concerned about?', 'What information is still missing before you can advise me?', 'What would the total fees, payment terms, timeline, and my responsibilities look like?', 'What should happen next, who will do it, and is there a deadline?'],
    nextStep: 'Write a private three-line recap: the options discussed, anything still needed, and the next action with its deadline. Ask the attorney to clarify anything you could not explain in your own words, and confirm how to follow up.', nextSlug: null, nextLabel: null, sources: [],
  },
];
