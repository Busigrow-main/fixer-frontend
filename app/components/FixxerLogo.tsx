type FixxerLogoProps = {
  className?: string;
  wordClassName?: string;
  accentClassName?: string;
};

export default function FixxerLogo({
  className = "",
  wordClassName = "text-zinc-900",
  accentClassName = "text-primary",
}: FixxerLogoProps) {
  return (
    <span aria-label="Fixxer" className={`inline-flex select-none font-black tracking-tighter ${className}`}>
      <span className={`fixxer-logo-word ${wordClassName}`}>Fixx</span>
      <span className={`fixxer-logo-accent ${accentClassName}`}>er</span>
    </span>
  );
}
