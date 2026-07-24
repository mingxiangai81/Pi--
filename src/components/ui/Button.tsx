import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'gold' | 'ghost' | 'cinnabar';

const styles: Record<Variant, string> = {
  gold: 'bg-gradient-to-b from-gold-light to-gold text-ink-950 font-semibold shadow-glow hover:brightness-110',
  cinnabar: 'bg-cinnabar text-white font-semibold shadow-glow-red hover:bg-cinnabar-light',
  ghost: 'border border-gold/40 text-gold-light hover:bg-gold/10',
};

export function Button({
  children,
  variant = 'gold',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
