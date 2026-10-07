import { cn } from "@/lib/utils";

const particles = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + (i % 3),
  dur: 18 + ((i * 7) % 16),
  delay: -((i * 5) % 20),
}));

/** Elegant mesh-gradient background. `intense` for login, subtle in app. */
export function AnimatedBg({ intense = false }: { intense?: boolean }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", intense ? "bg-gradient-navy" : "bg-background")}>
      <div className={cn("absolute -left-1/4 -top-1/4 size-[70vw] rounded-full bg-primary blur-[120px] animate-blob", intense ? "opacity-35" : "opacity-[0.07]")} />
      <div
        className={cn("absolute -bottom-1/3 right-[-10%] size-[60vw] rounded-full bg-primary-glow blur-[140px] animate-blob", intense ? "opacity-30" : "opacity-[0.08]")}
        style={{ animationDelay: "-9s" }}
      />
      <div
        className={cn("absolute left-1/3 top-1/3 size-[40vw] rounded-full bg-navy blur-[120px] animate-blob", intense ? "opacity-60" : "opacity-[0.05]")}
        style={{ animationDelay: "-17s" }}
      />
      <div className={cn("absolute inset-0 grid-lines", intense ? "opacity-60" : "opacity-40")} />
      {particles.map((p, i) => (
        <span
          key={i}
          className={cn("absolute bottom-[-10px] rounded-full bg-primary-glow animate-float-up", intense ? "opacity-80" : "opacity-30")}
          style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, boxShadow: "0 0 8px var(--primary-glow)" }}
        />
      ))}
    </div>
  );
}
