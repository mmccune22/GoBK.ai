export const categories = [
  {
    id: 'bankruptcy-basics',
    name: 'Bankruptcy basics',
    blurb: 'What bankruptcy actually does, what it can\'t do, and whether it fits your situation.',
  },
  {
    id: 'income-and-eligibility',
    name: 'Am I eligible?',
    blurb: 'The means test, whether above-median income rules you out, filing when you\'re unemployed or retired, and filing alone or with a spouse.',
  },
  {
    id: 'filing-process',
    name: 'Filing and the process',
    blurb: 'What actually happens step by step: the two required courses, the trustee, and the 341 meeting.',
  },
  {
    id: 'chapter-7',
    name: 'Chapter 7',
    blurb: 'How Chapter 7 clears eligible debts, what property you may keep, and what happens to your car or small business.',
  },
  {
    id: 'chapter-13',
    name: 'Chapter 13',
    blurb: 'The three-to-five-year repayment plan: catching up on a mortgage, keeping a car, and understanding your options when life changes along the way.',
  },
  {
    id: 'property-and-assets',
    name: 'Your property',
    blurb: 'How bankruptcy treats your house, car, retirement savings, and jointly owned property—and how exemptions help protect what you own.',
  },
  {
    id: 'debts',
    name: 'Your debts',
    blurb: 'Which debts bankruptcy can eliminate, which obligations survive, and how the answer can differ between Chapter 7 and Chapter 13.',
  },
  {
    id: 'creditor-actions',
    name: 'Urgent problems',
    blurb: 'Garnishments, lawsuits, frozen accounts, foreclosure, and repossession: what bankruptcy can stop, what it may help recover, and why timing matters.',
  },
  {
    id: 'life-after-bankruptcy',
    name: 'Life after bankruptcy',
    blurb: 'Credit, renting, buying a home or car, and rebuilding on solid ground.',
  },
  {
    id: 'alternatives',
    name: 'Alternatives to bankruptcy',
    blurb: 'Settlement, debt management plans, consolidation loans, and when doing nothing is a real option.',
  },
  {
    id: 'before-hiring',
    name: 'Before you hire a lawyer',
    blurb: 'How to arrive at a consultation informed and organized: your numbers, your documents, what it will cost, and what technology can and can\'t do.',
  },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export const categoryIds = categories.map((c) => c.id) as unknown as [
  CategoryId,
  ...CategoryId[],
];

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}

export const doors = [
  {
    id: 'help-now',
    label: 'I need help now',
    hint: 'A garnishment, lawsuit, foreclosure, repossession, or bank levy is about to happen or already has.',
    intro:
      'When a creditor has already acted, the questions get specific fast. These answers explain what each action means, how quickly it moves, and what can stop it.',
  },
  {
    id: 'way-out',
    label: 'I need a way out of debt',
    hint: "My finances aren't sustainable and I want to understand my options, including ones that aren't bankruptcy.",
    intro:
      'Bankruptcy is one option among several. These answers lay out the realistic paths, what each one costs you, and how to tell which is worth exploring.',
  },
  {
    id: 'understanding-bankruptcy',
    label: "I'm trying to understand bankruptcy",
    hint: "I'm considering it and want to know what it actually means for my house, car, credit, and daily life.",
    intro:
      'Most people who consider bankruptcy want to know whether they have to file, and what happens if they do. Start with the basics, then follow the questions that apply to you.',
  },
] as const;

export type DoorId = (typeof doors)[number]['id'];

export function getDoor(id: string) {
  return doors.find((d) => d.id === id);
}
