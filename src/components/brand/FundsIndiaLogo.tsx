import Image from "next/image";

const DARK_SIZE = {
  header: {
    mark: "h-8 w-8",
    word: "text-[26px]",
    gap: "gap-2",
  },
  drawer: {
    mark: "h-9 w-9",
    word: "text-[30px]",
    gap: "gap-2.5",
  },
  hero: {
    mark: "h-8 w-8",
    word: "text-[26px]",
    gap: "gap-2",
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
  variant?: "header" | "drawer" | "hero";
}) {
  const darkSize = DARK_SIZE[variant];

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
      <span className={`fi-logo-dark hidden items-center ${darkSize.gap}`} aria-label="FundsIndia">
        <Image
          src="/fundsindia-symbol-transparent.png"
          alt=""
          width={height}
          height={height}
          priority={variant === "header"}
          className={`${darkSize.mark} object-contain`}
        />
        <span
          className={`font-medium leading-none tracking-normal text-white ${darkSize.word}`}
          style={{ fontFamily: "Avenir Next, Avenir, Helvetica Neue, Arial, sans-serif" }}
        >
          FundsIndia
        </span>
      </span>
    </span>
  );
}
