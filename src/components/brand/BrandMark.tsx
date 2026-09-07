import Image, { type ImageProps } from "next/image";

type BrandMarkProps = Omit<ImageProps, "alt" | "src" | "width" | "height"> & {
  variant?: "horizontal" | "icon";
  asset?: "header" | "footer";
  decorative?: boolean;
  title?: string;
};

export default function BrandMark({
  variant = "horizontal",
  asset = "header",
  decorative = false,
  title = "Devsoke",
  ...props
}: BrandMarkProps) {
  return (
    <Image
      {...props}
      src={
        variant === "icon"
          ? "/brand/devsoke-arrow-mark-transparent.png"
          : asset === "footer"
            ? "/brand/devsoke-footer-logo-transparent.png"
            : "/brand/devsoke-header-logo-transparent.png"
      }
      width={variant === "icon" ? 204 : asset === "footer" ? 880 : 620}
      height={variant === "icon" ? 223 : asset === "footer" ? 223 : 157}
      alt={decorative ? "" : title}
      aria-hidden={decorative ? true : undefined}
      unoptimized
    />
  );
}
