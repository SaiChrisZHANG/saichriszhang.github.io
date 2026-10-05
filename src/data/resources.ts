export type Resource = {
  id: string;
  type: 'Data' | 'Software';
  title: string;
  description: string;
  coverage?: string;
  language?: string;
  links: { label: string; href: string }[];
  attribution?: string;
};

// Restored from SaiZhang_Website_Revision_1.txt and checked October 4, 2026.
// DOI titles and creator verified through DataCite; Harvard's landing pages
// returned HTTP 202 without a body. Keep the supplied stable DOI URLs.
export const resources: Resource[] = [
  {
    id: 'congressional-election-results',
    type: 'Data',
    title: 'U.S. Congressional Election Results (1920–1974)',
    coverage: 'House and Senate · 1920–1974',
    description:
      'Cleaned and structured U.S. House and Senate election results, compiled from the official election statistics maintained by the Clerk of the U.S. House of Representatives.',
    links: [
      { label: 'Dataset (DOI)', href: 'https://doi.org/10.7910/DVN/WBEYJN' },
      { label: 'Code / report an issue', href: 'https://github.com/SaiChrisZHANG/us-congress-1920-1974' },
      { label: 'Source', href: 'https://history.house.gov/Institution/Election-Statistics/Election-Statistics/' },
    ],
  },
  {
    id: 'congressional-bill-information',
    type: 'Data',
    title: 'U.S. Congressional Bill Information (1973–2024)',
    coverage: '93rd through 118th Congresses',
    description:
      'Information from Congress.gov on bills that reached floor consideration or later stages, including titles, sponsors, policy areas, committees, cosponsors, subject terms, and related legislation.',
    links: [
      { label: 'Dataset (DOI)', href: 'https://doi.org/10.7910/DVN/XHBFF4' },
      // Canonical HTTPS destination verified with the web tool; direct requests
      // receive HTTP 403. The recovered source used http://congress.gov/.
      { label: 'Source', href: 'https://www.congress.gov/' },
    ],
  },
  {
    id: 'multe-r',
    type: 'Software',
    title: 'multe-R',
    language: 'R',
    description:
      'An R implementation of multiple-treatment-effects regression with saturated group controls, based on Goldsmith-Pinkham, Hull, and Kolesár (2022).',
    links: [
      { label: 'Code and documentation', href: 'https://github.com/SaiChrisZHANG/multe-R' },
      { label: 'Method reference', href: 'https://www.nber.org/papers/w30108' },
    ],
  },
  {
    id: 'rdhonest-stata',
    type: 'Software',
    title: 'RDHonest (Stata)',
    language: 'Stata',
    description:
      'Honest confidence intervals for sharp and fuzzy regression discontinuity designs using local linear regression, based on the work of Armstrong and Kolesár.',
    // Credits are listed in the upstream rdhonest.sthlp and rdhonest.pkg files.
    attribution:
      'Software credits: Timothy Armstrong, Michal Kolesár, Yugen Chen, Sai Zhang, and Kwok-Hao Lee.',
    links: [
      { label: 'Code and documentation', href: 'https://github.com/tbarmstr/RDHonest-vStata' },
      { label: 'Method (2018)', href: 'https://www.econometricsociety.org/publications/econometrica/2018/03/01/optimal-inference-class-regression-models' },
      { label: 'Method (2020)', href: 'https://www.econometricsociety.org/publications/quantitative-economics/2020/01/01/Simple-and-honest-confidence-intervals-in-nonparametric-regression' },
    ],
  },
];
