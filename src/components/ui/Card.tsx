import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  title,
  icon,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}) {
  return (
    <section className={`glass rounded-2xl p-5 shadow-lg ${className}`}>
      {title && (
        <header className="mb-4 flex items-center gap-2">
          {icon && <span className="text-gold">{icon}</span>}
          <h2 className="text-base font-semibold tracking-wide text-gold-light">{title}</h2>
        </header>
      )}
      {children}
    </section>
  );
}
