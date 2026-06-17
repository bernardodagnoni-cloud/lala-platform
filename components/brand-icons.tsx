export function GoldStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M60,12 L66.2,41 L88.2,21.2 L76.2,48.2 L105.6,45.2 L80,60 L105.6,74.8 L76.2,71.8 L88.2,98.8 L66.2,79 L60,108 L53.8,79 L31.8,98.8 L43.8,71.8 L14.4,74.8 L40,60 L14.4,45.2 L43.8,48.2 L31.8,21.2 L53.8,41 Z" fill="#FFC200"/>
      <circle cx="60" cy="60" r="11" fill="white"/>
      <circle cx="60" cy="60" r="7" fill="#FFC200"/>
      <circle cx="88" cy="38" r="3" fill="#FFC200"/>
      <circle cx="38" cy="82" r="4" fill="#FFC200"/>
      <circle cx="78" cy="22" r="2" fill="#FFC200"/>
    </svg>
  );
}

export function BlueSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M60,4 C59,32 42,52 4,60 C42,68 59,88 60,116 C61,88 78,68 116,60 C78,52 61,32 60,4 Z" fill="#3C35DE"/>
      <path d="M88,16 C87.5,26 81,32 71,36 C81,40 87.5,46 88,56 C88.5,46 95,40 105,36 C95,32 88.5,26 88,16 Z" fill="#3C35DE"/>
      <path d="M100,6 C99.8,10 97,12.5 93,14 C97,15.5 99.8,18 100,22 C100.2,18 103,15.5 107,14 C103,12.5 100.2,10 100,6 Z" fill="#3C35DE"/>
    </svg>
  );
}
