import { jmpSlides } from './jmp';
import { documents } from './documents.mjs';

export type Paper = {
  id: string;
  title: string;
  status: 'Job market paper' | 'Working paper' | 'Work in progress';
  coauthors?: string[];
  summary: string;
  abstract?: string;
  summaryHref?: string;
  links?: { label: string; href: string }[];
};

// Authoritative sources: package/CV and package/ResearchStatement, read October 4, 2026.
// Private snapshots: source-documents/current/. CV updated October 3, 2026.
// Designated JMP and asylum PDFs are synced to shared local URLs; AI stays on SSRN.
export const papers: Paper[] = [
  {
    id: 'job-application-timing',
    summaryHref: '/research/application-timing/',
    title: 'Time Is of the Essence: Experimental Evidence on the Effects of Job Application Timing',
    status: 'Job market paper',
    summary:
      'Employers often begin contacting candidates before their applicant pools are complete. Using a correspondence experiment and a sequential recruiting model, I study how this tradeoff between speed and screening changes who receives consideration, even when qualifications are held fixed.',
    abstract:
      'This paper studies the role of job application timing in recruitment. Repurposing the correspondence experiment of Kline, Rose and Walters (2022), I show that, holding vacancy and resume content fixed, first-half experimental applications have a contact rate 1.16 percentage points higher, equivalent to 57 percent of the Black-White contact gap in the same setting. Each day earlier raises contact probability by 0.40 percentage points. The key mechanism is that firms often begin contacting while applications are still being received. Using randomized resume attributes, I instrument whether contact has already begun with the highest predicted contact probability among previously submitted applications. Stronger prior applications trigger earlier initiation, and IV estimates confirm a post-initiation contact penalty. The timing gradient is steeper in tighter labor markets. A sequential model separates applicant arrival rates from the shadow cost of delay and quantifies firms’ tradeoff between earlier contact and the screening-value gains from waiting. Conditional on the firm contacting an experimental application, the highest-ranked application has not yet arrived in 51.6 percent of cases, yielding a 6.6 percent loss relative to the contact-initiating application’s expected screening value. Together, the results provide the first large-scale causal evidence that firms’ sequential contact decisions make queue position consequential within vacancies, revealing an employer-side margin through which labor market conditions shape who is considered.',
    links: [
      {
        label: 'Paper (PDF)',
        href: documents.jmp.href,
      },
      { label: 'Slides (PDF)', href: jmpSlides.href },
    ],
  },
  {
    id: 'when-hierarchies-teach',
    title: 'When Hierarchies Teach: Selective Review and Decision Alignment in U.S. Asylum Courts',
    status: 'Working paper',
    coauthors: ['Daniel L. Chen'],
    summary:
      'How do professionals learn from selectively generated feedback? Linking immigration-court and appellate records, we study how the information in a reversal and judges’ responsiveness shape subsequent decisions and alignment with the appellate standard.',
    abstract:
      'Review by a higher authority evaluates experts’ first-instance decisions and informs their subsequent choices, but this feedback is selectively generated. We study this process in U.S. asylum courts, where feedback follows a denial, applicant appeal, and Board of Immigration Appeals (BIA) disposition. Using linked immigration-court and BIA records from 1986 to 2019, we develop a rolling prediction model to distinguish expected from surprise reversals using information available to judges before appellate resolution. Weekly event studies show a 1.57-percentage-point larger first-week increase in lower-court grant rates after surprise than after expected reversals, with no broad decline in observable hearing-diligence proxies. We develop a threshold model of response magnitude and distributional alignment with the BIA standard. Marginal treatment effects (MTEs) show that reversal rates among denied cases vary less with judge leniency for high-response than low-response judges. The model interprets this pattern as closer alignment with the BIA standard, especially where decision thresholds are stricter. The pattern appears on both appeal filing among denials and BIA success conditional on appeal, with the clearest contrast on appeal filing. This alignment gap is smaller in defensive than affirmative proceedings, consistent with structured hearings making feedback more usable. Review’s teaching function therefore depends on feedback selection, signal diagnosticity, and recipient responsiveness.',
    links: [
      {
        label: 'Paper (PDF)',
        href: documents.judgeLearning.href,
      },
    ],
  },
  {
    id: 'ai-training-access',
    title: 'From AI Exposure to Training Access: Evidence from U.S. Workforce Boards',
    status: 'Working paper',
    summary:
      'I study how public workforce systems respond to changing skill demand after the rise of generative AI. Linked administrative records show how funding and prior delivery experience shape access to training, and why expanded program menus need not become funded AI training.',
    abstract:
      'I link 2017-2024 administrative records from local boards under the Workforce Innovation and Opportunity Act (WIOA) to training provider listings and state funding to provide new empirical evidence on how public training systems respond to post-GenAI changes in expected skill demand. After ChatGPT’s launch in 2022, boards serving more AI-exposed workers and with greater prior experience show a 3-percentage-point larger rise in training participation, about 30 additional trainees per 1,000 participants. Training content shifts much less toward AI-related fields. Eligible-provider listings expand, but listed programs do not automatically translate into funded AI training. The access response is larger in state-years with greater formula allotments, and training activity becomes more concentrated in boards with established routines. The findings show that public workforce systems can expand access when resources and delivery experience are in place. Targeted AI retraining, however, depends on whether those systems convert provider availability and fiscal support into funded participation.',
    links: [
      {
        label: 'SSRN',
        href: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6966880',
      },
    ],
  },
  {
    id: 'employer-networks',
    title: 'Employer Networks as Organizational Capital in Professional Education: Evidence from U.S. Law Schools',
    status: 'Work in progress',
    summary:
      'Linking law-school histories to graduates’ careers, I trace employer relationships around school formation, reorganization, and closure. The project studies how institutions maintain hiring ties that connect successive cohorts to jobs.',
  },
  {
    id: 'reallocating-expertise',
    title: 'Reallocating Expertise in the AI Era: Evidence from the U.S. Patent Office',
    status: 'Work in progress',
    summary:
      'As demand for evaluating AI inventions grows, how does the Patent Office expand specialized capacity? I link application histories, examiner assignments, and written decisions to study how work shifts across experienced specialists, newly observed examiners, and tasks.',
  },
  {
    id: 'delegation-under-deadlines',
    title: 'Delegation under Deadlines: Evidence from U.S. Patent Prosecution',
    status: 'Work in progress',
    summary:
      'Patent counsel manage multiple clients and recurring deadlines. I am linking prosecution histories to providers and clients to study how competing tasks and organizational form affect the timely provision of professional services.',
  },
  {
    id: 'strategic-predictability',
    title: 'Strategic Predictability: Theory and Evidence from Professional Tennis',
    status: 'Work in progress',
    summary:
      'A dynamic model and evidence from professional tennis serves examine when predictable behavior can be an investment in future payoffs. The project separates learning about one’s own payoffs from shaping an opponent’s expectations.',
  },
  {
    id: 'beyond-the-altar',
    title: 'Beyond the Altar: Catholic Convents and Gender Norms in the United States, 1850-1940',
    status: 'Work in progress',
    coauthors: ['Monia Tomasella', 'Juan David Torres'],
    summary:
      'Using historical religious-order catalogs and linked census records, we are developing an analysis of whether Catholic convents changed marriage and occupational choices among women who never entered religious life, and how material opportunities and social expectations interact.',
  },
];
