import Image from "next/image";

interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: { container: "w-7 h-7", text: "text-xs", px: 28 },
  sm: { container: "w-8 h-8", text: "text-xs", px: 32 },
  md: { container: "w-10 h-10", text: "text-sm", px: 40 },
  lg: { container: "w-12 h-12", text: "text-lg", px: 48 },
  xl: { container: "w-16 h-16", text: "text-2xl", px: 64 },
};

export function Avatar({ name, avatarUrl, size = "md", className = "" }: Props) {
  const { container, text, px } = sizes[size];
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <div className={`${container} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <Image
          src={avatarUrl}
          alt={name}
          width={px}
          height={px}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} ${text} rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold font-display flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
