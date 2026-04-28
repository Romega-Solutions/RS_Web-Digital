import Image from "next/image";

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
  imageClassName = "services-spotlight-image",
}: ServiceCardProps) {
  return (
    <article className={`services-spotlight-card ${className}`}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={2430}
        height={3038}
        sizes="(max-width: 767px) 100vw, 33vw"
        className={imageClassName}
      />
      {/* Note: Title is visually hidden in current design but included for accessibility if needed */}
      <h3 className="sr-only">{title}</h3>
    </article>
  );
}
