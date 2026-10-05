import { site } from './site';

export type TeachingExperience = {
  role: string;
  institution: string;
  period: string;
  courses: string[];
};

export type CurriculumEntry = {
  id: string;
  title: string;
  level: string;
  summary: string;
  links?: { label: string; href: string }[];
};

// Current package/CV and package/TeachingStatement, read October 4, 2026.
// Private snapshots: source-documents/current/. Experience below is completed.
export const experience: TeachingExperience[] = [
  {
    role: 'Teaching assistant',
    institution: 'University of Southern California',
    period: 'Spring 2025',
    courses: ['Microeconomic Theory II (Ph.D. core)'],
  },
  {
    role: 'Teaching assistant',
    institution: 'University of Southern California',
    period: 'Fall 2022 and Fall 2024',
    courses: ['Principles of Microeconomics (undergraduate)'],
  },
  {
    role: 'Teaching assistant',
    institution: 'University of Southern California',
    period: 'Spring 2023',
    courses: ['Economic Consulting and Applied Managerial Economics (undergraduate)'],
  },
];

export const teachingIntro =
  'I want students to ask economic questions, use theory to reason through them, and judge what the evidence can establish. My teaching connects intuition, models, and evidence to develop empirical judgment and research independence.';

export const teachingExperienceNote =
  'In Microeconomic Theory II, I independently delivered a lecture on public goods and externalities and a review lecture. In Economic Consulting and Applied Managerial Economics, I guided student teams as they narrowed questions, analyzed data, and developed clear consulting reports and research proposals grounded in evidence.';

export const teachingApproach =
  'For the courses I have designed, research labs connect each lecture topic to a paper chosen for its economic question and empirical method. Students would reproduce a key result, then consider how the analysis would need to change to address a question of their own, explaining when the method is appropriate and where it falls short. Simulations complement this work by showing how economic mechanisms affect observable outcomes.';

// Designed materials for future teaching; these are not past course appointments.
export const curriculum: CurriculumEntry[] = [
  {
    id: 'labor-i',
    links: [{ label: 'Course materials', href: `${site.portfolio}labor-i/` }],
    title: 'Labor I',
    level: 'Graduate curriculum; adaptable for undergraduates',
    summary:
      'The first part of a two-semester labor sequence starts with workers’ decisions about employment, skills, and careers, connecting individual choices to wages, employment, and inequality.',
  },
  {
    id: 'labor-ii',
    links: [{ label: 'Course materials', href: `${site.portfolio}labor-ii/` }],
    title: 'Labor II',
    level: 'Graduate curriculum; adaptable for undergraduates',
    summary:
      'The firms, frictions, and institutions that shape workers’ opportunities. This course complements Labor I by examining the employer side of the labor market.',
  },
  {
    id: 'empirical-methods',
    links: [{ label: 'Course materials', href: `${site.portfolio}empirical-methods/` }],
    title: 'Applied empirical methods',
    level: 'Graduate curriculum; adaptable for undergraduates',
    summary:
      'Choosing comparisons, measuring economic outcomes, and assessing the assumptions behind an empirical argument. Readings and exercises would introduce new methods through recent labor research; labs connect reproducing a result to assessing a new research design.',
  },
  {
    id: 'special-topics',
    links: [
      { label: 'Organizational economics', href: `${site.portfolio}special-topic8-organizational/` },
      { label: 'Behavioral labor', href: `${site.portfolio}special-topic1-behavioral/` },
    ],
    title: 'Special topics in labor economics',
    level: 'Ph.D. curriculum',
    summary:
      'Modules in organizational economics and behavioral labor connect basic models to current research. Designed for full- or half-semester offerings, they culminate in a research memo proposing a question and a design to answer it.',
  },
];

export const undergraduateFit =
  'I am prepared to teach microeconomics, labor economics, and applied empirical methods. I would emphasize graphical reasoning and guided empirical work, helping students interpret evidence, assess policy and business decisions, and explain their reasoning in writing or a presentation.';

export const graduateFit =
  'I am prepared to teach graduate labor economics and applied empirical methods. At the Ph.D. level, I would emphasize formal assumptions, identification, and the judgment required to choose a research question and an appropriate method, with feedback on both the question and the design.';
