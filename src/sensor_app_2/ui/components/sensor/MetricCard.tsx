import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Thermometer, Droplets } from "lucide-react";

interface MetricCardProps {
  title: string;
  temperature: number;
  humidity: number;
  className?: string;
}

export function MetricCard({
  title,
  temperature,
  humidity,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "bg-gradient-to-br from-card via-card to-accent/20",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
            <Thermometer className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {temperature.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                °C
              </span>
            </p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
            <Droplets className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {humidity.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                %
              </span>
            </p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
        </div>
      </CardContent>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
    </Card>
  );
}

export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        {/* Humidity skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



