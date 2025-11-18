"use client"

import { useState } from "react"
import { KakaoMap } from "@/src/components/kakao-map"
import { LocationWizard } from "@/src/components/location-wizard"

import { useRouter } from "next/navigation";

export default function MapPage() {
  const [showWizard, setShowWizard] = useState(true);
  const [selectedDong, setSelectedDong] = useState<string | null>(null);
  const router = useRouter();

  const handleWizardComplete = (dongList: string[]) => {
    if (dongList.length > 0) {
      setSelectedDong(dongList[0]); // 첫 번째 동으로 지도 포커싱
    }
    setShowWizard(false);
  };

  {selectedDong && (
    <p className="text-sm text-muted-foreground mb-2">
      선택된 지역: <span className="text-primary font-medium">{selectedDong}</span>
    </p>
  )}

  return (
    <main className="container mx-auto p-4">
       <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">상권 분석 지도</h1>
          <p className="text-muted-foreground">지도에서 위치를 선택하고 AI 추천을 받아보세요.</p>
        </div>
      </div>
      <KakaoMap selectedDong={selectedDong} />
      {showWizard && (
        <LocationWizard
          onComplete={(dong) => handleWizardComplete(dong)}
          onClose={() => setShowWizard(false)}
        />
      )}
    </main>
  );
}




      
     
