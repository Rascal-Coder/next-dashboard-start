import { SectionCards } from "./components/section-cards"
import { ChartAreaInteractive } from "./components/chart-area-interactive"
export default function DashboardPage() {
  return <>
        {/* Page Title and Description */}
        <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <SectionCards />
        <ChartAreaInteractive />
      </div>
  </>
}