import { cn } from "@/lib/utils";
import { getSectorTextColor, normalizeSectorColor } from "@/lib/sector-color";

type SectorBadgeProps = {
  title?: string | null;
  color?: string | null;
  fallback?: string;
  className?: string;
};

export const SectorBadge = ({
  title,
  color,
  fallback = "-",
  className,
}: SectorBadgeProps) => {
  if (!title) {
    return <span className={cn("text-sm text-gray-500", className)}>{fallback}</span>;
  }

  const safeColor = normalizeSectorColor(color);
  const textColor = getSectorTextColor(safeColor);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        className,
      )}
      style={{ backgroundColor: safeColor, color: textColor }}
    >
      {title}
    </span>
  );
};

