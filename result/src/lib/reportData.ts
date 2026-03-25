export interface TechnicalSkill {
  dependency: number;
  capability: number;
  status: 'gap' | 'strong' | 'active_learning' | 'insufficient_data';
}

export interface ReportData {
  technical: {
    programming_fundamentals: TechnicalSkill;
    system_design: TechnicalSkill;
    debugging: TechnicalSkill;
    ai_application: TechnicalSkill;
  };
  cognitive: {
    understanding: number;
    application: number;
    analysis: number;
    evaluation: number;
    creation: number;
  };
  social: {
    communication: number;
    teamwork: number;
    empathy: number;
    influence: number;
    conflict_management: number;
    service_orientation: number;
  };
  strengths: string[];
  gaps: string[];
  role_fit: 'strong_fit' | 'partial_fit' | 'weak_fit';
  insights: string[];
  recommendations: string[];
}

declare global {
  interface Window {
    IMPRO_DATA?: ReportData;
  }
}

export const MOCK_DATA: ReportData = {
  technical: {
    programming_fundamentals: { dependency: 30, capability: 75, status: 'strong' },
    system_design: { dependency: 65, capability: 40, status: 'gap' },
    debugging: { dependency: 20, capability: 80, status: 'strong' },
    ai_application: { dependency: 50, capability: 45, status: 'active_learning' },
  },
  cognitive: {
    understanding: 2,
    application: 2,
    analysis: 1,
    evaluation: 1,
    creation: 1,
  },
  social: {
    communication: 2,
    teamwork: 2,
    empathy: 1,
    influence: 1,
    conflict_management: 1,
    service_orientation: 1,
  },
  strengths: [
    'JavaScript & React ecosystem',
    'RESTful API design',
    'Code review & collaboration',
  ],
  gaps: [
    'Distributed Systems',
    'Cloud Infrastructure (AWS/GCP)',
    'System Design & Architecture',
  ],
  role_fit: 'partial_fit',
  insights: [
    'Appearing in 67% more senior developer JDs than 12 months ago.',
    'Now listed as a core requirement, no longer just a nice-to-have.',
    'Expected at mid-level. Currently your weakest cognitive signal.',
  ],
  recommendations: [
    'Take "Designing Data-Intensive Applications" course',
    'Get AWS Cloud Practitioner certified',
    'Practice 2× system design scenarios per week with IMPRO',
  ],
};

export const reportData: ReportData = window.IMPRO_DATA || MOCK_DATA;
