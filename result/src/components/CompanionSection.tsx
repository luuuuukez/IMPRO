import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { reportData } from "@/lib/reportData";

const topGap = reportData.gaps?.[0] ?? "your top skill gap";

const CompanionSection = () => (
  <ScrollReveal>
    <div className="glass-card text-center">
      <h2 className="text-xl font-bold font-display gradient-text mb-6">
        Your companion
      </h2>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/50 glow-circle"
      />

      <p className="text-sm font-semibold font-display text-foreground mb-0.5">IMPRO Orb</p>
      <p className="text-xs text-muted-foreground mb-5">Juvenile · Stage 2 of 4</p>

      <div className="max-w-xs mx-auto mb-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>340 XP</span>
          <span>500 XP</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full progress-bar-fill" style={{ width: "68%" }} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 mb-6">
        Close your {topGap} gap to unlock the next evolution
      </p>

      <p className="text-sm italic text-foreground/50">
        "Growth isn't linear. But it's always forward."
      </p>
    </div>
  </ScrollReveal>
);

export default CompanionSection;
