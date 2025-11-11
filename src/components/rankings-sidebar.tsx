"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { TrendingUp, MapPin, Trophy, ChevronRight, X } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface RankingItem {
  rank: number
  name: string
  location: string
  score: number
  change: number
}

export function RankingsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const rankings: RankingItem[] = [
    { rank: 1, name: "강남역 10번 출구", location: "서울 강남구", score: 95, change: 2 },
    { rank: 2, name: "홍대입구역 9번 출구", location: "서울 마포구", score: 92, change: -1 },
    { rank: 3, name: "판교역 테크노밸리", location: "경기 성남시", score: 89, change: 1 },
    { rank: 4, name: "건대입구역 6번 출구", location: "서울 광진구", score: 87, change: 0 },
    { rank: 5, name: "신촌역 2번 출구", location: "서울 서대문구", score: 85, change: 3 },
  ]

  if (isCollapsed) {
    return (
      <Button
        onClick={() => setIsCollapsed(false)}
        variant="outline"
        size="icon"
        className="fixed right-4 top-24 z-40 shadow-lg"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-background border-l overflow-y-auto z-40 hidden lg:block">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">인기 상권 랭킹</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {rankings.map((item) => (
            <Link key={item.rank} href={`/map?location=${encodeURIComponent(item.name)}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm flex-shrink-0",
                        item.rank === 1
                          ? "bg-yellow-500 text-white"
                          : item.rank === 2
                            ? "bg-gray-400 text-white"
                            : item.rank === 3
                              ? "bg-orange-600 text-white"
                              : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        {item.change !== 0 && (
                          <Badge
                            variant={item.change > 0 ? "default" : "secondary"}
                            className={cn("h-5 px-1.5 text-xs", item.change > 0 && "bg-green-500")}
                          >
                            {item.change > 0 ? "↑" : "↓"} {Math.abs(item.change)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="font-medium">{item.score}점</span>
                        </div>
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden ml-2 max-w-[80px]">
                          <div className="h-full bg-primary" style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">실시간 업데이트</p>
              <p className="text-xs text-muted-foreground">매시간 상권 데이터가 갱신됩니다</p>
            </CardContent>
          </Card>

          <Button className="w-full bg-transparent" variant="outline" asChild>
            <Link href="/map">전체 상권 보기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
