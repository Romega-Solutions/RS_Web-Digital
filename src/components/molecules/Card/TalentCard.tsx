import { AppButton } from "@/components/atoms/Button";
import styles from "./TalentCard.module.css";

type TalentCardData = {
  id: string;
  name: string;
  role: string;
  location: string;
  category: string;
  experienceLevel: "Junior" | "Mid-Level" | "Senior" | "Lead" | "Principal";
  tagline: string;
  skills: string[];
};

type TalentCardProps = {
  talent: TalentCardData;
};

function getSeniorityLabel(level: TalentCardData["experienceLevel"]) {
  switch (level) {
    case "Junior":
      return "JUNIOR";
    case "Mid-Level":
      return "MIDDLE";
    case "Senior":
      return "SENIOR";
    case "Lead":
      return "LEAD";
    case "Principal":
      return "PRINCIPAL";
    default:
      return "MIDDLE";
  }
}

export function TalentCard({ talent }: TalentCardProps) {
  const contactHref = `/contact?role=${encodeURIComponent(talent.role)}&talentId=${encodeURIComponent(
    talent.id,
  )}`;

  return (
    <article className={styles.root}>
      <div className={styles.header}>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{talent.name}</span>
            <span className={styles.location}>{talent.location.toUpperCase()}</span>
          </div>
          <p className={styles.role}>{talent.role}</p>
          <p className={styles.level}>{getSeniorityLabel(talent.experienceLevel)}</p>
        </div>
        <span className={styles.id}>ID: {talent.id}</span>
      </div>

      <p className={styles.tagline}>{talent.tagline}</p>

      <div className={styles.skills}>
        {talent.skills.slice(0, 3).map((skill) => (
          <span key={skill} className={styles.skill}>
            {skill}
          </span>
        ))}
        {talent.skills.length > 3 ? (
          <span className={`${styles.skill} ${styles.skillMore}`}>+{talent.skills.length - 3} more</span>
        ) : null}
      </div>

      <div className={styles.footer}>
        <span className={styles.category}>{talent.category}</span>
        <AppButton href={contactHref} className={styles.cta}>
          REQUEST INTRO
        </AppButton>
      </div>
    </article>
  );
}
