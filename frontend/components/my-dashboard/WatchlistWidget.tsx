'use client'

import DashboardWidget from './DashboardWidget'

interface WatchlistWidgetProps {
  userId?: string | null
}

export default function WatchlistWidget({  }: WatchlistWidgetProps) {
  return (
    <DashboardWidget title="Watchlist" widgetId="watchlist">
      <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
        <p>Your tracked tickers will appear here.</p>
        <p className="text-xs text-brand">Coming soon</p>
      </div>
    </DashboardWidget>
  )
}
