import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/apx/navbar";
import { SensorDashboard, SensorChat } from "@/components/sensor";

export const Route = createFileRoute("/")({
  component: () => <Index />,
});

function Index() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Sensor Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring and analysis of your sensor data
          </p>
        </div>

        {/* Dashboard - full width */}
        <SensorDashboard />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Sensor monitoring powered by Databricks</p>
            <a
              href="https://github.com/databricks-solutions/apx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <img
                src="https://raw.githubusercontent.com/databricks-solutions/apx/refs/heads/main/assets/logo.svg"
                className="h-5 w-5"
                alt="apx logo"
              />
              <span>Built with apx</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Floating Chat Popup */}
      <SensorChat />

      {/* Subtle background pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>
    </div>
  );
}
