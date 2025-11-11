"use client"

import { useState } from "react"
import { KakaoMap } from "@/src/components/kakao-map"
import { LocationWizard } from "@/src/components/location-wizard"

interface LocationRecommendation {
  id: number
  name: string
  address: string
  totalScore: number
  scores: {
    traffic: number
    rent: number
    competitors: number
    location: number
  }
  description: string
  lat: number
  lng: number
}

export default function MapPage() {
  const [showWizard, setShowWizard] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<LocationRecommendation | null>(null)

  const handleWizardComplete = (recs: LocationRecommendation[]) => {
    if (recs.length > 0) {
      setSelectedLocation(recs[0]) // Select first recommendation
    }
    setShowWizard(false)
  }

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">상권 분석 지도</h1>
          <p className="text-muted-foreground">지도에서 위치를 선택하거나 AI 추천을 받아보세요</p>
        </div>
        {/* Removed button as wizard now shows by default */}
      </div>

      <KakaoMap selectedLocation={selectedLocation} />

      {showWizard && <LocationWizard onComplete={handleWizardComplete} onClose={() => setShowWizard(false)} />}
    </main>
  )
}
