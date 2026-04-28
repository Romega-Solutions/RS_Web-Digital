import { AppButton } from "@/components/atoms/Button";
import type { TalentProfile } from "./talentData";

type TalentCardProps = {
  talent: TalentProfile;
};

function getSeniorityLabel(level: TalentProfile["experienceLevel"]) {
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
  return (
    <article className="talent-card">
      <div className="talent-card__header">
        <div className="talent-card__info">
          <div className="talent-card__name-row">
            <span className="talent-card__name">{talent.name}</span>
            <span className="talent-card__location">{talent.location.toUpperCase()}</span>
          </div>
          <p className="talent-card__role">{talent.role}</p>
          <p className="talent-card__level">{getSeniorityLabel(talent.experienceLevel)}</p>
        </div>
        <span className="talent-card__id">ID: {talent.id}</span>
      </div>

      <p className="talent-card__tagline">{talent.tagline}</p>

      <div className="talent-card__skills">
        {talent.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="talent-card__skill">
            {skill}
          </span>
        ))}
        {talent.skills.length > 3 ? (
          <span className="talent-card__skill talent-card__skill--more">
            +{talent.skills.length - 3} more
          </span>
        ) : null}
      </div>

      <div className="talent-card__footer">
        <span className="talent-card__category">{talent.category}</span>
        <AppButton href="/contact" className="talent-card__cta">
          REQUEST INTRO
        </AppButton>
      </div>
    </article>
  );
}
