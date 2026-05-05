import Image from "next/image";
import Link from "next/link";
import styles from "./ServiceCard.module.css";

interface ServiceCardProps {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  className?: string;
  imageClassName?: string;
}

export function ServiceCard({
  title,
  description,
  imageSrc,
  imageAlt,
  href,
  className = "",
  imageClassName = "",
}: ServiceCardProps) {
  const content = (
    <>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={2430}
        height={3038}
        sizes="(max-width: 767px) 100vw, 33vw"
        className={[styles.image, imageClassName].filter(Boolean).join(" ")}
      />
      <h3 className="sr-only">{title}</h3>
      {description ? (
        <div className={styles.overlay} aria-hidden="true">
          <p>{description}</p>
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={[styles.root, className].filter(Boolean).join(" ")}>
        {content}
      </Link>
    );
  }

  return (
    <article className={[styles.root, className].filter(Boolean).join(" ")}>
      {content}
    </article>
  );
}
