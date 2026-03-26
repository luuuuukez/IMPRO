import ScrollReveal from "./ScrollReveal";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { useReportData } from "@/lib/reportData";

function avg(vals: number[]): number {
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const TCSOverview = () => {
  const reportData = useReportData();

  const techSkills = Object.values(reportData.technical);
  const techScore = parseFloat(((avg(techSkills.map(s => s.capability)) / 100) * 3).toFixed(2));

  const cogVals = Object.values(reportData.cognitive);
  const cogScore = parseFloat(((avg(cogVals) / 2) * 3).toFixed(2));

  const socVals = Object.values(reportData.social);
  const socScore = parseFloat(((avg(socVals) / 2) * 3).toFixed(2));

  const radarData = [
    { dimension: "Technical", value: techScore, benchmark: 2.5, fullMark: 3 },
    { dimension: "Cognitive", value: cogScore,  benchmark: 2.0, fullMark: 3 },
    { dimension: "Social",    value: socScore,  benchmark: 2.0, fullMark: 3 },
  ];

  const highest = radarData.reduce((a, b) => a.value > b.value ? a : b);
  const lowest  = radarData.reduce((a, b) => a.value < b.value ? a : b);
  const summaryText = `Your ${highest.dimension.toLowerCase()} skills are your foundation. ${lowest.dimension} dimension has the most room to grow.`;

  return (
    <ScrollReveal>
      <div className="glass-card">
        <h2 className="text-xl font-bold font-display gradient-text mb-2">
          Your TCS Profile
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Three dimensions that define your professional capability</p>

        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" gridType="polygon" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(213 100% 94%)", fontSize: 12, fontFamily: "Space Grotesk" }} />
            <PolarRadiusAxis angle={90} domain={[0, 3]} tickCount={4} tick={false} axisLine={false} />
            <Radar name="Score" dataKey="value" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60%)" fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Benchmark" dataKey="benchmark" stroke="hsl(213 94% 68%)" fill="none" fillOpacity={0} strokeWidth={2} strokeDasharray="6 4" />
          </RadarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-center gap-5 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block w-5 h-0.5 bg-primary"></span> Your level
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-5 h-0.5 border-t-2 border-dashed border-secondary"></span> Role benchmark
          </span>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 italic">{summaryText}</p>
        <p className="text-center text-[11px] text-muted-foreground/60 mt-1">
          Role fit: <span className="font-medium">{reportData.role_fit.replace(/_/g, ' ')}</span>
        </p>
      </div>
    </ScrollReveal>
  );
};

export default TCSOverview;
