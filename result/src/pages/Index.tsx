import HeroSection from "@/components/HeroSection";
import TCSOverview from "@/components/TCSOverview";
import StrengthsSection from "@/components/StrengthsSection";
import SkillGapsSection from "@/components/SkillGapsSection";
import NextStepsSection from "@/components/NextStepsSection";
import GrowthTimeline from "@/components/GrowthTimeline";
import CompanionSection from "@/components/CompanionSection";

const Index = () => {
  return (
    <div className="min-h-screen dot-texture">
      <HeroSection />
      <div className="max-w-3xl mx-auto px-4 pb-16 flex flex-col gap-4">
        <TCSOverview />
        <SkillGapsSection />
        <StrengthsSection />
        <NextStepsSection />
        <GrowthTimeline />
        <CompanionSection />
      </div>
    </div>
  );
};

export default Index;
