////////////////////////
// 카카오 맵 컴포넌트
////////////////////////

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import axios from "axios";
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
  Users,
  TrendingUp,
  Store,
  BarChart3,
  Award,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import PopulationCharts from "@/src/components/population-charts";
import TimeDayCharts from "@/src/components/time-day-charts";
import FacilityAnalysis, { FACILITY_CATEGORIES } from "@/src/components/facility-analysis";
import RankingsChart from "@/src/components/rankings-chart";
import CompetitorRankingTable from "@/src/components/competitor-ranking-table";
import PredictionTab from "@/src/components/prediction-tab";
import { generatePDFReport } from "@/src/utils/pdfGenerator";

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
  dong?: string;
  district?: string;
  city?: string;
  exactDong?: string;
}

interface AnalysisData {
  parkingLots: number;
  schools: number;
  hospitals: number;
  touristSpots: number;
  culturalFacilities: number;
  competitors: number;
  human: string;
  sales: string;
  category: string;
  score?: string;
  subwayStations: number;
  banks: number;
}

interface PopulationData {
  gender: Array<{
    성별: string;
    성별총합: number;
    '성별비율(%)': number;
  }>;
  age: Array<{
    연령대: string;
    합계: number;
  }>;
}

interface TimeDayData {
  time: Array<{
    시간대: string;
    유동인구: number;
  }>;
  day: Array<{
    요일: string;
    유동인구: number;
  }>;
}

interface FacilityData {
  name: string;
  address: string;
  distance: string;
  lat: number;
  lng: number;
  category: string;
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
  const [activeTab, setActiveTab] = useState("scores");
  const [currentDongs, setCurrentDongs] = useState<Array<{ dong: string; coordinates: number[][][] }>>([]);
  const [populationData, setPopulationData] = useState<PopulationData | null>(null);
  const [timeDayData, setTimeDayData] = useState<TimeDayData | null>(null);
  const [facilityData, setFacilityData] = useState<{ [key: string]: FacilityData[] }>({});
  const reportRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [selectedFacilityCategory, setSelectedFacilityCategory] = useState<string | null>(null);
  const [rankingOverlays, setRankingOverlays] = useState<any[]>([]); // 순위 오버레이 저장

  // 업종 타입 설정
  useEffect(() => {
    if (businessType) setCurrentBusinessType(businessType);
  }, [businessType]);

  // 카카오 맵 스크립트 로드
  useEffect(() => {
    if (typeof window !== 'undefined' && window.kakao?.maps && !isScriptLoaded) {
      window.kakao.maps.load(() => setIsScriptLoaded(true));
    }
  }, [isScriptLoaded]);

  // 유동인구 데이터 로드
  const loadPopulationData = async (dongName: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/map/population-data`, {
        dongName: dongName,
      });

      console.log("populationData:", response.data);
      
      if (response.data) {
        setPopulationData(response.data);
      } else {
        console.warn(`유동인구 데이터를 찾을 수 없습니다: ${dongName}`);
        setPopulationData(null);
      }
    } catch (error) {
      console.error('유동인구 데이터 로드 실패:', error);
      setPopulationData(null);
    }
  };

  // 시간대/요일 유동인구 데이터 로드
  const loadTimeDayData = async (dongName: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/map/time-day-data`, {
        dongName: dongName,
      });

      console.log("timeDayData:", response.data);
      
      if (response.data) {
        setTimeDayData(response.data);
      } else {
        console.warn(`시간대/요일 유동인구 데이터를 찾을 수 없습니다: ${dongName}`);
        setTimeDayData(null);
      }
    } catch (error) {
      console.error('시간대/요일 유동인구 데이터 로드 실패:', error);
      setTimeDayData(null);
    }
  };

  // 시설 검색
  const searchFacilities = async () => {
    if (!map || !selectedMarker) return;

    setIsLoadingFacilities(true);

    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
    const position = new kakao.maps.LatLng(selectedMarker.lat, selectedMarker.lng);
    
    const allFacilities: { [key: string]: FacilityData[] } = {};

    // 각 카테고리별 시설 검색
    const searchPromises = FACILITY_CATEGORIES.map((category) => {
      return new Promise<void>((resolve) => {
        ps.categorySearch(
          category.code,
          (data: any, status: any) => {
            if (status === kakao.maps.services.Status.OK) {
              allFacilities[category.name] = data.map((place: any) => ({
                name: place.place_name,
                address: place.address_name,
                distance: place.distance ? `${place.distance}m` : '-',
                lat: parseFloat(place.y),
                lng: parseFloat(place.x),
                category: category.name
              }));
            }
            resolve();
          },
          { location: position, radius: 500, size: 5 }
        );
      });
    });

    await Promise.all(searchPromises);

    setFacilityData(allFacilities);
    setIsLoadingFacilities(false);
  };

  // 특정 카테고리 시설만 필터링 (모달에서만 표시)
  const filterFacilityMarkers = (categoryName: string | null) => {
    setSelectedFacilityCategory(categoryName);
  };

  // 점이 폴리곤 내부에 있는지 확인
  const isPointInPolygon = (lat: number, lng: number, coordinates: number[][][]) => {
    const point = { x: lng, y: lat };
    const polygon = coordinates[0];
    
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      const intersect = ((yi > point.y) !== (yj > point.y))
          && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // 주소에서 시/구/동 추출
  const parseAddress = (address: string) => {
    const parts = address.split(" ");
    let city = "", district = "", dong = "";
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.includes("특별시")) {
        city = part.replace("특별시", "").trim();
      } else if (part.includes("광역시")) {
        city = part.replace("광역시", "").trim();
      } else if (part.endsWith("시")) {
        city = part.replace(/시$/g, "").trim();
      } else if (part.endsWith("도")) {
        city = part.replace(/도$/g, "").trim();
      } else if (i === 0 && (part === "서울" || part === "부산" || part === "대구" || part === "인천" || part === "광주" || part === "대전" || part === "울산" || part === "세종")) {
        city = part;
      }
      
      if (part.endsWith("구") && part !== "구") {
        district = part.replace(/구$/g, "").trim();
      } else if (part.endsWith("군")) {
        district = part.replace(/군$/g, "").trim();
      }
      
      if (part.endsWith("동") && part !== "동") {
        dong = part.replace(/동$/g, "").trim();
        break;
      } else if (part.endsWith("읍")) {
        dong = part.replace(/읍$/g, "").trim();
        break;
      } else if (part.endsWith("면")) {
        dong = part.replace(/면$/g, "").trim();
        break;
      }
    }
    
    return { city, district, dong };
  };

  // 마커 생성
  const createMarker = (latlng: any, createdMap: any) => {
    const { kakao } = window;
    const imageSrc = "/marker-basic.png";
    const imageSize = new kakao.maps.Size(40, 50);
    const imageOption = { offset: new kakao.maps.Point(12, 35) };
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    return new kakao.maps.Marker({
      map: createdMap,
      position: latlng,
      image: markerImage,
    });
  };

  // 시설 분석
  const searchNearbyPlaces = (position: any) => {
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
  
    const countCategory = (category: string) =>
      new Promise<number>((resolve) => {
        ps.categorySearch(
          category,
          (data: any, status: any) =>
            resolve(status === kakao.maps.services.Status.OK ? data.length : 0),
          { location: position, radius: 300 }
        );
      });
  
    return Promise.all([
      countCategory("SW8"), countCategory("PK6"), countCategory("BK9"),
      countCategory("SC4"), countCategory("HP8"), countCategory("AT4"), countCategory("CT1"),
    ]).then(([subwayStations, parkingLots, banks, schools, hospitals, touristSpots, culturalFacilities]) => ({
      subwayStations, parkingLots, banks, schools, hospitals, touristSpots, culturalFacilities,
    }));
  };

  // 정확한 동 이름 찾기
  const findExactDong = async (lat: number, lng: number, city: string, district: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/map/district-polygons`, {
        city, district,
      });
      
      if (res.data?.dongs) {
        for (const dongData of res.data.dongs) {
          if (dongData.coordinates?.[0] && isPointInPolygon(lat, lng, dongData.coordinates)) {
            const exactDongName = dongData.dong.replace(/동$/, "");
            return exactDongName;
          }
        }
      }
    } catch (err) {
      console.error("정확한 동 찾기 실패:", err);
    }
    return null;
  };

  // 지도 클릭 핸들러
  const handleMapClick = async (mouseEvent: any, createdMap: any) => {
    const { kakao } = window;
    const latlng = mouseEvent.latLng;
    const lat = latlng.getLat();
    const lng = latlng.getLng();

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, async (result: any, status: any) => {
      if (status !== kakao.maps.services.Status.OK) return;
      
      const address = result[0].address.address_name;
      const roadName = result[0].road_address?.building_name || address;
      const parsedAddress = parseAddress(address);
      const { city, district, dong } = parsedAddress;

      // 기존 마커 제거
      setMarkers((prev) => {
        prev.forEach((m) => m.setMap(null));
        return [];
      });
      // 기존 오버레이 제거
      rankingOverlays.forEach(overlay => {
        try {
          overlay.setMap(null);
        } catch (e) {}
      });
      setRankingOverlays([]);
      setFacilityData({});

      // 새 마커 생성
      const marker = createMarker(latlng, createdMap);
      setMarkers([marker]);

      // 정확한 동 이름 찾기
      let exactDong = dong;
      if (city && city.trim() !== "" && district && district.trim() !== "") {
        const foundDong = await findExactDong(lat, lng, city, district);
        if (foundDong) {
          exactDong = foundDong;
        }
      }

      const markerData: MarkerData = {
        lat, lng, name: roadName, address, dong, district, city,
        exactDong: exactDong || dong,
      };
      
      setSelectedMarker(markerData);

      // 유동인구 데이터 로드
      if (exactDong) {
        await Promise.all([
          loadPopulationData(exactDong),
          loadTimeDayData(exactDong)
        ]);
      }

      // 마커 인포윈도우
      const infoWindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:3px;font-size:12px;font-weight:bold;">${exactDong ? exactDong + '동' : dong ? dong + '동' : address}</div>`,
        removable: false,
      });

      kakao.maps.event.addListener(marker, 'mouseover', () => infoWindow.open(createdMap, marker));
      kakao.maps.event.addListener(marker, 'mouseout', () => infoWindow.close());

      try {
        const [aiRes, facilityRes] = await Promise.all([
          axios.post(`${process.env.NEXT_PUBLIC_FLASK_URL}/predict`, { lat, lng }),
          searchNearbyPlaces(latlng),
        ]);
        
        const newAnalysis: AnalysisData = {
          ...facilityRes,
          competitors: Number(aiRes.data["음식점경쟁업체수"].toFixed(1)),
          human: `${aiRes.data["생활인구"].toFixed(1)}명`,
          sales: `${aiRes.data["임대료"].toFixed(1)}만원/㎡`,
          category: currentBusinessType || "미분류",
          score: Number(aiRes.data["점수"]).toFixed(1),
        };
      
        setAnalysisList([{ marker: markerData, analysis: newAnalysis }]);
        
        // 순위 데이터 가져와서 1,2,3위 오버레이 마커 표시
        await displayRankingOverlays(createdMap, district, exactDong || dong);
      } catch (err) {
        console.error("분석 오류:", err);
      }
    });
  };
  
  // 순위 오버레이 마커 표시 함수
  const displayRankingOverlays = async (createdMap: any, district?: string, dongName?: string) => {
    if (!map || !createdMap) return;
    
    const { kakao } = window;
    
    // 기존 오버레이 제거
    rankingOverlays.forEach(overlay => {
      try {
        overlay.setMap(null);
      } catch (e) {}
    });
    setRankingOverlays([]);
    
    try {
      // 순위 데이터 가져오기
      const flaskUrl = process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:5000';
      const params: any = {
        type: 'percent',
        limit: 10
      };
      
      if (district) {
        params.gu = district + '구';
      }
      
      const response = await axios.get(`${flaskUrl}/api/store`, { params });
      console.log("📍 순위 데이터 (오버레이용):", response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // 1,2,3위만 필터링
        const top3 = response.data.data.slice(0, 3).map((item: any, index: number) => ({
          rank: index + 1,
          district: (item.행정구 || item.구 || '').replace(/구$/, ''),
          dong: (item.행정동 || item.동 || '').replace(/동$/, ''),
          changeRate: item.증감률 || item.percent || 0
        }));
        
        // 각 동의 좌표 가져오기
        const geocoder = new kakao.maps.services.Geocoder();
        const overlays: any[] = [];
        
        // Promise로 변환하여 순차 처리
        const overlayPromises = top3.map((item: { rank: number; district: string; dong: string; changeRate: number }) => {
          return new Promise<void>((resolve) => {
            try {
              const address = `${item.district}구 ${item.dong}동`;
              geocoder.addressSearch(address, (result: any, status: any) => {
                if (status === kakao.maps.services.Status.OK && result && result.length > 0) {
                  const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                  
                  // 커스텀 오버레이 생성
                  const content = `
                    <div style="
                      padding: 8px 12px;
                      background: ${item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : '#CD7F32'};
                      color: white;
                      border-radius: 20px;
                      font-size: 12px;
                      font-weight: bold;
                      white-space: nowrap;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      text-align: center;
                    ">
                      <div>${item.rank}위</div>
                      <div style="font-size: 10px; margin-top: 2px;">
                        ${item.changeRate > 0 ? '+' : ''}${item.changeRate.toFixed(1)}%
                      </div>
                    </div>
                  `;
                  
                  const customOverlay = new kakao.maps.CustomOverlay({
                    position: coords,
                    content: content,
                    yAnchor: 1,
                  });
                  
                  customOverlay.setMap(createdMap);
                  overlays.push(customOverlay);
                } else {
                  console.warn(`좌표를 찾을 수 없습니다: ${address}`);
                }
                resolve();
              });
            } catch (e) {
              console.warn(`순위 오버레이 생성 실패 (${item.dong}동):`, e);
              resolve();
            }
          });
        });
        
        await Promise.all(overlayPromises);
        setRankingOverlays(overlays);
        console.log(`✅ 순위 오버레이 ${overlays.length}개 표시 완료`);
      }
    } catch (error) {
      console.warn("순위 오버레이 데이터 로드 실패:", error);
    }
  };

  // 지도 초기화
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || map) return;
  
    try {
      const { kakao } = window;
      if (!kakao?.maps) return;
      
      const initialCenter = dongCenter?.lat && dongCenter?.lng
        ? new kakao.maps.LatLng(dongCenter.lat, dongCenter.lng)
        : new kakao.maps.LatLng(37.566535, 126.9779692);
      
      const createdMap = new kakao.maps.Map(mapRef.current, {
        center: initialCenter,
        level: 3,
      });

      setMap(createdMap);
      kakao.maps.event.addListener(createdMap, "click", (e: any) => handleMapClick(e, createdMap));
    } catch (err) {
      console.error("지도 초기화 오류:", err);
    }
  }, [isScriptLoaded, currentBusinessType, dongCenter, map]);

  // 폴리곤 제거
  const clearAllPolygons = () => {
    if ((window as any).polygons?.length) {
      (window as any).polygons.forEach((p: any) => p.setMap(null));
      (window as any).polygons = [];
    }
  };

  // 여러 폴리곤 그리기
  const drawMultiplePolygons = (dongs: Array<{ dong: string; coordinates: number[][][] }>) => {
    const { kakao } = window;
    if (!map) return;
  
    setCurrentDongs(dongs);
    clearAllPolygons();
  
    const bounds = new kakao.maps.LatLngBounds();
    const polygons: any[] = [];
  
    let exactMatchDong: string | null = null;
    if (selectedMarker?.lat && selectedMarker?.lng) {
      for (const dongData of dongs) {
        if (dongData.coordinates?.[0] && isPointInPolygon(selectedMarker.lat, selectedMarker.lng, dongData.coordinates)) {
          exactMatchDong = dongData.dong;
          break;
        }
      }
    }
  
    dongs.forEach((dongData) => {
      if (!dongData.coordinates?.[0]) return;
      
      const path = dongData.coordinates[0].map(([lng, lat]) => new kakao.maps.LatLng(lat, lng));
      const isSelected = exactMatchDong === dongData.dong;
      
      const polygon = new kakao.maps.Polygon({
        map,
        path,
        strokeWeight: isSelected ? 3 : 2,
        strokeColor: isSelected ? "#FF5F5F" : "#4285F4",
        strokeOpacity: 0.8,
        fillColor: isSelected ? "#FF5F5F" : "#4285F4",
        fillOpacity: isSelected ? 0.2 : 0.15,
      });
      
      polygons.push(polygon);
      path.forEach((p) => bounds.extend(p));
    });
  
    (window as any).polygons = polygons;
    if (polygons.length > 0) map.setBounds(bounds, 50);
  };

  // selectedMarker 변경 시 폴리곤 업데이트
  useEffect(() => {
    if (map && currentDongs.length > 0) {
      drawMultiplePolygons(currentDongs);
    }
  }, [selectedMarker, map]);

  // Wizard에서 선택된 지역으로 이동
  useEffect(() => {
    if (!map || !selectedDong?.trim()) return;
    
    const moveToArea = async () => {
      try {
        const parts = selectedDong.split(" ");
        const city = parts[0].replace("시", "").trim();
        const district = parts[1]?.trim();
        
        if (!city || !district) return;
  
        const resCenter = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/map/location-center`, {
          city, district,
        });
  
        const { kakao } = window;
        map.setCenter(new kakao.maps.LatLng(resCenter.data.lat, resCenter.data.lng));
        map.setLevel(5);
  
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/map/district-polygons`, {
          city, district,
        });
        
        if (res.data?.dongs?.length > 0) {
          drawMultiplePolygons(res.data.dongs);
        }
      } catch (err) {
        console.error("구/동 지도 이동 실패:", err);
      }
    };
  
    moveToArea();
  }, [map, selectedDong]);


  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => window.kakao.maps.load(() => setIsScriptLoaded(true))}
      />

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
        <div className="flex-1 relative">
          {!isScriptLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg border z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full rounded-lg border shadow-lg" />
        </div>

        <div className="lg:w-[480px] overflow-y-auto">
          {analysisList.length > 0 ? (
            analysisList.map((item, index) => (
              <div key={index} ref={(el) => { if (el) reportRefs.current[index] = el; }}>
              <Card className="mb-4">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {item.marker.district && `${item.marker.district}구 `} 의 상권 추천 결과
                        {/* {item.marker.exactDong ? `${item.marker.exactDong}동` : item.marker.dong ? `${item.marker.dong}동` : ''} */}
                      </CardTitle>
                      {/* <CardDescription className="mt-1">{item.marker.address}</CardDescription> */}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="scores"><Award className="h-4 w-4 mr-1" />점수 / 개요</TabsTrigger>
                      <TabsTrigger value="charts"><BarChart3 className="h-4 w-4 mr-1" />차트</TabsTrigger>
                      <TabsTrigger value="prediction"><TrendingUpIcon className="h-4 w-4 mr-1" />AI 예측</TabsTrigger>
                      
                    </TabsList>

                    <TabsContent value="scores" className="space-y-4 mt-4">
                      {/* 경쟁업체 순위표 (상단) */}
                      <CompetitorRankingTable
                        dongName={item.marker.exactDong || item.marker.dong}
                        city={item.marker.city}
                        district={item.marker.district}
                      />
                      
                      <div className="text-5xl font-bold text-primary mb-2">{item.analysis.score}점</div>
                      <p className="text-sm">{item.marker.address} 기준 분석 결과입니다.</p>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: Users, label: "유동인구", value: item.analysis.human, color: "text-primary" },
                          { icon: TrendingUp, label: "평균 임대료", value: item.analysis.sales, color: "text-secondary" },
                          { icon: Store, label: "경쟁업체", value: `${item.analysis.competitors}개`, color: "text-accent" },
                          { icon: MapPin, label: "업종", value: item.analysis.category, color: "text-primary" },
                        ].map((stat, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                <span className="text-xs text-muted-foreground">{stat.label}</span>
                              </div>
                              <p className="text-lg font-bold">{stat.value}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="prediction" className="space-y-4 mt-4">
                      <PredictionTab
                        dongName={item.marker.exactDong || item.marker.dong}
                        city={item.marker.city}
                        district={item.marker.district}
                        currentHuman={item.analysis.human}
                        currentSales={item.analysis.sales}
                        currentCompetitors={item.analysis.competitors}
                      />
                    </TabsContent>

                    <TabsContent value="charts" className="space-y-6 mt-4">
                      <PopulationCharts populationData={populationData} />
                      <TimeDayCharts timeDayData={timeDayData} />
                    </TabsContent>
                  </Tabs>

                  {/* 주변 시설 분석 */}
                  <FacilityAnalysis
                    selectedMarker={item.marker}
                    facilityData={facilityData}
                    isLoadingFacilities={isLoadingFacilities}
                    onSearchFacilities={searchFacilities}
                    onFilterFacilityMarkers={filterFacilityMarkers}
                    selectedFacilityCategory={selectedFacilityCategory}
                  />

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={async () => {
                      try {
                        const reportElement = reportRefs.current[index];
                        if (!reportElement) {
                          alert('리포트 영역을 찾을 수 없습니다.');
                          return;
                        }
                        
                        // PDF에 포함할 데이터 준비
                        const reportData = {
                          city: item.marker.city,
                          district: item.marker.district,
                          dong: item.marker.exactDong || item.marker.dong,
                          businessType: item.analysis.category,
                          rent: item.analysis.sales,
                          score: item.analysis.score,
                        };
                        
                        await generatePDFReport(reportElement, reportData);
                      } catch (error: any) {
                        console.error('PDF 생성 실패_map 화면:', error);
                        const errorMessage = error?.message || '알 수 없는 오류';
                        if (errorMessage.includes('색상') || errorMessage.includes('color')) {
                          alert('PDF 생성 중 색상 처리 오류가 발생했습니다.\n브라우저를 최신 버전으로 업데이트하거나, 다른 브라우저에서 시도해주세요.');
                        } else {
                          alert(`PDF 생성에 실패했습니다: ${errorMessage}`);
                        }
                      }
                    }}
                  >
                    상세 리포트 다운로드
                  </Button>
                </CardContent>
              </Card>
              </div>
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
  );
}
