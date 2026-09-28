import { business } from "@/config/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#1e90ff" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill="#0d1c33" stroke="#1d3357" />
        <path d="M20 8s8 8.6 8 14.3a8 8 0 0 1-16 0C12 16.6 20 8 20 8Z" fill="url(#logo-g)" />
        <circle cx="20" cy="22.5" r="3.2" fill="none" stroke="#0a1628" strokeWidth="2" />
        <path d="M20 17.4v2M20 25.6v2M14.9 22.5h2M23.1 22.5h2" stroke="#0a1628" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[1.05rem] font-semibold tracking-tight text-white">{business.name}</span>
        <span className="block pt-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-sky">{business.tagline}
          <span className="hidden sm:inline"> · {business.brand}</span>
        </span>
      </span>
    </span>
  );
}
