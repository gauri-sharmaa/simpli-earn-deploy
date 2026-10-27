'use client'

import WatchlistWidget from './WatchlistWidget'
import UpcomingEarningsWidget from './UpcomingEarningsWidget'
import IndustryNewsWidget from './IndustryNewsWidget'

/**
 * Widget config - easy to reorder, add, or remove widgets in future.
 * When drag-and-drop is added, this drives the layout.
 */
const WIDGET_CONFIG = [
  { id: 'watchlist', Component: WatchlistWidget },
  { id: 'upcoming-earnings', Component: UpcomingEarningsWidget },
  { id: 'industry-news', Component: IndustryNewsWidget },
] as const

/** The signed-in user's widgets, shown on the home page under the call library. */
export default function MyDashboardSection({ userId }: { userId: string }) {
  return (
    <section id="my-dashboard" className="w-full scroll-mt-28">
      <h3 className="mb-6 text-center text-4xl font-light tracking-tight">My Dashboard</h3>
      <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
        {WIDGET_CONFIG.map(({ id, Component }) => (
          <Component key={id} userId={userId} />
        ))}
      </div>
    </section>
  )
}
