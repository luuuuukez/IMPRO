import { Clock } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { reportData } from "@/lib/reportData";

const recs = reportData.recommendations?.slice(0, 3) ?? [];
const gapNames = reportData.gaps ?? [];

const steps = recs.map((action, i) => ({
  priority: i < 2 ? "High" : "Medium",
  skill: gapNames[i] ?? `Area ${i + 1}`,
  action,
  time: i === 2 ? "Ongoing" : `~${3 + i} weeks`,
}));

const NextStepsSection = () => (
  <ScrollReveal>
    <div className="glass-card">
      <h2 className="text-xl font-bold font-display gradient-text mb-5">
        What to focus on next
      </h2>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.skill} className="p-4 rounded-xl bg-background/40 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                step.priority === "High"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step.priority}
              </span>
              <h3 className="text-sm font-semibold font-display text-foreground">{step.skill}</h3>
            </div>
            <p className="text-xs text-foreground/60 mb-2">{step.action}</p>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {step.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  </ScrollReveal>
);

export default NextStepsSection;
