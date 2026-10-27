'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** My Dashboard now lives on the home page, under the call library. */
export default function MyDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/#my-dashboard')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand" />
    </div>
  )
}
