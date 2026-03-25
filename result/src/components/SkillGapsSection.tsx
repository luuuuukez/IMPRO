import { TrendingUp, ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { reportData } from "@/lib/reportData";

const techSkills = reportData.technical;

function getLevelPercent(gapName: string, index: number): number {
  const lower = gapName.toLowerCase();
  if (lower.includes("system") || lower.includes("design") || lower.includes("architect")) {
    return Math.round((techSkills.system_design.capability / 100) * 100);
  }
  if (lower.includes("program") || lower.includes("debug") || lower.includes("code")) {
    return Math.round((techSkills.debugging.capability / 100) * 100);
  }
  if (lower.includes("ai") || lower.includes("ml") || lower.includes("machine")) {
    return Math.round((techSkills.ai_application.capability / 100) * 100);
  }
  return Math.max(15, 45 - index * 10);
}

const gapNames = reportData.gaps?.slice(0, 3) ?? [];

const gaps = gapNames.map((skill, i) => ({
  skill,
  levelPercent: getLevelPercent(skill, i),
  demand: 90 - i * 5,
  trend: i < 2 ? "↑ Trending fast" : "→ Stable demand",
  trending: i < 2,
  why: reportData.insights?.[i] ?? "Market demand signal identified from your profile.",
}));

const SkillGapsSection = () => (
  <ScrollReveal>
    <div className="glass-card">
      <h2 className="text-xl font-bold font-display gradient-text mb-1">
        Where the gaps are hiding
      </h2>
      <p className="text-xs text-muted-foreground mb-5">Skills the market increasingly demands that you haven't fully developed yet.</p>

      <div className="space-y-4">
        {gaps.map((gap) => (
          <div key={gap.skill} className="p-4 rounded-xl bg-background/40 border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-semibold font-display text-foreground">{gap.skill}</h3>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                gap.trending
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {gap.trending ? <TrendingUp className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                {gap.trend}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Current Level</p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full progress-bar-fill" style={{ width: `${gap.levelPercent}%` }} />
                </div>
                <p className="text-[11px] text-foreground/50 mt-0.5">{gap.levelPercent}%</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Market Demand</p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/40" style={{ width: `${gap.demand}%` }} />
                </div>
                <p className="text-[11px] text-foreground/50 mt-0.5">{gap.demand}%</p>
              </div>
            </div>

            <p className="text-xs text-foreground/50 italic">{gap.why}</p>
          </div>
        ))}
      </div>
    </div>
  </ScrollReveal>
);

export default SkillGapsSection;
