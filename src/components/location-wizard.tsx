"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { Input } from "@/src/components/ui/input" 
import {
  Coffee,
  Utensils,
  Scissors,
  ShoppingBag,
  Store,
  Dumbbell,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Search,
  X,
  MapPin,
  RotateCcw,
} from "lucide-react"
import { Badge } from "@/src/components/ui/badge"

interface WizardStep {
  title: string
  description: string
  question: string
}

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

const businessTypes = [
  { id: "cafe", name: "카페", icon: Coffee },
  { id: "restaurant", name: "음식점", icon: Utensils },
  { id: "beauty", name: "미용실", icon: Scissors },
  { id: "retail", name: "편의점", icon: ShoppingBag },
  { id: "store", name: "소매점", icon: Store },
  { id: "fitness", name: "헬스장", icon: Dumbbell },
]

const budgetOptions = [
  { id: "low", label: "3,000만원", value: 3000 },
  { id: "mid", label: "5,000만원", value: 5000 },
  { id: "high", label: "10,000만원", value: 10000 },
]

const analysisTypes = [
  { id: "detailed", label: "아니요, 빠르게 분석할게요", subtitle: "기본 정보만으로 빠른 분석" },
  { id: "fast", label: "네, 자세히 분석해주세요", subtitle: "상세한 분석 보기" },
]

interface LocationWizardProps {
  onComplete: (recommendations: LocationRecommendation[]) => void
  onClose: () => void
}

const locationData = {
  서울: {
    강남구: ["역삼동", "삼성동", "논현동", "청담동", "대치동", "개포동", "신사동"],
    서초구: ["서초동", "잠원동", "반포동", "방배동", "양재동", "내곡동"],
    송파구: ["잠실동", "문정동", "가락동", "석촌동", "방이동", "오금동"],
    강동구: ["천호동", "길동", "상일동", "고덕동", "암사동"],
    마포구: [
      "공덕동",
      "아현동",
      "도화동",
      "용강동",
      "대흥동",
      "염리동",
      "신수동",
      "서강동",
      "서교동",
      "합정동",
      "망원동",
      "연남동",
      "성산동",
      "상암동",
    ],
  },
  경기: {
    강화군: ["갈현동", "계산동", "금현동"],
    계양구: ["계산동", "작전동", "효성동"],
    미추홀구: ["용현동", "학익동", "도화동"],
    남동구: ["구월동", "간석동", "만수동"],
  },
  인천: {
    계양구: ["계산동", "작전동", "효성동", "병방동", "박촌동"],
    미추홀구: ["용현동", "학익동", "도화동", "주안동", "관교동"],
    남동구: ["구월동", "간석동", "만수동", "장수동", "서창동"],
    연수구: ["옥련동", "선학동", "청학동", "동춘동", "송도동"],
  },
  부산: {
    해운대구: ["우동", "중동", "좌동", "송정동", "재송동"],
    수영구: ["광안동", "남천동", "민락동", "망미동"],
    사하구: ["하단동", "당리동", "괴정동", "감천동"],
  },
  대구: {
    수성구: ["범어동", "만촌동", "수성동", "황금동", "중동"],
    달서구: ["성당동", "두류동", "본동", "이곡동"],
  },
  광주: {
    동구: ["충장동", "금남동", "계림동", "산수동"],
    서구: ["치평동", "농성동", "유덕동", "화정동"],
  },
  대전: {
    서구: ["둔산동", "월평동", "만년동", "갈마동"],
    유성구: ["봉명동", "구암동", "관평동", "도룡동"],
  },
  울산: {
    남구: ["삼산동", "신정동", "달동", "무거동"],
    동구: ["방어동", "일산동", "전하동", "화정동"],
  },
}

export function LocationWizard({ onComplete, onClose }: LocationWizardProps) {
  const [step, setStep] = useState(1)
  const [selections, setSelections] = useState({
    businessType: "",
    city: "",
    district: "",
    budget: 0,
    analysisType: "",
  })

  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleNeighborhood = (neighborhood: string) => {
    if (selectedNeighborhoods.includes(neighborhood)) {
      setSelectedNeighborhoods(selectedNeighborhoods.filter((n) => n !== neighborhood))
    } else if (selectedNeighborhoods.length < 10) {
      setSelectedNeighborhoods([...selectedNeighborhoods, neighborhood])
    }
  }

  const removeNeighborhood = (neighborhood: string) => {
    setSelectedNeighborhoods(selectedNeighborhoods.filter((n) => n !== neighborhood))
  }

  const resetLocationSelection = () => {
    setSelectedCity("")
    setSelectedDistrict("")
    setSelectedNeighborhoods([])
  }

  const applyLocationSelection = () => {
    if (selectedNeighborhoods.length > 0) {
      setSelections({
        ...selections,
        city: selectedCity,
        district: selectedDistrict,
      })
      setStep(4)
    }
  }

  const generateRecommendations = (): LocationRecommendation[] => {
    const recommendations = [
      {
        id: 1,
        name: "역삼동 테헤란로 입구",
        address: "서울특별시 강남구 테헤란로 152",
        totalScore: 92,
        scores: {
          traffic: 95,
          rent: 82,
          competitors: 88,
          location: 96,
        },
        description:
          "높은 유동인구와 좋은 접근성을 자랑하는 프리미엄 상권입니다. 주변에 오피스 빌딩이 많아 점심 시간대 매출이 높습니다.",
        lat: 37.5665,
        lng: 127.0369,
      },
      {
        id: 2,
        name: "삼성동 코엑스 인근",
        address: "서울특별시 강남구 영동대로 513",
        totalScore: 85,
        scores: {
          traffic: 92,
          rent: 75,
          competitors: 85,
          location: 88,
        },
        description:
          "관광객과 직장인이 많은 지역으로 주말 매출이 높습니다. 대형 쇼핑몰 인근으로 유동인구가 풍부합니다.",
        lat: 37.5115,
        lng: 127.0595,
      },
      {
        id: 3,
        name: "논현동 학동사거리 인근",
        address: "서울특별시 강남구 학동로 426",
        totalScore: 83,
        scores: {
          traffic: 85,
          rent: 92,
          competitors: 78,
          location: 78,
        },
        description: "임대료 대비 유동인구가 좋은 가성비 입지입니다. 주거 밀집 지역으로 단골 고객 확보가 용이합니다.",
        lat: 37.5113,
        lng: 127.0371,
      },
    ]

    return recommendations
  }

  const handleNext = () => {
    if (step === 4) {
      const recommendations = generateRecommendations()
      onComplete(recommendations)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onClose()
    } else {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selections.businessType !== ""
      case 2:
        return selections.budget > 0
      case 3:
        return selectedNeighborhoods.length > 0
      case 4:
        return selections.analysisType !== ""
      default:
        return false
    }
  }

  const cities = Object.keys(locationData)
  const districts = selectedCity ? Object.keys(locationData[selectedCity as keyof typeof locationData]) : []
  const neighborhoods =
    selectedCity && selectedDistrict
      ? locationData[selectedCity as keyof typeof locationData][
          selectedDistrict as keyof (typeof locationData)[keyof typeof locationData]
        ] || []
      : []

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">창업 정보를 입력해주세요</CardTitle>
              <CardDescription className="mt-1">
                단계별로 정보를 입력하시면 최적의 창업 입지를 분석해드립니다.
              </CardDescription>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">진행률</span>
              <span className="font-medium">{step} / 4</span> 
            </div>
            <Progress value={(step / 4) * 100} className="h-2" /> 
          </div>

        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">어떤 업종으로 창업하시나요?</h3>
                <p className="text-sm text-muted-foreground">업종을 선택해주세요</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {businessTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = selections.businessType === type.id
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelections({ ...selections, businessType: type.id })}
                      className={`p-4 rounded-lg border-2 transition-all hover:border-primary/50 ${
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 mb-2 mx-auto ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <p className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>{type.name}</p>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary mt-1 mx-auto" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">창업 비용은 얼마인가요?</h3>
                <p className="text-sm text-muted-foreground">예상 창업 비용을 입력해주세요</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">창업 비용 (만원)</label>
                <input
                  type="number"
                  value={selections.budget || ""}
                  onChange={(e) => setSelections({ ...selections, budget: Number.parseInt(e.target.value) || 0 })}
                  placeholder="5000"
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {budgetOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={selections.budget === option.value ? "default" : "outline"}
                      onClick={() => setSelections({ ...selections, budget: option.value })}
                      className="w-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

  

      

{/* Step 3: Hierarchical Location Selection */}
{step === 3 && (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-semibold mb-1">지역설정</h3>
    </div>
            {/* Search Bar */}
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="지역명 검색 예) 강남구, 역삼동"
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div> */}

              {/* Location Selection Toggles */}
              {/* <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span>현재 위치 추가</span>
                </button>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="nearby" className="rounded" />
                  <label htmlFor="nearby">염동투기</label>
                  <button className="text-muted-foreground">
                    <span className="text-xs">?</span>
                  </button>
                </div>
              </div> */}

    {/* Three Column Layout */}
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 border-b bg-muted/30">
        <div className="p-3 text-center text-sm font-medium border-r">시/도</div>
        <div className="p-3 text-center text-sm font-medium border-r">시/구/군</div>
        <div className="p-3 text-center text-sm font-medium">동/읍/면</div>
      </div>

      <div className="grid grid-cols-3 max-h-[300px]">
        {/* Cities Column */}
        <div className="border-r overflow-y-auto">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city)
                setSelectedDistrict("")
                // 전체 초기화 X → 여러 도시 누적 가능하게 할 수도 있음
              }}
              className={`w-full p-3 text-left text-sm hover:bg-muted/50 transition-colors ${
                selectedCity === city ? "bg-primary/10 text-primary font-medium" : ""
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Districts Column */}
        <div className="border-r overflow-y-auto">
          {/* ✅ 구 전체 선택 시 → 시 기준 추가 */}
          <button
            onClick={() => {
              if (selectedCity) {
                if (!selectedNeighborhoods.includes(selectedCity)) {
                  setSelectedNeighborhoods((prev) => [...prev, selectedCity])
                }
                console.log(`${selectedCity} 전체 기준 검색`)
              }
            }}
            className="w-full p-3 text-left text-sm hover:bg-muted/50 transition-colors"
          >
            전체
          </button>

          {districts.map((district) => (
            <button
              key={district}
              onClick={() => {
                setSelectedDistrict(district)
                // ✅ 기존 선택 유지 (초기화 X)
              }}
              className={`w-full p-3 text-left text-sm hover:bg-muted/50 transition-colors ${
                selectedDistrict === district ? "bg-primary/10 text-primary font-medium" : ""
              }`}
            >
              {district}
            </button>
          ))}
        </div>

        {/* Neighborhoods Column */}
        <div className="overflow-y-auto">
          {selectedDistrict ? (
            <>
              {/* ✅ 동 전체 선택 → 구 기준 추가 */}
              <button
                onClick={() => {
                  if (!selectedNeighborhoods.includes(selectedDistrict)) {
                    setSelectedNeighborhoods((prev) => [...prev, selectedDistrict])
                  }
                  console.log(`${selectedCity} ${selectedDistrict} 전체 기준 검색`)
                }}
                className={`w-full p-3 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                  selectedNeighborhoods.includes(selectedDistrict)
                    ? "bg-primary/10 text-primary font-medium"
                    : ""
                }`}
              >
                <span>전체</span>
              </button>

              {neighborhoods.map((neighborhood) => {
                const isSelected = selectedNeighborhoods.includes(neighborhood)
                return (
                  <button
                    key={neighborhood}
                    onClick={() => toggleNeighborhood(neighborhood)}
                    className={`w-full p-3 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      isSelected ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <span>{neighborhood}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                )
              })}
            </>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              시/구를 선택해주세요
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ✅ 선택된 지역 표시 */}
    {selectedNeighborhoods.length > 0 && (
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-primary font-medium">최대 10개</span>까지 선택할 수 있어요.
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedNeighborhoods.map((neighborhood) => (
            <Badge key={neighborhood} variant="secondary" className="pr-1">
              {neighborhood}
              <button
                onClick={() => removeNeighborhood(neighborhood)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    )}

    {/* ✅ Action Buttons — 이전 + 적용하기 (통일된 디자인) */}
    <div className="flex gap-3 pt-4 border-t">
      <Button
        variant="outline"
        onClick={handleBack} // ✅ 이전 단계로 이동
        className="flex-1 bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        이전
      </Button>
      <Button
        onClick={applyLocationSelection}
        disabled={selectedNeighborhoods.length === 0}
        className="flex-1"
      >
        {selectedNeighborhoods.length}개 지역 적용하기
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
)}

          {/* Step 5: Analysis Type */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">더 자세한 분석을 원하시나요?</h3>
                <p className="text-sm text-muted-foreground">추가 정보를 선택해주세요</p>
              </div>
              <div className="space-y-3">
                {analysisTypes.map((type) => {
                  const isSelected = selections.analysisType === type.id
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelections({ ...selections, analysisType: type.id })}
                      className={`w-full p-5 rounded-lg border-2 text-left transition-all hover:border-primary/50 ${
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className={`font-medium mb-1 ${isSelected ? "text-primary" : ""}`}>{type.label}</p>
                          <p className="text-sm text-muted-foreground">{type.subtitle}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation - Only show for steps 1, 2, and 5 */}
          {step !== 3 && (
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                이전
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                {step === 4 ? "분석 시작하기" : "다음"}
                {step !== 4 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
