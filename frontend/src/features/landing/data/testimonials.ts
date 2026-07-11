export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

/** Fictional customer testimonials. Names and companies are invented. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'We replaced three tools with TalentFlow and cut our time-to-hire nearly in half. The pipeline view is the first thing my team opens every morning.',
    name: 'Priya Raman',
    role: 'Head of Talent',
    company: 'NovaTech',
  },
  {
    quote:
      'Sourcing used to mean spreadsheets and guesswork. Now shortlists are ready before the kickoff call. It just keeps up with us.',
    name: 'Daniel Okafor',
    role: 'Recruiting Lead',
    company: 'Vertex',
  },
  {
    quote:
      'Candidates finally get a clean, honest experience — and we get the reporting to prove hiring is working. Adoption was immediate.',
    name: 'Mara Lindqvist',
    role: 'VP People',
    company: 'Lumina',
  },
];
