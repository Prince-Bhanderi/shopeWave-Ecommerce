// Hand-authored, stroke-based social icons matching lucide-react's default geometry
// (24x24 viewBox, 2px stroke, round caps/joins, currentColor) so they drop in wherever
// a lucide icon component is used. lucide-react no longer ships brand/logo icons
// (Facebook/Instagram/Twitter/Youtube were removed upstream), so these fill that gap
// without pulling in an extra dependency.

export const FacebookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v3h2v7h3v-7h2.5l.5-3H12V8a1 1 0 0 1 1-1h2z" />
  </svg>
);

export const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
);

export const YoutubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="6" width="19" height="12" rx="4" />
    <path d="M10.3 9.6v4.8l4.2-2.4z" fill="currentColor" stroke="none" />
  </svg>
);
