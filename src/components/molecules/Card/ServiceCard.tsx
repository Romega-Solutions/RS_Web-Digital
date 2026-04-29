import Image from "next/image";
import styles from "./ServiceCard.module.css";

interface ServiceCardProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
  imageClassName?: string;
}

export function ServiceCard({
  title,
  imageSrc,
  imageAlt,
  className = "",
  imageClassName = "",
}: ServiceCardProps) {
  return (
    <article className={[styles.root, className].filter(Boolean).join(" ")}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={2430}
        height={3038}
        sizes="(max-width: 767px) 100vw, 33vw"
        className={[styles.image, imageClassName].filter(Boolean).join(" ")}
      />
      <h3 className="sr-only">{title}</h3>
    </article>
  );
}
