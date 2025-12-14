import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SensorSeriesPoint } from "@/lib/api";

interface SensorChartProps {
  title: string;
  description?: string;
  points: SensorSeriesPoint[];
  color: string;
  unit: string;
  className?: string;
}

export function SensorChart({
  title,
  description,
  points,
  color,
  unit,
  className,
}: SensorChartProps) {
  // Transform data for recharts and calculate dynamic Y-axis domain
  const { chartData, yDomain } = useMemo(() => {
    if (!points || points.length === 0) {
      return { chartData: [], yDomain: [0, 100] as [number, number] };
    }

    const data = points.map((point) => ({
      time: new Date(point.timestamp).getTime(),
      value: point.value,
      formattedTime: new Date(point.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }));

    // Calculate dynamic Y-axis domain with padding
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = range * 0.15;
    
    return {
      chartData: data,
      yDomain: [
        Math.floor(min - padding),
        Math.ceil(max + padding),
      ] as [number, number],
    };
  }, [points]);

  // Format X-axis ticks to show only time
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "bg-gradient-to-br from-card via-card to-accent/10",
        className
      )}
    >
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={yDomain}
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-5}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
                        <p className="text-xs text-muted-foreground mb-1">
                          {data.formattedTime}
                        </p>
                        <p className="text-lg font-bold" style={{ color }}>
                          {data.value.toFixed(1)}
                          {unit}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground">
            <p>Waiting for sensor data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SensorChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </CardHeader>
      <CardContent className="pt-4">
        <Skeleton className="h-[220px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}



