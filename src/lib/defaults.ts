import type { Person, Recruitment, Service, Settings } from './models';

export const defaultPeople: Person[] = [
  { _id: 'tejas-yadav', name: 'Tejas Yadav', role: 'President', group: 'Leadership', leadership: true, order: 0, localImage: '/leadership/tejas.png' },
  { _id: 'rohit-sharma', name: 'Rohit Sharma', role: 'Vice President', group: 'Leadership', leadership: true, order: 1, localImage: '/leadership/rohit_sharma3.png' },
  { _id: 'rohit-sah-teli', name: 'Rohit Sah Teli', role: 'Vice President', group: 'Leadership', leadership: true, order: 2, localImage: '/leadership/rohit_sah.png' },
];

export const defaultServices: Service[] = [
  { _id: 'ma', title: 'Mergers & Acquisitions', description: 'Target identification, acquisition screening, due diligence, and deal research.', deliverables: ['Target identification', 'Acquisition screening', 'Due diligence', 'Deal research'], order: 0 },
  { _id: 'strategy', title: 'Business Strategy', description: 'Market entry, business expansion, competitive positioning, and growth strategies.', deliverables: ['Market entry', 'Business expansion', 'Competitive positioning', 'Growth strategies'], order: 1 },
  { _id: 'finance', title: 'Finance & Valuation', description: 'Financial modelling, business valuations, investment analysis, and financial planning.', deliverables: ['Financial modelling', 'Business valuations', 'Investment analysis', 'Financial planning'], order: 2 },
  { _id: 'research', title: 'Market Research & Intelligence', description: 'Market sizing, industry analysis, competitor benchmarking, and consumer insights.', deliverables: ['Market sizing', 'Industry analysis', 'Competitor benchmarking', 'Consumer insights'], order: 3 },
  { _id: 'marketing', title: 'Marketing & Brand Strategy', description: 'Brand positioning, pricing strategies, customer acquisition, and go-to-market planning.', deliverables: ['Brand positioning', 'Pricing strategies', 'Customer acquisition', 'Go-to-market planning'], order: 4 },
  { _id: 'other', title: 'And much more.', description: "Have a different business challenge? We'd love to hear about it.", deliverables: [], order: 5 },
];
export const defaultSettings: Settings = {
  linkedin: 'https://www.linkedin.com/company/dogs-dow/',
  privacyContact: 'dogsdow.official@gmail.com',
  description: "Bringing together students from India's top business schools to work with companies across M&A, strategy, finance, market research, and a wide range of other business challenges.",
};
export const defaultRecruitment: Recruitment = { open: false, expectations: [], process: [] };
