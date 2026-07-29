import Image from "next/image";

export function FundsIndiaLogo({
  width,
  height,
  className = "",
  variant = "header",
}: {
  width: number;
  height: number;
  className?: string;
  variant?: "header" | "drawer" | "hero";
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/fundsindia-logo.png"
        alt="FundsIndia"
        width={width}
        height={height}
        priority={variant === "header"}
        className="fi-logo-light h-full w-auto object-contain mix-blend-multiply"
      />
      <Image
        src="/fundsindia-logo-transparent.png"
        alt="FundsIndia"
        width={width}
        height={height}
        priority={variant === "header"}
        className="fi-logo-dark hidden h-full w-auto object-contain"
      />
    </span>
  );
}
