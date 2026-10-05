export type JmpFigure = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export type JmpSection = {
  id: string;
  title: string;
  paragraphs: (string | (string | { text: string; href: string })[])[];
  figure?: JmpFigure;
  figureGroup?: {
    figures: JmpFigure[];
    caption: string;
  };
};

// Read-only sources: ApplicationTiming/draft/main.pdf and
// ApplicationTiming/presentation/jobtalk/main.pdf, both dated October 3, 2026.
// Claim and figure provenance: source-documents/revision-1/JMP_SOURCE_NOTES.txt.
// Revised narrative audit: source-documents/revision-2/summary-audit.txt.
// Shared title, abstract, and material links remain in research.ts.
export const jmpDetail: {
  sourceDate: string;
  sourceLabel: string;
  lead: string;
  sections: JmpSection[];
} = {
  sourceDate: 'October 3, 2026',
  sourceLabel: 'Paper and job-talk slides',
  lead:
    'Employers often begin contacting candidates before all applications have arrived. Using a large correspondence experiment, I show that this decision makes application timing consequential even when qualifications are held fixed. Earlier experimental applications receive more consideration because they reach employers before the recruiting process moves into its contact phase. A sequential model quantifies the screening-value gains firms forgo when they move sooner.',
  sections: [
    {
      id: 'setting-and-design',
      title: 'Setting & design',
      paragraphs: [
        [
          'I repurpose the correspondence experiment of ',
          { text: 'Kline, Rose, and Walters (2022)', href: 'https://academic.oup.com/qje/article-abstract/137/4/1963/6605934' },
          ', which sent 83,643 applications to 11,114 entry-level vacancies at 108 large U.S. firms between October 2019 and April 2021. Each vacancy was scheduled to receive eight applications in four pairs over several days. The outcome is employer contact within 30 days.',
        ],
        'These applications serve as experimental tracers of the recruiting process: their staggered arrival and recorded contacts reveal how employer decisions change as applications accumulate. Résumé characteristics were randomized across applications, including race-signaling names, gender, education, and employment history. Comparing applications to the same vacancy, with controls for these characteristics, identifies the effect of relative arrival time within the experimental submission window.',
      ],
    },
    {
      id: 'early-application-advantage',
      title: 'The early advantage',
      paragraphs: [
        'Applications in the first half of the experimental sequence are 1.16 percentage points more likely to receive contact, with a standard error of 0.24 percentage points. The average contact rate is about 24 percent. As a magnitude benchmark, the timing effect is 57 percent of the Black–White contact gap in the same experiment.',
        'A calendar-time specification estimates a 0.40-percentage-point increase in contact probability per additional day earlier, with a standard error of 0.08 percentage points. This measure counts days before the final experimental submission and caps the count at seven. Estimates remain similar when restricted to vacancies receiving all eight applications. The early advantage also appears when timing is measured as days since the first experimental submission.',
      ],
      figure: {
        src: '/images/research/application-timing-contact-gradient.png',
        alt: 'Contact probability differences rise as applications arrive more days before the final experimental submission; the final submission day is the reference category.',
        caption:
          'Contact gaps by days before the final experimental submission, relative to the final day. Earlier applications appear on the left; 7+ pools seven or more days. Coefficients are probability differences: 0.01 equals one percentage point. Full sample; vacancy fixed effects and randomized résumé controls. Shading shows 95% confidence intervals with standard errors clustered by vacancy. Source: paper Figure 1B.',
        width: 1800,
        height: 1440,
      },
    },
    {
      id: 'contact-initiation',
      title: 'Contact initiation',
      paragraphs: [
        'Contact often begins while experimental applications are still arriving. Among the 4,036 vacancies with at least one experimental contact, 1,899 receive further experimental submissions after contact begins. Here, initiation is the first observed contact with an experimental application. In the paper’s contact-history comparison, contact probability falls from 26.41 to 9.74 percent after an earlier experimental contact, a drop of about 63 percent.',
        'Contact initiation is endogenous, so I use randomized résumé quality to study what triggers it. An out-of-fold contact prediction measures employer-perceived screening value. Stronger best-so-far applications predict earlier initiation; using this variation as an instrument supports a negative effect on subsequent consideration. Additional evidence favors this sequential threshold mechanism: the early advantage disappears when contact begins after the full experimental sequence has arrived; future applications’ screening values do not predict earlier contact decisions; and later submissions are generally contacted later. Together, these tests weigh against mechanical priority or a motivation signal from an early timestamp, full-pool comparison, and pure batch review.',
      ],
      figure: {
        src: '/images/research/application-timing-contact-initiation.png',
        alt: 'Contact probability is approximately stable before first experimental contact and lower for applications submitted afterward, relative to applications submitted one day before initiation.',
        caption:
          'Descriptive contact gaps relative to applications submitted one day before the first experimental contact. The sample includes vacancies with an experimental contact; same-day submissions are excluded because within-day ordering is unknown. Endpoints pool seven or more days. Controls include vacancy, submission-order, and weekday fixed effects plus résumé characteristics. Bars show 95% confidence intervals clustered by vacancy. These are probability differences, not percentage changes. Source: paper Figure 3.',
        width: 1800,
        height: 1107,
      },
    },
    {
      id: 'screening-value',
      title: 'The value of waiting',
      paragraphs: [
        'Guided by the mechanism evidence, I model employers’ choice between waiting for more applications and beginning contact. The sequential model separates applicant arrival intensity from the shadow cost of waiting. Employers begin contacting when the best application that has arrived so far crosses a threshold. Observed submission schedules and contact-initiation patterns discipline the estimated stopping decision.',
        'For vacancies with eight experimental applications, the model implies that the highest-ranked experimental application has not yet arrived in 51.6 percent of cases, conditional on initiation being assigned to an experimental applicant. The expected gap between the best experimental application overall and the best that has arrived by initiation is 6.6 percent of the expected screening value of the application assigned initiation weight. Counterfactual changes in delay costs and recruiting conditions trace a frontier between contact speed and screening-value loss. As firms adjust their optimal contact rule, earlier initiation comes with a higher probability of missing the best experimental application and a larger relative timing loss.',
        'The model quantifies firms’ tradeoff between a larger applicant pool and the cost of waiting. Firms optimize privately: they enter the contact phase once the expected screening-value gain from waiting falls below the cost of delay. The loss reflects a structural timing friction from sequential arrival. At any given initiation date, better screening of applications already received cannot eliminate the loss from applications that have yet to arrive.',
      ],
      figureGroup: {
        figures: [
          {
            src: '/images/research/application-timing-speed-loss-probability.png',
            alt: 'The probability of missing the best experimental application falls as expected contact initiation moves later across model counterfactuals.',
            caption: 'Missed-best probability (0.50 = 50%). Source: paper Figure 6A.',
            width: 1800,
            height: 1440,
          },
          {
            src: '/images/research/application-timing-speed-loss-value.png',
            alt: 'Relative timing loss falls as expected contact initiation moves later across model counterfactuals.',
            caption: 'Relative timing loss (0.06 = 6%). Source: paper Figure 6B.',
            width: 1800,
            height: 1440,
          },
        ],
        caption: 'The speed–loss frontier. Each point recomputes the optimal contact rule and initiation weights under different delay costs, labor-market tightness, or aggregate recruiting conditions, holding application schedules and the screening-value index fixed. The red diamond marks the baseline; blue dots halve or double the shadow cost of delay, κ. Both axes condition on experimental initiation in vacancies with eight applications. The horizontal axis measures the expected initiation-day bin from the first experimental submission, with the final bin top-coded at seven.',
      },
    },
    {
      id: 'recruiting-implications',
      title: 'Implications',
      paragraphs: [
        'The results have important welfare implications: For firms, recruiting speed is a margin of competition alongside wages and amenities. Moving quickly can secure candidates while waiting preserves the option value of additional applications. For applicants, the timing premium creates an incentive to compete on submission speed, with potential disadvantages for those less able to apply quickly. At the market level, timing gradients are steeper in tighter labor markets, suggesting that endogenous contact timing can provide a microfoundation for the cyclicality of matching efficiency.',
        'Together, my job market paper connects employers’ contact decisions to the distribution of labor-market opportunities and motivates further work on how recruiting organization shapes applicant consideration.',
      ],
    },
  ],
};

export const jmpSlides = {
  href: '/files/JobTalk_ApplicationTiming.pdf',
  date: 'October 3, 2026',
};
