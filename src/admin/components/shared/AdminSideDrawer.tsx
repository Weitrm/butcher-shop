import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  side?: "start" | "end";
}

export const AdminSideDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  widthClassName,
  side = "end",
}: AdminSideDrawerProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!portalTarget || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative flex h-full w-full max-w-2xl flex-col border-slate-200 bg-white shadow-2xl",
          side === "start" ? "mr-auto border-r" : "ml-auto border-l",
          widthClassName,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <footer className="border-t border-slate-200 px-6 py-4">{footer}</footer>
        ) : null}
      </section>
    </div>,
    portalTarget,
  );
};
