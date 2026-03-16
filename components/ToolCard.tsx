interface ToolCardProps {
  name: string;
  capability: string;
  primaryFunction: string;
  description: string;
  disciplines: string[];
  url: string;
}

export function ToolCard({ name, capability, primaryFunction, description, disciplines, url }: ToolCardProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--border-strong)] transition-colors flex flex-col h-full">
      <div className="mb-4">
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">{capability}</span>
        <h3 className="text-lg font-medium text-[var(--text)] tracking-tight mt-1">{name}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">{primaryFunction}</p>
      </div>
      
      <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-grow mb-6 font-light">
        {description}
      </p>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {disciplines.map(disc => (
            <span key={disc} className="px-2 py-1 bg-[var(--surface-sub)] border border-[var(--border)] rounded-md text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {disc}
            </span>
          ))}
        </div>
      </div>

      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--surface-sub)] border border-[var(--border)] text-[var(--text)] rounded-xl text-sm font-medium hover:bg-[var(--border)] transition-colors mt-auto"
      >
        Visit Website
      </a>
    </div>
  );
}
