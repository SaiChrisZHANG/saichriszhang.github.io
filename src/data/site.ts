import { documents } from './documents.mjs';

export const site = {
  name: 'Sai Zhang',
  role: 'Ph.D. candidate in Economics',
  affiliation: 'University of Southern California',
  email: 'saizhang@usc.edu',
  github: 'https://github.com/SaiChrisZHANG',
  orcid: 'https://orcid.org/0009-0000-0814-842X',
  portfolio: 'https://saichriszhang.github.io/labor_teaching/',
  cv: documents.cv.href,
  fields: 'Labor Economics · Applied Microeconomics',
  description: 'Sai Zhang is a micro labor economist and Ph.D. candidate at the University of Southern California, studying organizations and labor-market opportunities.',
  bio: 'I am a micro labor economist studying how organizational decisions and social institutions shape hiring and labor-market opportunities.',
  agenda: 'My research examines how workers reach employers and how organizations hire, learn, and allocate work. I study application timing, training systems, employer networks, and professional decision-making.',
  methods: 'I combine experiments and linked administrative, historical, and text-based records with economic models to make these decision processes measurable.',
  researchIntro: 'I study access to work and the formation of matches, alongside learning and coordination within organizations. Across these projects, I ask how hiring, training, feedback, and the allocation of work shape labor-market opportunities.',
  jobMarket: { active: true, cycle: '2026–2027' },
  portrait: { src: '/images/sai-zhang.jpg', alt: 'Sai Zhang' } as null | { src: string; alt: string },
};

export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Research', href: '/research/' },
  { label: 'Teaching', href: '/teaching/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'More', href: '/more/' },
];

// Personal interests from the existing homepage; player URLs supplied by Sai.
export const personal = {
  intro: 'Outside economics, I enjoy music, writing fiction, film criticism, cooking, and makeup.',
  music: [
    {
      title: 'No. 10 — La cathédrale engloutie',
      description: 'Claude Debussy · A piano prelude',
      href: 'https://soundcloud.com/user-204581339/no10-la-cathedrale-engloutie',
      playerSrc: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A1988657483&color=%23a94415&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&single_active=true',
    },
    {
      title: "If I Ain't Got You",
      description: 'Alicia Keys · Cover',
      href: 'https://soundcloud.com/user-204581339/if-i-aint-got-you',
      playerSrc: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2413146027&color=%23a94415&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&single_active=true',
    },
  ],
};
