"use client"

import { useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Newspaper, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/src/lib/utils"

// 기사 데이터 타입
type NewsArticle = {
  id: string
  title: string
  excerpt: string
  link: string
  date: string
  source: string
}

// 기사 데이터
const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "'최대 360만원' 소상공인 아이돌봄서비스 확대…기준완화·가사지원",
    excerpt: "서울시는 소상공인 대상 민간 아이돌봄서비스 지원을 확대해 일‧육아 병행이 가능한 환경 조성에 힘쓴다. 경기 침체와 물가 상승으로 소상공인들의 어려움이 커지는 가운데, 서울시는 소상공인 사업주와 종사자 대상으로 추진하고 있는 '소상공인 민간 아이돌봄서비스 지원사업'의 자격요건을 대폭 완화해 지원을 확대한다.",
    link: "https://mediahub.seoul.go.kr/archives/2013897",
    date: "2025.03.28",
    source: "서울시 미디어허브",
  },
  {
    id: "2",
    title: "소상공인 경영안정자금 지원 확대",
    excerpt: "정부가 소상공인 경영안정자금 지원 규모를 확대하고 이자율을 인하한다고 발표했다. 이번 조치는 경기 침체로 어려움을 겪고 있는 소상공인들의 자금 조달 부담을 완화하기 위한 것이다.",
    link: "#",
    date: "2025.03.25",
    source: "중소벤처기업부",
  },
  {
    id: "3",
    title: "2025년 자영업자 창업 트렌드 분석",
    excerpt: "최근 자영업자 창업 트렌드를 분석한 결과, 온라인 쇼핑몰과 푸드트럭 사업이 급증하고 있는 것으로 나타났다. 특히 20-30대 젊은 창업자들의 비중이 높아지고 있으며, 디지털 마케팅 활용도가 높은 업종일수록 성공률이 높은 것으로 조사되었다.",
    link: "#",
    date: "2025.03.20",
    source: "한국창업진흥원",
  },
  {
    id: "4",
    title: "소상공인 세금 감면 정책 시행",
    excerpt: "정부가 소상공인을 대상으로 한 세금 감면 정책을 시행한다. 매출 규모가 일정 수준 이하인 소상공인에게는 부가가치세와 소득세를 감면해주는 내용이다.",
    link: "#",
    date: "2025.03.15",
    source: "기획재정부",
  },
  {
    id: "5",
    title: "자영업자 디지털 전환 지원사업",
    excerpt: "중소벤처기업부가 자영업자의 디지털 전환을 지원하는 사업을 확대한다. 온라인 판매 플랫폼 구축, 디지털 마케팅 교육, 전자결제 시스템 도입 등을 지원한다.",
    link: "#",
    date: "2025.03.10",
    source: "중소벤처기업부",
  },
  {
    id: "6",
    title: "소상공인 창업 지원금 신청 안내",
    excerpt: "2025년 상반기 소상공인 창업 지원금 신청이 시작된다. 신규 창업자에게 최대 500만원의 창업 지원금을 제공하며, 온라인 신청이 가능하다.",
    link: "#",
    date: "2025.03.05",
    source: "중소벤처기업진흥공단",
  },
]

export default function NewsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % newsArticles.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + newsArticles.length) % newsArticles.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">정보망</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          취업동향 및 자영업자 관련 최신 정보를 확인하세요
        </p>
      </div>

      {/* 메인 슬라이더 */}
      <div className="mb-12">
        <div className="relative w-full">
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {newsArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="w-full flex-shrink-0 px-2"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Card
                    className={cn(
                      "h-full cursor-pointer transition-all duration-300 border-2",
                      hoveredIndex === index
                        ? "border-primary shadow-xl scale-[1.02] bg-primary/5"
                        : "border-primary/10 hover:border-primary/30"
                    )}
                    onClick={() => window.open(article.link, "_blank")}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {article.source}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{article.date}</span>
                          </div>
                          <h3
                            className={cn(
                              "font-bold mb-4 transition-all duration-300 break-words",
                              hoveredIndex === index ? "text-2xl text-primary" : "text-xl"
                            )}
                          >
                            {article.title}
                          </h3>
                          <p
                            className={cn(
                              "text-muted-foreground leading-relaxed transition-all duration-300 break-words",
                              hoveredIndex === index
                                ? "text-base line-clamp-5"
                                : "text-sm line-clamp-2"
                            )}
                          >
                            {article.excerpt}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex-shrink-0 transition-all duration-300",
                            hoveredIndex === index ? "opacity-100 scale-110" : "opacity-50"
                          )}
                        >
                          <ExternalLink className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      {hoveredIndex === index && (
                        <div className="mt-6 pt-6 border-t border-primary/20 animate-in fade-in duration-300">
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(article.link, "_blank")
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            전체 기사 보기
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* 이전/다음 버튼 */}
          {newsArticles.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg z-10 h-10 w-10"
                onClick={prevSlide}
                aria-label="이전 기사"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg z-10 h-10 w-10"
                onClick={nextSlide}
                aria-label="다음 기사"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* 인디케이터 */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {newsArticles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted hover:bg-primary/50"
              )}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>

      {/* 기사 목록 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">최신 기사</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles.map((article) => (
            <Card
              key={article.id}
              className="cursor-pointer hover:shadow-lg transition-all border-2 border-primary/10 hover:border-primary/30 h-full flex flex-col"
              onClick={() => window.open(article.link, "_blank")}
            >
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {article.source}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                </div>
                <h4 className="font-bold text-lg mb-3 line-clamp-2 flex-1">{article.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{article.excerpt}</p>
                <Button variant="ghost" size="sm" className="w-full mt-auto">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  기사 보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

