'use client'

import DashboardWidget from './DashboardWidget'

interface IndustryNewsWidgetProps {
  userId?: string | null
}

export default function IndustryNewsWidget({  }: IndustryNewsWidgetProps) {
  return (
    <DashboardWidget title="Industry News" widgetId="industry-news">
      <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
        <p>News from sectors you care about.</p>
        <p className="text-xs text-brand">Coming soon</p>
      </div>
    </DashboardWidget>
  )
}
