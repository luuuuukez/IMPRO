import { Check } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { reportData } from "@/lib/reportData";

const StrengthsSection = () => {
  const strengths = reportData.strengths?.slice(0, 3) ?? [];

  return (
    <ScrollReveal>
      <div className="glass-card">
        <h2 className="text-xl font-bold font-display gradient-text mb-4">
          Where you're solid
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {strengths.map((s) => (
            <div key={s} className="flex items-center gap-2.5 p-3 rounded-xl bg-background/40 border border-border/50">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-foreground/80 font-medium">{s}</span>
            </div>
          ))}
        </div>

        <p className="text-foreground/60 text-sm leading-relaxed">
          {reportData.insights?.[reportData.insights.length - 1] ??
            "Your technical foundation is strong. Keep building on these areas to accelerate your growth."}
        </p>
      </div>
    </ScrollReveal>
  );
};

export default StrengthsSection;
