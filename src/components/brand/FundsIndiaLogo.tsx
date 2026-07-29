import Image from "next/image";

const SIZE = {
  header: {
    mark: "h-7 w-7",
    word: "text-2xl",
  },
  drawer: {
    mark: "h-8 w-8",
    word: "text-3xl",
  },
  hero: {
    mark: "h-7 w-7",
    word: "text-2xl",
  },
};

export function FundsIndiaLogo({
  width,
  height,
  className = "",
  variant = "header",
}: {
  width: number;
  height: number;
  className?: string;
  variant?: keyof typeof SIZE;
}) {
  const size = SIZE[variant];

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
      <span className="fi-logo-dark hidden items-center gap-2" aria-label="FundsIndia">
        <span className={`fi-logo-mark ${size.mark}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className={`font-bold leading-none tracking-normal text-white ${size.word}`}>FundsIndia</span>
      </span>
    </span>
  );
}
