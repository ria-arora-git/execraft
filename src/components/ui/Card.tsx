'use client'

import React from 'react'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-blueBase rounded-2xl p-6 shadow ${className}`}>
      {children}
    </div>
  )
}
