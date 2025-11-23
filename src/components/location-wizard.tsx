////////////////////////////////
// 선호하는 입지 조건 선택 
////////////////////////////////

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import API from "@/src/api/axiosApi";
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
  BeerIcon,
} from "lucide-react"

interface LocationWizardProps {
  onComplete: (data: {
    businessType: string;
    city: string;
    district: string;
    subdistrict: string;
    lat: number;
    lng: number;
  }) => void;
  onClose: () => void;
}


export function LocationWizard({ onComplete, onClose }: LocationWizardProps) {
  const [step, setStep] = useState(1);
  const [locationData, setLocationData] = useState<any>(null);
  const [loadingLocations, setLoadingLocations] = useState(true);
  

  const businessTypes = [
    { id: "카페", name: "카페", icon: Coffee },
    { id: "음식점", name: "음식점", icon: Utensils },
    { id: "호프/간이주점", name: "호프/간이주점", icon: BeerIcon },
    { id: "편의점", name: "편의점", icon: ShoppingBag },
    { id: "소매점", name: "소매점", icon: Store },
    { id: "헬스장", name: "헬스장", icon: Dumbbell },
  ];

  const budgetOptions = [
    { id: "low", label: "3,000만원", value: 3000 },
    { id: "mid", label: "5,000만원", value: 5000 },
    { id: "high", label: "10,000만원", value: 10000 },
  ];

  const analysisTypes = [
    { id: "detailed", label: "아니요, 빠르게 분석할게요", subtitle: "기본 정보만으로 빠른 분석" },
    { id: "fast", label: "네, 자세히 분석해주세요", subtitle: "상세한 분석 보기" },
  ];

   // 서울 제외 지역 ui 데이터
 const staticLocationData = {
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

  const [selections, setSelections] = useState({
    category: "",
    budget: 0,
    analysisType: "",
    city: "",
    district: "",
    subdistrict: "",
  });

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdistrict, setselectedSubdistrict] = useState("");

  const cities = locationData ? Object.keys(locationData) : [];
  const districts = selectedCity && locationData ? Object.keys(locationData[selectedCity]) : [];
  const subdistrict = selectedCity && selectedDistrict && locationData 
    ? locationData[selectedCity][selectedDistrict] || [] 
    : [];

  useEffect(() => {
    API.get("/api/map/location")
      .then((res) => setLocationData({ ...res.data, ...staticLocationData }))
      .catch(() => console.error("위치 데이터 불러오기 실패"))
      .finally(() => setLoadingLocations(false));
  }, []);

  const handleNext = async () => {
    if (step === 4) {
      await API.post("/api/map/save", {
        user_id: "tester1@gmail.com",
        category: selections.category,
        rent_range: selections.budget,
        region_city: selections.city,
        region_district: selections.district,
        region_subdistrict: selections.subdistrict,
      });

      console.log("@@!@@!! selections:", selections)
      const response = await API.post("/api/map/location-center", {
        city: selections.city,
        district: selections.district,
        subdistrict: selections.subdistrict,
        category: selections.category
      });

      console.log("@@!@@!! response:", response)
      onComplete({ 
        businessType: selections.category,
        city: selections.city,
        district: selections.district,
        subdistrict: selections.subdistrict,
        lat: response.data.lat, 
        lng: response.data.lng 
      });
    } else setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      onClose()
    } else {
      setStep(step - 1)
    }
  }

  const toggleSubdistrict = (subdistrict: string) => {
    setselectedSubdistrict(subdistrict) 
  }

  const applyLocationSelection = () => {
    if (selectedSubdistrict) {
      setSelections({
        ...selections,
        city: selectedCity,
        district: selectedDistrict,
        subdistrict: selectedSubdistrict,
      })
      setStep(4)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selections.category !== "" //업종
      case 2:
        return selections.budget > 0 //창업 비용
      case 3:
        return selectedSubdistrict !== "" //동/읍/면
      case 4:
        return selections.analysisType !== "" //더 자세한 분석
      default:
        return false
    }
  }

  if (loadingLocations) return <div>위치 정보 불러오는 중...</div>;
    

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
                    const isSelected = selections.category === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          console.log("type.id:", type.id)
                          setSelections(prev => ({ ...prev, category: type.id}))
                          console.log("selections.category:", selections.category)
                        }}
                          
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
  
            {/* Three Column Layout */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 border-b bg-muted/30">
                <div className="p-3 text-center text-sm font-medium border-r">시/도</div>
                <div className="p-3 text-center text-sm font-medium border-r">시/구/군</div>
                <div className="p-3 text-center text-sm font-medium">동/읍/면</div>
              </div>
  
              <div className="grid grid-cols-3">
                {/* Cities Column */}
                <div className="border-r max-h-[300px] overflow-y-auto">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setSelectedDistrict("")
                        setselectedSubdistrict("")
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
          <div className="border-r max-h-[300px] overflow-y-auto">
            {districts.map((district) => (
              <button
                key={district}
                onClick={() => {
                  setSelectedDistrict(district)
                  //  기존 선택 유지 (초기화 X)
                }}
                className={`w-full p-3 text-left text-sm hover:bg-muted/50 transition-colors ${
                  selectedDistrict === district ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                {district}
              </button>
            ))}
          </div>
  
          {/* subdistict Column */}
          <div className="max-h-[300px] overflow-y-auto">
            {selectedDistrict ? (
              <>
              {subdistrict.map((subdistrict: string) => {
                const isSelected = selectedSubdistrict === subdistrict
                return (
                  <button
                    key={subdistrict}
                    onClick={() => toggleSubdistrict(subdistrict)}
                    className={`w-full p-3 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      isSelected ? "bg-primary/10 text-primary font-medium" : ""
                    }`}
                  >
                    <span>{subdistrict}</span>
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
  
      {selectedSubdistrict && (
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-primary font-medium">1개만 선택할 수 있어요.</span>
          </div>
          <Badge>
            {selectedSubdistrict}
            <button
              onClick={() => setselectedSubdistrict("")}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
  
  
          {/* Action Buttons — 이전 + 적용하기 (통일된 디자인) */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack} //  이전 단계로 이동
              className="flex-1 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              이전
            </Button>
            <Button
              onClick={applyLocationSelection}
              disabled={!selectedSubdistrict}
              className="flex-1"
            >
            {selectedSubdistrict ? `${selectedSubdistrict} 적용하기` : "지역 선택"}
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
  
