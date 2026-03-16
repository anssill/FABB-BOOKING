'use client'
import dynamic from 'next/dynamic'

const AppCore = dynamic(() => import('@/components/AppCore'), { ssr: false })

export default function Home() {
  return <AppCore />
}
