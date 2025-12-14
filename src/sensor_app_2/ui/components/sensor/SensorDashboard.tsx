import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  useSensorSummarySuspense,
  useSensorSeries,
  type SensorSeriesParams,
} from "@/lib/api";
import { selector } from "@/lib/selector";
import { MetricCard, MetricCardSkeleton } from "./MetricCard";
import { SensorChart, SensorChartSkeleton } from "./SensorChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

// Polling interval in milliseconds
const POLLING_INTERVAL = 500;

// Error fallback component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Error Loading Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// Summary metrics component with Suspense
function SummaryMetrics() {
  const { data: summary } = useSensorSummarySuspense(selector());

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Last 10 Minutes"
        temperature={summary.last_10_minutes.avg_temperature}
        humidity={summary.last_10_minutes.avg_humidity}
      />
      <MetricCard
        title="Last Hour"
        temperature={summary.last_hour.avg_temperature}
        humidity={summary.last_hour.avg_humidity}
      />
      <MetricCard
        title="Daily Average"
        temperature={summary.last_day.avg_temperature}
        humidity={summary.last_day.avg_humidity}
      />
    </div>
  );
}

// Summary metrics skeleton
function SummaryMetricsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  );
}

// Temperature chart with polling
function TemperatureChart() {
  const params: SensorSeriesParams = { metric: "temperature", minutes: 10 };
  const { data } = useSensorSeries(params, {
    query: {
      refetchInterval: POLLING_INTERVAL,
      refetchIntervalInBackground: false,
      select: (data) => data.data,
    },
  });

  return (
    <SensorChart
      title="Temperature"
      description="Real-time temperature readings (last 10 minutes)"
      points={data?.points ?? []}
      color="#f97316"
      unit="°C"
    />
  );
}

// Humidity chart with polling
function HumidityChart() {
  const params: SensorSeriesParams = { metric: "humidity", minutes: 10 };
  const { data } = useSensorSeries(params, {
    query: {
      refetchInterval: POLLING_INTERVAL,
      refetchIntervalInBackground: false,
      select: (data) => data.data,
    },
  });

  return (
    <SensorChart
      title="Humidity"
      description="Real-time humidity readings (last 10 minutes)"
      points={data?.points ?? []}
      color="#3b82f6"
      unit="%"
    />
  );
}

// Charts skeleton
function ChartsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SensorChartSkeleton />
      <SensorChartSkeleton />
    </div>
  );
}

// Charts container - stacked vertically at full width
function ChartsSection() {
  return (
    <div className="flex flex-col gap-4">
      <TemperatureChart />
      <HumidityChart />
    </div>
  );
}

export function SensorDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground/80">
          Sensor Summary
        </h2>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<SummaryMetricsSkeleton />}>
            <SummaryMetrics />
          </Suspense>
        </ErrorBoundary>
      </section>

      {/* Real-time Charts */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-foreground/80">
          Real-time Sensor Data
        </h2>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<ChartsSkeleton />}>
            <ChartsSection />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  );
}

export default SensorDashboard;



