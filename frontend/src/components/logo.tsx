export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-700 text-white ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 2 8l10 5 10-5-10-5Z" strokeLinejoin="round" />
        <path d="M5 10.5V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-5.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
