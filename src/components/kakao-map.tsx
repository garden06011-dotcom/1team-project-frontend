"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Progress } from "@/src/components/ui/progress"
import {
  MapPin,
  Bus,
  ParkingCircle,
  Users,
  TrendingUp,
  Store,
  Heart,
  BarChart3,
  Clock,
  Calendar,
  AlertCircle,
  Award,
  Target,
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface MarkerData {
  lat: number
  lng: number
  name: string
  address: string
}

interface AnalysisData {
  busStops: number
  parkingLots: number
  pedestrians: string
  revenue: string
  competitors: number
  category: string
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

interface KakaoMapProps {
  selectedLocation?: LocationRecommendation | null
}

export function KakaoMap({ selectedLocation }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    if (selectedLocation) {
      setSelectedMarker({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        name: selectedLocation.name,
        address: selectedLocation.address,
      })

      setAnalysisData({
        busStops: 12,
        parkingLots: 8,
        pedestrians: "35.2만명/일",
        revenue: "425만원/월",
        competitors: 18,
        category: "음식점",
      })

      if (map) {
        const { kakao } = window
        const moveLatLon = new kakao.maps.LatLng(selectedLocation.lat, selectedLocation.lng)
        map.setCenter(moveLatLon)
      }
    }
  }, [selectedLocation, map])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
    if (!apiKey || apiKey === "YOUR_APP_KEY") {
      setIsDemoMode(true)
      setHasApiKey(false)
      // Show demo data automatically
      showDemoData()
    } else {
      setHasApiKey(true)
    }
  }, [])

  const showDemoData = () => {
    setSelectedMarker({
      lat: 37.566535,
      lng: 126.9779692,
      name: "서울시청 (테스트 데이터)",
      address: "서울특별시 중구 세종대로 110",
    })

    setAnalysisData({
      busStops: 12,
      parkingLots: 8,
      pedestrians: "35.2만명/일",
      revenue: "425만원/월",
      competitors: 18,
      category: "음식점",
    })
  }

  useEffect(() => {
    if (isScriptLoaded && mapRef.current && !map && hasApiKey) {
      const { kakao } = window

      const mapOption = {
        center: new kakao.maps.LatLng(37.566535, 126.9779692), // 서울시청
        level: 3,
      }

      const createdMap = new kakao.maps.Map(mapRef.current, mapOption)
      setMap(createdMap)

      // Click event to add marker
      kakao.maps.event.addListener(createdMap, "click", (mouseEvent: any) => {
        const latlng = mouseEvent.latLng

        // Create marker
        const marker = new kakao.maps.Marker({
          position: latlng,
          map: createdMap,
        })

        // Get address from coordinates
        const geocoder = new kakao.maps.services.Geocoder()
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name

            setSelectedMarker({
              lat: latlng.getLat(),
              lng: latlng.getLng(),
              name: "선택한 위치",
              address: address,
            })

            // Mock analysis data - replace with actual API calls
            setAnalysisData({
              busStops: Math.floor(Math.random() * 10) + 5,
              parkingLots: Math.floor(Math.random() * 8) + 3,
              pedestrians: `${(Math.random() * 50 + 20).toFixed(1)}만명/일`,
              revenue: `${Math.floor(Math.random() * 500 + 300)}만원/월`,
              competitors: Math.floor(Math.random() * 20) + 5,
              category: "음식점",
            })

            // Search for nearby places
            searchNearbyPlaces(createdMap, latlng)
          }
        })
      })
    }
  }, [isScriptLoaded, map, hasApiKey])

  const searchNearbyPlaces = (mapInstance: any, position: any) => {
    const { kakao } = window
    const ps = new kakao.maps.services.Places()

    // Search for bus stops
    ps.keywordSearch(
      "버스정류장",
      (data: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          data.slice(0, 5).forEach((place: any) => {
            const placePosition = new kakao.maps.LatLng(place.y, place.x)
            const marker = new kakao.maps.Marker({
              position: placePosition,
              map: mapInstance,
              image: new kakao.maps.MarkerImage(
                "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png",
                new kakao.maps.Size(36, 37),
              ),
            })
          })
        }
      },
      {
        location: position,
        radius: 500,
      },
    )
  }

  const handleSearch = () => {
    if (!map || !searchKeyword.trim()) return

    const { kakao } = window
    const ps = new kakao.maps.services.Places()

    ps.keywordSearch(searchKeyword, (data: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds()

        data.forEach((place: any) => {
          const position = new kakao.maps.LatLng(place.y, place.x)
          const marker = new kakao.maps.Marker({
            position: position,
            map: map,
          })
          bounds.extend(position)
        })

        map.setBounds(bounds)
      }
    })
  }

  return (
    <>
      {hasApiKey && (
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || "YOUR_APP_KEY"}&libraries=services&autoload=false`}
          strategy="afterInteractive"
          onLoad={() => {
            window.kakao.maps.load(() => {
              setIsScriptLoaded(true)
            })
          }}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
        {/* Map Container */}
        <div className="flex-1 relative">
          {isDemoMode ? (
            <div className="w-full h-full rounded-lg border shadow-lg bg-muted/30 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">데모 모드</h3>
                <p className="text-muted-foreground mb-6 text-balance">
                  카카오 맵 API 키가 설정되지 않아 테스트 데이터를 표시합니다. 우측 패널에서 차트 기능을 체험해보세요.
                </p>
                <div className="bg-background border rounded-lg p-4 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">API 키 설정 방법</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        좌측 사이드바의 <strong>Vars</strong> 섹션에서 <br />
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_KAKAO_MAP_KEY</code> 값을
                        입력하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="w-full h-full rounded-lg border shadow-lg" />

              {/* Search Bar Overlay */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="지역, 주소 또는 장소를 검색하세요"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-4 py-3 rounded-lg border bg-background shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={handleSearch} size="lg">
                    검색
                  </Button>
                </div>
              </div>

              {/* Info Overlay */}
              {!selectedMarker && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <Card className="bg-background/95 backdrop-blur">
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">지도를 클릭하여 상권 분석을 시작하세요</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="lg:w-[480px] overflow-y-auto">
          {selectedMarker && analysisData ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{selectedMarker.name}</CardTitle>
                    <CardDescription className="mt-1">{selectedMarker.address}</CardDescription>
                    {isDemoMode && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        테스트 데이터
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={cn(isFavorite && "text-red-500")}
                  >
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="scores">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="scores">
                      <Award className="h-4 w-4 mr-1" />
                      점수
                    </TabsTrigger>
                    <TabsTrigger value="overview">개요</TabsTrigger>
                    <TabsTrigger value="charts">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      차트
                    </TabsTrigger>
                    <TabsTrigger value="facilities">시설</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scores" className="space-y-4 mt-4">
                    {selectedLocation && (
                      <>
                        {/* Total Score */}
                        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                          <CardContent className="p-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Target className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold">종합 적합도</h4>
                            </div>
                            <div className="text-5xl font-bold text-primary mb-2">{selectedLocation.totalScore}</div>
                            <p className="text-sm text-muted-foreground">
                              이 지역은 카페 창업에 {selectedLocation.totalScore}점입니다
                            </p>
                          </CardContent>
                        </Card>

                        {/* Individual Scores */}
                        <div>
                          <h4 className="font-semibold mb-3">항목별 분석</h4>
                          <div className="space-y-4">
                            {/* Traffic Score */}
                            {/* <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span className="font-medium">입지</span>
                                  </div>
                                  <Badge variant="secondary" className="text-base font-semibold">
                                    {selectedLocation.scores.traffic}점
                                  </Badge>
                                </div>
                                <Progress value={selectedLocation.scores.traffic} className="h-3 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  지하철역 도보 2분 거리로 교통 접근성이 우수하며 유동인구가 매우 높습니다
                                </p>
                              </CardContent>
                            </Card> */}

                            {/* Rent Score */}
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-secondary" />
                                    <span className="font-medium">유동인구</span>
                                  </div>
                                  <Badge variant="secondary" className="text-base font-semibold">
                                    {selectedLocation.scores.rent}점
                                  </Badge>
                                </div>
                                <Progress value={selectedLocation.scores.rent} className="h-3 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  평일 평균 31,000명의 유동인구로 충분한 잠재고객 확보가 가능합니다
                                </p>
                              </CardContent>
                            </Card>

                            {/* Competitors Score */}
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Store className="h-5 w-5 text-accent" />
                                    <span className="font-medium">임대료</span>
                                  </div>
                                  <Badge variant="secondary" className="text-base font-semibold">
                                    {selectedLocation.scores.competitors}점
                                  </Badge>
                                </div>
                                <Progress value={selectedLocation.scores.competitors} className="h-3 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  인근 대비 저렴한 월세 조건으로 수익률이 높으며 장기 투자에 유리합니다
                                </p>
                              </CardContent>
                            </Card>

                            {/* Location Score */}
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-medium">경쟁업체</span>
                                  </div>
                                  <Badge variant="secondary" className="text-base font-semibold">
                                    {selectedLocation.scores.location}점
                                  </Badge>
                                </div>
                                <Progress value={selectedLocation.scores.location} className="h-3 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  동종 업종이 많아 활성화된 상권이지만 차별화 전략이 필요합니다
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* AI Recommendation */}
                        <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-accent/20 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-accent" />
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">AI 종합 분석</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {selectedLocation.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="overview" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">유동인구</span>
                          </div>
                          <p className="text-lg font-bold">{analysisData.pedestrians}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-secondary" />
                            <span className="text-xs text-muted-foreground">평균 임대료</span>
                          </div>
                          {/* 임대료로 바꿔야함 */}
                          <p className="text-lg font-bold">{analysisData.revenue}</p> 
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Store className="h-4 w-4 text-accent" />
                            <span className="text-xs text-muted-foreground">경쟁업체</span>
                          </div>
                          <p className="text-lg font-bold">{analysisData.competitors}개</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">업종</span>
                          </div>
                          <p className="text-lg font-bold">{analysisData.category}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">유동인구 분석</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>여성</span>
                            <span className="font-medium">85점</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: "85%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>남성</span>
                            <span className="font-medium">92점</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-secondary" style={{ width: "92%" }} />
                          </div>
                        </div>
                        {/* <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>시간대별</span>
                            <span className="font-medium">78점</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: "78%" }} />
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="charts" className="space-y-6 mt-4">
                    {/* 유동인구 차트 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-lg">시간대별 유동인구</h4>
                      </div>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart
                              data={[
                                { time: "06:00", count: 1200, label: "06시" },
                                { time: "09:00", count: 3500, label: "09시" },
                                { time: "12:00", count: 5800, label: "12시" },
                                { time: "15:00", count: 4200, label: "15시" },
                                { time: "18:00", count: 6200, label: "18시" },
                                { time: "21:00", count: 3800, label: "21시" },
                                { time: "24:00", count: 1500, label: "24시" },
                              ]}
                            >
                              <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis
                                dataKey="label"
                                stroke="hsl(var(--muted-foreground))"
                                style={{ fontSize: "12px" }}
                              />
                              <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                style={{ fontSize: "12px" }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                                formatter={(value: number) => [`${value.toLocaleString()}명`, "유동인구"]}
                              />
                              <Area
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                              <span>실시간 유동인구 데이터</span>
                            </div>
                            <Badge variant="secondary">평균 4,175명</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 매출 차트 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-secondary" />
                        <h4 className="font-semibold text-lg">요일별 유동인구</h4>
                      </div>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                              data={[
                                { day: "월", revenue: 320, label: "월요일", weekend: false },
                                { day: "화", revenue: 380, label: "화요일", weekend: false },
                                { day: "수", revenue: 350, label: "수요일", weekend: false },
                                { day: "목", revenue: 420, label: "목요일", weekend: false },
                                { day: "금", revenue: 520, label: "금요일", weekend: false },
                                { day: "토", revenue: 680, label: "토요일", weekend: true },
                                { day: "일", revenue: 590, label: "일요일", weekend: true },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                              <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                style={{ fontSize: "12px" }}
                                tickFormatter={(value) => `${value}만`}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                                formatter={(value: number) => [`${value}만원`, "매출"]}
                                labelFormatter={(label) => {
                                  const days: Record<string, string> = {
                                    월: "월요일",
                                    화: "화요일",
                                    수: "수요일",
                                    목: "목요일",
                                    금: "금요일",
                                    토: "토요일",
                                    일: "일요일",
                                  }
                                  return days[label as string] || label
                                }}
                              />
                              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="hsl(var(--secondary))">
                                {[
                                  { day: "월", revenue: 320, weekend: false },
                                  { day: "화", revenue: 380, weekend: false },
                                  { day: "수", revenue: 350, weekend: false },
                                  { day: "목", revenue: 420, weekend: false },
                                  { day: "금", revenue: 520, weekend: false },
                                  { day: "토", revenue: 680, weekend: true },
                                  { day: "일", revenue: 590, weekend: true },
                                ].map((entry, index) => (
                                  <rect
                                    key={`cell-${index}`}
                                    fill={entry.weekend ? "hsl(var(--accent))" : "hsl(var(--secondary))"}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-3 h-3 rounded bg-secondary" />
                                <span>평일</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-3 h-3 rounded bg-accent" />
                                <span>주말</span>
                              </div>
                            </div>
                            <Badge variant="secondary">주평균 465만원</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 월별 매출 추이 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-lg">임대료 변화 추이</h4>
                      </div>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                              data={[
                                { month: "1월", revenue: 11500, growth: 5 },
                                { month: "2월", revenue: 12200, growth: 6 },
                                { month: "3월", revenue: 13800, growth: 13 },
                                { month: "4월", revenue: 14100, growth: 2 },
                                { month: "5월", revenue: 15600, growth: 11 },
                                { month: "6월", revenue: 16200, growth: 4 },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis
                                dataKey="month"
                                stroke="hsl(var(--muted-foreground))"
                                style={{ fontSize: "11px" }}
                              />
                              <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                style={{ fontSize: "11px" }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                                formatter={(value: number, name: string) => {
                                  if (name === "revenue") return [`${(value / 10000).toFixed(1)}억원`, "매출"]
                                  return [`${value}%`, "성장률"]
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(var(--accent))"
                                strokeWidth={3}
                                dot={{ fill: "hsl(var(--accent))", r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">최근 6개월 평균 성장률</span>
                            <Badge className="bg-accent/10 text-accent border-accent/20">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +6.8%
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 경쟁업체 비교 */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4">업종별 비교 분석</h4>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {[
                              { name: "카페", value: 85, color: "bg-primary" },
                              { name: "음식점", value: 72, color: "bg-secondary" },
                              { name: "편의점", value: 65, color: "bg-accent" },
                              { name: "의류", value: 48, color: "bg-muted" },
                            ].map((item, index) => (
                              <div key={index}>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-muted-foreground">{item.value}점</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${item.color} transition-all duration-500`}
                                    style={{ width: `${item.value}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">AI 데이터 분석</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              이 지역은 주말 매출이 평일 대비 45% 높으며, 오후 6시 이후 유동인구가 급증합니다. 카페 및
                              외식 업종에 최적화된 상권으로 분석됩니다.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="facilities" className="space-y-3 mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Bus className="h-5 w-5 text-primary" />
                            <span className="font-semibold">버스 정류장</span>
                          </div>
                          <Badge variant="secondary">{analysisData.busStops}개</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">반경 500m 내 버스 정류장 수</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ParkingCircle className="h-5 w-5 text-secondary" />
                            <span className="font-semibold">주차장</span>
                          </div>
                          <Badge variant="secondary">{analysisData.parkingLots}개</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">인근 주차 시설 현황</p>
                      </CardContent>
                    </Card>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">주변 편의시설</h4>
                      <div className="space-y-2">
                        {[
                          { name: "지하철역", distance: "250m", count: 2 },
                          { name: "은행", distance: "180m", count: 5 },
                          { name: "학교", distance: "420m", count: 3 },
                          { name: "병원", distance: "350m", count: 4 },
                        ].map((facility, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{facility.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{facility.count}개</span>
                              <span>•</span>
                              <span>{facility.distance}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button className="w-full" size="lg">
                  상세 리포트 다운로드
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">위치를 선택하세요</h3>
                <p className="text-sm text-muted-foreground text-balance">
                  {isDemoMode ? "API 키가 없어 데모 모드로 실행 중입니다" : "지도에서 관심 있는 위치를 클릭하면"}
                  <br />
                  {isDemoMode
                    ? "우측 상단 버튼으로 테스트 데이터를 확인하세요"
                    : "상세한 상권 분석 정보를 확인할 수 있습니다"}
                </p>
                {isDemoMode && (
                  <Button onClick={showDemoData} className="mt-4" size="lg">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    테스트 차트 보기
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
