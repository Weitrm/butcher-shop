import * as React from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";

import { cn } from "@/lib/utils";

type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
  children: React.ReactElement;
};

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue>({ config: {} });

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, children, className, style, ...props }, ref) => {
    const chartStyle: React.CSSProperties = { ...style };

    Object.entries(config).forEach(([key, item]) => {
      if (item.color) {
        (chartStyle as Record<string, string>)[`--color-${key}`] = item.color;
      }
    });

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          className={cn("flex h-[260px] w-full justify-center text-xs", className)}
          style={chartStyle}
          {...props}
        >
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  },
);
ChartContainer.displayName = "ChartContainer";

type ChartTooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string | number;
    value?: number | string;
    color?: string;
    fill?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  hideLabel?: boolean;
  labelFormatter?: (label: string) => React.ReactNode;
};

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    { active, payload, label, hideLabel, labelFormatter, className, ...props },
    ref,
  ) => {
    const { config } = React.useContext(ChartContext);

    if (!active || !payload?.length) {
      return null;
    }

    const payloadLabel =
      payload?.[0]?.payload && typeof payload[0].payload === "object"
        ? (payload[0].payload as Record<string, unknown>).label
        : undefined;

    const labelText = labelFormatter
      ? labelFormatter(String(label ?? payloadLabel ?? ""))
      : payloadLabel ?? label;

    return (
      <div
        ref={ref}
        className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}
        {...props}
      >
        {!hideLabel && labelText ? (
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {String(labelText)}
          </div>
        ) : null}
        <div className="grid gap-1">
          {payload.map((item, index) => {
            const dataKey = String(item.dataKey ?? item.name ?? index);
            const itemConfig =
              (item.dataKey ? config[item.dataKey as string] : undefined) ||
              (item.name ? config[item.name as string] : undefined);
            const indicatorColor = item.color ?? item.fill ?? itemConfig?.color;
            const labelText = itemConfig?.label ?? item.name ?? item.dataKey;
            const value =
              typeof item.value === "number"
                ? item.value.toLocaleString("es-AR")
                : item.value;

            return (
              <div key={dataKey} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: indicatorColor }}
                  />
                  <span>{labelText}</span>
                </div>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartTooltip = Tooltip;
const ChartLegend = Legend;

export { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent };
export type { ChartConfig };
