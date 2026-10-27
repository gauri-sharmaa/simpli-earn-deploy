'use client'

import DashboardWidget from './DashboardWidget'

interface UpcomingEarningsWidgetProps {
  userId?: string | null
}

export default function UpcomingEarningsWidget({  }: UpcomingEarningsWidgetProps) {
  return (
    <DashboardWidget title="Upcoming Earnings" widgetId="upcoming-earnings">
      <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
        <p>Earnings calls relevant to your watchlist.</p>
        <p className="text-xs text-brand">Coming soon</p>
      </div>
    </DashboardWidget>
  )
}
