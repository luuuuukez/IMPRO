import { motion } from "framer-motion";
import { useReportData } from "@/lib/reportData";

const roleFitLabel: Record<string, string> = {
  strong_fit: "Strong Fit",
  partial_fit: "Partial Fit",
  weak_fit: "Weak Fit",
};

const HeroSection = () => {
  const reportData = useReportData();
  const date = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const roleFit = roleFitLabel[reportData.role_fit] ?? reportData.role_fit;
  const insight = reportData.insights?.[0] ?? "You have room to grow — and a clear path forward.";

  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-3xl"
      >
        {/* IMPRO Orb */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 w-10 h-10 rounded-full bg-primary/60 glow-circle"
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold font-display gradient-text mb-3"
        >
          Your IMPRO Report
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-sm text-muted-foreground mb-5"
        >
          {roleFit} · {date}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-sm md:text-base italic text-foreground/60 max-w-xl mx-auto leading-relaxed"
        >
          "{insight}"
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
