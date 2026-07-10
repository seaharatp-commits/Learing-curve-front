// Single source of truth for the Career Alignment card's position-specific quote
// and subtitle. Keyed by the real Position.name string the backend already
// returns (careerAlignment.position) — no scattered position-name comparisons
// elsewhere. Positions without an entry here fall back to a generic template
// that still includes the learner's real position name.
export interface CareerAlignmentContent {
  quote: string;
  subtitle: string;
}

const CAREER_ALIGNMENT_CONTENT_BY_POSITION: Record<string, CareerAlignmentContent> = {
  "Software Engineer": {
    quote: "ทุกระบบที่แข็งแรง เริ่มต้นจากการเข้าใจปัญหาอย่างเป็นขั้นตอน",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย Software Engineer",
  },
  "UX/UI Designer": {
    quote: "การออกแบบที่ดี เริ่มจากการเข้าใจผู้ใช้ ไม่ใช่แค่ความสวยงาม",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย UX/UI Designer",
  },
  "IT Support": {
    quote: "ทุกปัญหาที่แก้ได้ คือประสบการณ์ที่ทำให้คุณเชี่ยวชาญขึ้น",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย IT Support",
  },
  "Project Manager": {
    quote: "ความสำเร็จของโครงการ เริ่มจากการมองเห็นภาพรวมและจัดการรายละเอียด",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย Project Manager",
  },
  "Financial Accounting": {
    quote: "ข้อมูลที่ถูกต้อง คือพื้นฐานของการตัดสินใจทางการเงินที่ดี",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย Financial Accounting",
  },
  "Sales Manager": {
    quote: "การเติบโตของยอดขาย เริ่มจากการเข้าใจลูกค้าและสร้างทีมที่แข็งแรง",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย Sales Manager",
  },
  Investor: {
    quote: "การตัดสินใจที่ดี เริ่มจากข้อมูลที่รอบด้านและการบริหารความเสี่ยง",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย Investor",
  },
  "Managing Director": {
    quote: "การนำองค์กรที่ดี เริ่มจากวิสัยทัศน์ที่ชัดเจนและการตัดสินใจที่รอบคอบ",
    subtitle: "คุณกำลังสร้างเส้นทางการเติบโตในสาย Managing Director",
  },
};

const DEFAULT_CAREER_ALIGNMENT_CONTENT = {
  quote: "ทุกก้าวของการเรียนรู้ กำลังพาคุณเข้าใกล้เป้าหมายมากขึ้น",
  subtitle: (positionName: string) => `คุณกำลังสร้างเส้นทางการเติบโตในสาย ${positionName}`,
};

export function getCareerAlignmentContent(positionName: string): CareerAlignmentContent {
  return (
    CAREER_ALIGNMENT_CONTENT_BY_POSITION[positionName] ?? {
      quote: DEFAULT_CAREER_ALIGNMENT_CONTENT.quote,
      subtitle: DEFAULT_CAREER_ALIGNMENT_CONTENT.subtitle(positionName),
    }
  );
}
