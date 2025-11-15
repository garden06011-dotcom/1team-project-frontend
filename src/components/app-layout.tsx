"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Chatbot } from "./chatbot"
import { RankingsSidebar } from "./rankings-sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/user/login" || pathname === "/user/signup"
  const isMapPage = pathname === "/map"

  return (
    <>
      <Header />
      <div className="flex">
        <main className={`flex-1 ${!isMapPage && !isAuthPage ? "lg:mr-80" : ""}`}>{children}</main>
        {!isAuthPage && !isMapPage && <RankingsSidebar />}
      </div>
      {!isAuthPage && <Chatbot />}
    </>
  )
}
