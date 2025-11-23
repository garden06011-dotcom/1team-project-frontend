"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import axios from "axios";

// shadcn UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

import {
  MapPin,
  Heart,
  Train,
  ParkingCircle,
  Users,
  TrendingUp,
  Store,
  BarChart3,
  Clock,
  Calendar,
  Award
} from "lucide-react";

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line } from "recharts";
import { cn } from "@/src/lib/utils";

interface KakaoMapProps {
  selectedDong: string | null;
  dongCenter: { lat: number; lng: number } | null;
  businessType?: string;
}

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface AnalysisData {
  parkingLots: number;
  schools: number;
  hospitals: number;
  touristSpots: number;
  culturalFacilities: number;
  competitors: number;
  pedestrians: string;
  revenue: string;
  category: string;
  score?: string;
  subwayStations: number;
  banks: number;
}

export default function KakaoMap({ selectedDong, dongCenter, businessType }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [analysisList, setAnalysisList] = useState<{ marker: MarkerData; analysis: AnalysisData }[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentBusinessType, setCurrentBusinessType] = useState<string>("");
  const [activeTab, setActiveTab] = useState("scores")


  // 선택한 업종
  useEffect(() => {
    if (businessType) {
      console.log("Wizard에서 넘어온 업종 적용:", businessType);
      setCurrentBusinessType(businessType);
    }
  }, [businessType]);
  

  // Wizard에서 선택된 중심 좌표로 이동
  useEffect(() => {
    if (map && dongCenter) {
      const { kakao } = window;
      map.setCenter(new kakao.maps.LatLng(dongCenter.lat, dongCenter.lng));
      map.setLevel(3);
    }
  }, [map, dongCenter]);

    // 지도 초기화  
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current) return;
  
    const { kakao } = window;
    const createdMap = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.566535, 126.9779692),
      level: 3,
    });

    setMap(createdMap);

  
    // 지도 클릭 이벤트
    kakao.maps.event.addListener(createdMap, "click", async (mouseEvent: any) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();

      const marker = new kakao.maps.Marker({ map: createdMap, position: latlng });

      // 마커 5개 이상일 경우 → 가장 오래된 마커 삭제
      setMarkers((prevMarkers) => {
        if (prevMarkers.length >= 2) {
          prevMarkers[0].setMap(null); // 지도에서 제거
          return [...prevMarkers.slice(1), marker]; // 최신 마커 추가
        }
        return [...prevMarkers, marker];
      });
      

      // 주소 변환
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(lng, lat, async (result: any, status: any) => {
        if (status !== kakao.maps.services.Status.OK) return;
        const address = result[0].address.address_name;
        const roadName = result[0].road_address?.building_name || address;

        setSelectedMarker({ lat, lng, name: roadName, address });

        try {
          // AI 분석
          const aiRes = await axios.post(`${process.env.NEXT_PUBLIC_FLASK_URL}/predict`, { lat, lng });
          // 시설 분석
          const facilityRes = await searchNearbyPlaces(latlng);
          
          console.log("@@!@@!! facilityRes:", facilityRes)
          const newAnalysis: AnalysisData = {
            subwayStations: facilityRes.subwayStations,
            parkingLots: facilityRes.parkingLots,
            banks: facilityRes.banks,
            schools: facilityRes.schools,
            hospitals: facilityRes.hospitals,
            touristSpots: facilityRes.touristSpots,
            culturalFacilities: facilityRes.culturalFacilities,
            competitors: Number(`${aiRes.data["음식점경쟁업체수"].toFixed(1)}`),
            pedestrians: `${aiRes.data["생활인구"].toFixed(1)}명`,
            revenue: `${aiRes.data["임대료"].toFixed(1)}만원/㎡`,
            category: currentBusinessType || "미분류",
            score: Number(aiRes.data["점수"]).toFixed(1),
          };
        
          setAnalysisList(prev => {
            let updated = [...prev, { marker: { lat, lng, name: roadName, address }, analysis: newAnalysis }];
            if (updated.length > 2) updated.shift(); 
            return updated;
          });
        } catch (err) {
          console.error("분석 오류:", err);
        }
      });
    });
  }, [isScriptLoaded, currentBusinessType]);

  // 시설 분석 함수
  const searchNearbyPlaces = (position: any) => {
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
  
    // 카테고리 검색 함수
    const countCategory = (category: string) =>
      new Promise<number>((resolve) => {
        ps.categorySearch(
          category,
          (data: any, status: any) =>
            resolve(status === kakao.maps.services.Status.OK ? data.length : 0),
          { location: position, radius: 300 }
        );
      });
  
    // 👇 필요한 시설 모두 검색
    return Promise.all([
      countCategory("SW8"), // 지하철역
      countCategory("PK6"), // 주차장
      countCategory("BK9"), // 은행
      countCategory("SC4"), // 학교
      countCategory("HP8"), // 병원
      countCategory("AT4"), // 관광명소
      countCategory("CT1"), // 문화시설
    ]).then(([subwayStations, parkingLots, banks, schools, hospitals, touristSpots, culturalFacilities]) => ({
      subwayStations,
      parkingLots,
      banks,
      schools,
      hospitals,
      touristSpots,
      culturalFacilities,
    }));
  };
  

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => window.kakao.maps.load(() => setIsScriptLoaded(true))}
      />

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
        <div className="flex-1">
          <div ref={mapRef} className="w-full h-full rounded-lg border shadow-lg" />
        </div>

       {/* Analysis Panel */}
       <div className="lg:w-[480px] overflow-y-auto">
  {analysisList.length > 0 ? (
    analysisList.map((item, index) => (
      <Card key={index} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {index === 0 ? "A 먼저 선택한 지점" : "B 뒤에 선택한 지점"}
            </div>
              <CardTitle className="text-xl">{item.marker.name}</CardTitle>
              <CardDescription className="mt-1">{item.marker.address}</CardDescription>
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="scores"><Award className="h-4 w-4 mr-1" />점수</TabsTrigger>
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="charts"><BarChart3 className="h-4 w-4 mr-1" />차트</TabsTrigger>
              <TabsTrigger value="facilities">시설</TabsTrigger>
            </TabsList>

            {/* 점수 */}
            <TabsContent value="scores" className="space-y-4 mt-4">
              <div className="text-5xl font-bold text-primary mb-2">{item.analysis.score}점</div>
              <p className="text-sm">{item.marker.address} 기준 분석 결과입니다.</p>
            </TabsContent>


                  <TabsContent value="overview" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">유동인구</span>
                          </div>
                          <p className="text-lg font-bold">{item.analysis.pedestrians}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-secondary" />
                            <span className="text-xs text-muted-foreground">평균 임대료</span>
                          </div>
                          {/* 임대료로 바꿔야함 */}
                          <p className="text-lg font-bold">{item.analysis.revenue}</p> 
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Store className="h-4 w-4 text-accent" />
                            <span className="text-xs text-muted-foreground">경쟁업체</span>
                          </div>
                          <p className="text-lg font-bold">{ item.analysis.competitors}개</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">업종</span>
                          </div>
                          <p className="text-lg font-bold">{item.analysis.category}</p>
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
                              <Train className="h-5 w-5 text-primary" />
                            <span className="font-semibold">지하철역</span>
                          </div>
                          <Badge variant="secondary">{item.analysis.subwayStations}개</Badge>
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
                          <Badge variant="secondary">{item.analysis.parkingLots}개</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">인근 주차 시설 현황</p>
                      </CardContent>
                    </Card>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">주변 편의시설</h4>
                      <div className="space-y-2">
                        {[
                          { name: "은행", distance: "350m", count: item.analysis.banks || 5 },
                          { name: "학교", distance: "350m", count: item.analysis.schools || 3 },
                          { name: "병원", distance: "350m", count: item.analysis.hospitals || 4 },
                          { name: "관광명소", distance: "350m", count: item.analysis.touristSpots || 4 },
                          { name: "문화시설", distance: "350m", count: item.analysis.culturalFacilities || 4 },
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
          ))
        ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">위치를 선택하세요</h3>
                
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}