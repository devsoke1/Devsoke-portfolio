import type { SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  variant?: "horizontal" | "icon";
  decorative?: boolean;
  title?: string;
};

export default function BrandMark({
  variant = "horizontal",
  decorative = false,
  title = "Devsoke",
  className,
  ...props
}: BrandMarkProps) {
  const ariaProps = decorative
    ? { "aria-hidden": true }
    : { role: "img", "aria-label": title };

  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...ariaProps}
        {...props}
      >
        <path
          d="M34 22L71 48L34 74"
          stroke="#F4F4F6"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M20 56H45L34 71H9L20 56Z" fill="#D36A8F" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 420 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...ariaProps}
      {...props}
    >
      <path
        d="M34 17L105 48L34 79"
        stroke="#9D3C5C"
        strokeWidth="19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 58H68L51 78H5L22 58Z" fill="#D36A8F" />
      <text
        x="132"
        y="67"
        fill="#F4F4F6"
        fontFamily="var(--font-heading), Manrope, Inter, Arial, sans-serif"
        fontSize="50"
        fontWeight="800"
        letterSpacing="0"
      >
        Devsoke
      </text>
    </svg>
  );
}
