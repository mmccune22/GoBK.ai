window.JIMMY_CHANGE_META = {
  updated: "2026-07-10",
  branch: "main - Matt + Jimmy shared",
  publishUrl: window.location.origin + window.location.pathname,
  mattPublishUrl: "https://mmccune22.github.io/mccune-legal-intake-mockups/Intake%20Pages/",
  reviewApiUrl: "", // Isolated test: never connect to shared review storage.
  reviewMessagesApiUrl: "",
  reviewRequestsApiUrl: ""
};

window.JIMMY_CHANGE_ITEMS = [
  {
    id: "counseling-attorney-code-copy",
    title: "One-click counseling attorney code",
    date: "2026-07-10",
    category: "Client experience",
    status: "Live on Matt and Jimmy sites",
    commit: "counseling-copy-code-v1",
    pages: ["Counseling class"],
    summary: "The counseling page now places an accessible copy control beside attorney code 449858, confirms when the code is copied, and falls back to selecting the code when clipboard access is unavailable.",
    mattDecision: "The Cricket Debt link and attorney code are unchanged. Copying requires an explicit debtor action rather than changing the clipboard unexpectedly.",
    links: [
      { label: "Open Counseling class", href: "counseling.html" }
    ]
  },
  {
    id: "crm-organization-branding-sync",
    title: "CRM organization name and logo sync",
    date: "2026-07-10",
    category: "CRM",
    status: "Live on Jimmy CRM and Intake",
    commit: "65cb128 + ba44119",
    pages: ["CRM Settings", "CRM sidebar", "Jimmy Intake"],
    summary: "Saving an organization name in CRM Settings now updates the CRM sidebar footer and Jimmy Intake branding. PNG/JPG logo uploads are validated, resized for browser storage, and shown on both surfaces with initials as the fallback.",
    mattDecision: "This is a fake-data review workflow stored in the browser on Jimmy's GitHub Pages origin; it is not approved for real client data.",
    links: [
      { label: "Open Jimmy CRM", href: "https://jimmydanol.github.io/bkfl-crm-lite/" },
      { label: "Open Jimmy Intake", href: "https://jimmydanol.github.io/mccune-legal-intake-mockups-review/Intake%20Pages/login.html" }
    ]
  },
  {
    id: "phone-formatting",
    title: "Data intake formatting best practices",
    date: "2026-07-09",
    category: "Data entry",
    status: "Live on Matt and Jimmy sites",
    commit: "618bc91",
    pages: ["All intake pages"],
    summary: "Structured fields now clean up as the debtor types or leaves the field: phone numbers, Social Security numbers, ZIP codes, dates, dollar amounts, email addresses, years, ages, EINs, and mileage.",
    mattDecision: "The data-intake formatting behavior is included on both sites.",
    links: [
      { label: "Open login", href: "login.html" },
      { label: "Open personal info", href: "personal.html" },
      { label: "Open assets", href: "assets.html" },
      { label: "Open debts", href: "debts.html" },
      { label: "Open expenses", href: "expenses.html" }
    ]
  },
  {
    id: "asset-address-zestimate",
    title: "House asset Zestimate and geo/address API",
    date: "2026-07-09",
    category: "Assets",
    status: "Live on Matt and Jimmy sites",
    commit: "675714b + c795738",
    pages: ["Assets"],
    summary: "Real estate entries use the geo/address suggestion API and include a Get Zestimate button for property value lookup.",
    mattDecision: "The Zestimate and geo/address workflow is included on both sites.",
    links: [
      { label: "Open assets", href: "assets.html" }
    ]
  },
  {
    id: "duplicate-entry-carryover",
    title: "Definite duplicate entry carry-forward",
    date: "2026-07-09",
    category: "Data entry",
    status: "Live on Matt and Jimmy sites",
    commit: "f96cb1e",
    pages: ["Login", "Personal Information", "Debts", "Monthly expenses"],
    summary: "Clearly duplicate values carry forward: login name and email populate Personal, and mortgage, HOA, and vehicle payment amounts populate matching Expense rows.",
    mattDecision: "Definite duplicate-entry carry-forward is included on both sites.",
    links: [
      { label: "Open login", href: "login.html" },
      { label: "Open debts", href: "debts.html" },
      { label: "Open expenses", href: "expenses.html" }
    ]
  },
  {
    id: "shared-page9-conversation",
    title: "Shared Page 9 conversation",
    date: "2026-07-09",
    category: "Collaboration",
    status: "Live on Matt and Jimmy sites",
    commit: "c80fa1e + shared sync",
    pages: ["Colab"],
    summary: "Page 9 includes a shared comment feed where Matt and Jimmy can post messages, see the same conversation, and receive automatic updates.",
    mattDecision: "The shared conversation is included on both Page 9 URLs.",
    links: [
      { label: "Open Page 9", href: "jimmy-changes.html" }
    ]
  },
  {
    id: "matt-feature-requests",
    title: "Matt-to-Jimmy feature requests",
    date: "2026-07-09",
    category: "Collaboration",
    status: "Live on Matt and Jimmy sites",
    commit: "feature-requests-v1",
    pages: ["Colab"],
    summary: "Page 9 includes a shared feature request section where Matt can submit requests and Jimmy can record when each request is implemented.",
    mattDecision: "Requests and implementation status stay synchronized across both Page 9 URLs.",
    links: [
      { label: "Open Page 9", href: "jimmy-changes.html" }
    ]
  },
  {
    id: "financial-affairs-simplified-labels",
    title: "Simplified Financial affairs question labels",
    date: "2026-07-09",
    category: "Design",
    status: "Live on Matt and Jimmy sites",
    commit: "financial-affairs-labels-v1",
    pages: ["Financial affairs"],
    summary: "Financial affairs keeps its descriptive section headings while removing the Part 1, Part 2, and similar prefixes, separator bullets, and numbered tiles beside all 27 questions.",
    mattDecision: "The question wording, answer controls, conditional details, and court-paperwork trigger remain unchanged.",
    links: [
      { label: "Open Financial affairs", href: "financial-affairs.html" }
    ]
  },
  {
    id: "assets-default-no",
    title: "Assets questions default to No",
    date: "2026-07-09",
    category: "Data entry",
    status: "Live on Matt and Jimmy sites",
    commit: "assets-default-no-v1",
    pages: ["Assets"],
    summary: "Every unanswered Yes/No question on Assets now starts with No selected, while answers already saved in the current session remain unchanged.",
    mattDecision: "Conditional asset details remain hidden until the debtor changes the related answer to Yes.",
    links: [
      { label: "Open Assets", href: "assets.html" }
    ]
  },
  {
    id: "colab-newest-first",
    title: "Newest Page 9 changes appear first",
    date: "2026-07-09",
    category: "Design",
    status: "Live on Matt and Jimmy sites",
    commit: "colab-newest-first-v1",
    pages: ["Colab"],
    summary: "Page 9 now displays the newest feature and design changes at the top, including later changes logged on the same day.",
    mattDecision: "This changes only the changelog display order; shared statuses, comments, feature requests, and editable writing remain unchanged.",
    links: [
      { label: "Open Page 9", href: "jimmy-changes.html" }
    ]
  },
  {
    id: "colab-dismiss-tiles",
    title: "Dismiss and restore Page 9 changes",
    date: "2026-07-09",
    category: "Collaboration",
    status: "Live on Matt and Jimmy sites",
    commit: "colab-dismiss-v1",
    pages: ["Colab"],
    summary: "Every changelog tile now has a shared Dismiss action. Dismissed changes disappear on both sites and remain available through Show dismissed for later restoration.",
    mattDecision: "Matt or Jimmy can dismiss or restore a tile; implementation and approval history remain attached to the change.",
    links: [
      { label: "Open Page 9", href: "jimmy-changes.html" }
    ]
  },
  {
    id: "colab-undo-request",
    title: "Matt-to-Jimmy undo notifications",
    date: "2026-07-09",
    category: "Collaboration",
    status: "Live on Matt and Jimmy sites",
    commit: "colab-undo-v1",
    pages: ["Colab"],
    summary: "Each feature tile now gives Matt a shared Request undo toggle that notifies Jimmy without automatically changing or reverting the feature.",
    mattDecision: "Matt can turn an undo request on or off. Jimmy sees the synchronized notification while the feature's implementation, approval, and dismissal history remain intact.",
    links: [
      { label: "Open Page 9", href: "jimmy-changes.html" }
    ]
  },
  {
    id: "colab-clear-chat",
    title: "Clear the shared Page 9 chat",
    date: "2026-07-09",
    category: "Collaboration",
    status: "Live on Matt and Jimmy sites",
    commit: "colab-clear-chat-v1",
    pages: ["Colab"],
    summary: "The shared conversation now includes a Clear chat button for removing all messages from both Page 9 sites when the thread gets too long.",
    mattDecision: "Matt or Jimmy can clear the conversation after confirming the permanent action. Feature requests and changelog statuses are not affected.",
    links: [
      { label: "Open Page 9", href: "jimmy-changes.html" }
    ]
  }
];
