import clsx from "clsx";
import type React from "react";

type CategoryIconProps = {
  value?: string;
  fallback?: React.ReactNode;
  className?: string;
  iconClassName?: string;
};

const IMAGE_EXTENSION_RE = /\.(svg|png|jpe?g|webp|gif)(\?.*)?$/i;
const IMAGE_FORMAT_RE = /[?&](format|fm)=(svg|png|jpe?g|webp|gif)\b/i;

function cleanIconValue(value?: string) {
  return (value || "").trim();
}

function isImageUrl(value: string) {
  if (!/^(https?:\/\/|\/)(?!\/)/i.test(value)) return false;

  if (IMAGE_EXTENSION_RE.test(value) || IMAGE_FORMAT_RE.test(value)) return true;

  try {
    const url = new URL(value, "https://example.com");
    return ["svg", "png", "jpg", "jpeg", "webp", "gif"].includes(
      (url.searchParams.get("format") || url.searchParams.get("fm") || "").toLowerCase()
    );
  } catch {
    return false;
  }
}

function extractFlaticonClass(value: string) {
  const classMatch = value.match(/class(?:Name)?=["']([^"']*\bfi\b[^"']*)["']/i);
  if (classMatch?.[1]) return classMatch[1].trim();

  if (/^(fi|flaticon)[\w\s-]*$/i.test(value) && /\b(fi|flaticon)-/.test(value)) {
    return value;
  }

  return "";
}

function sanitizeSvg(value: string) {
  if (!/^<svg[\s>]/i.test(value)) return "";

  return value
    .replace(/<\s*(script|style|foreignObject|iframe|object|embed|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|foreignObject|iframe|object|embed|link|meta)[^>]*\/?>/gi, "")
    .replace(/\s(on\w+|href|xlink:href|style)=["'][^"']*["']/gi, "")
    .replace(/\s(on\w+|href|xlink:href|style)=\{[^}]*\}/gi, "");
}

export function CategoryIcon({
  value,
  fallback = null,
  className,
  iconClassName,
}: CategoryIconProps) {
  const icon = cleanIconValue(value);

  if (!icon) return fallback;

  if (isImageUrl(icon)) {
    return (
      <img
        src={icon}
        alt=""
        className={clsx("h-full w-full object-contain", iconClassName)}
        loading="lazy"
      />
    );
  }

  const flaticonClass = extractFlaticonClass(icon);
  if (flaticonClass) {
    return <i aria-hidden="true" className={clsx(flaticonClass, iconClassName)} />;
  }

  const svg = sanitizeSvg(icon);
  if (svg) {
    return (
      <span
        aria-hidden="true"
        className={clsx(
          "inline-flex h-full w-full items-center justify-center [&_svg]:h-full [&_svg]:w-full",
          className
        )}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return <span className={iconClassName}>{icon}</span>;
}

export function getPastedIconValue(event: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const html = event.clipboardData.getData("text/html").trim();
  const text = event.clipboardData.getData("text/plain").trim();

  if (html) {
    const svgMatch = html.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch?.[0]) return svgMatch[0];

    const iconMatch = html.match(/<i\b[^>]*class(?:Name)?=["'][^"']*\bfi\b[^"']*["'][^>]*>\s*<\/i>/i);
    if (iconMatch?.[0]) return iconMatch[0];
  }

  return text;
}
