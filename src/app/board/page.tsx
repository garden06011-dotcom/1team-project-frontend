"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { PostCard } from "@/src/components/post-card"
import { mockPosts } from "@/src/lib/community-data"
import { PenSquare, Search, TrendingUp, Clock, Heart } from "lucide-react"

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["전체", "창업후기", "정보공유", "질문", "노하우", "자유"]

  const filteredPosts = mockPosts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || selectedCategory === "전체" || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "latest") return b.createdAt.getTime() - a.createdAt.getTime()
      if (sortBy === "popular") return b.views - a.views
      if (sortBy === "likes") return b.likes - a.likes
      return 0
    })

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
          <p className="text-muted-foreground">창업 정보와 경험을 공유하는 공간입니다</p>
        </div>
        <Button size="lg" asChild>
          <Link href="/community/write">
            <PenSquare className="mr-2 h-5 w-5" />
            글쓰기
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                최신순
              </div>
            </SelectItem>
            <SelectItem value="popular">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                인기순
              </div>
            </SelectItem>
            <SelectItem value="likes">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                좋아요순
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category === "전체" ? "all" : category} className="flex-shrink-0">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Posts Grid */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPosts.length > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm">
            이전
          </Button>
          <Button variant="default" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
