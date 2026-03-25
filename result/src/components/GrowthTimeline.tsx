import ScrollReveal from "./ScrollReveal";

const milestones = [
  { date: "Oct 2025", label: "Started React Advanced course" },
  { date: "Nov 2025", label: "Completed RESTful API assessment" },
  { date: "Dec 2025", label: "First system design scenario attempt" },
  { date: "Jan 2026", label: "Cloud fundamentals — marked familiar" },
  { date: "Feb 2026", label: "PR review quality improved (peer signal)" },
  { date: "Mar 2026", label: "Distributed Systems — first assessment" },
];

const GrowthTimeline = () => (
  <ScrollReveal>
    <div className="glass-card">
      <h2 className="text-xl font-bold font-display gradient-text mb-6">
        Growth milestones
      </h2>
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-primary/30" />
        <div className="space-y-5">
          {milestones.map((m, i) => (
            <div key={i} className="relative flex items-start gap-4">
              <div className="relative z-10 mt-1.5 w-[15px] h-[15px] rounded-full border-2 border-primary bg-background flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{m.date}</p>
                <p className="text-sm text-foreground/80">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </ScrollReveal>
);

export default GrowthTimeline;
