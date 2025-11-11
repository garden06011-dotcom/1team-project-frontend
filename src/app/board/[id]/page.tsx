"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Textarea } from "@/src/components/ui/textarea"
import { Separator } from "@/src/components/ui/separator"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { mockPosts, mockComments } from "@/src/lib/community-data"
import { Heart, MessageSquare, Eye, Clock, ArrowLeft, Share2, Flag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [commentText, setCommentText] = useState("")

  const post = mockPosts.find((p) => p.id === id)
  const postComments = mockComments.filter((c) => c.postId === id)

  if (!post) {
    return (
      <div className="container mx-auto p-4 max-w-4xl text-center py-12">
        <p className="text-muted-foreground">게시글을 찾을 수 없습니다</p>
        <Button className="mt-4" onClick={() => router.push("/community")}>
          커뮤니티로 돌아가기
        </Button>
      </div>
    )
  }

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      console.log("[v0] Comment submitted:", commentText)
      setCommentText("")
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로
      </Button>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary">{post.category}</Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {post.comments}
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">{post.author[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant={isLiked ? "default" : "outline"} className="flex-1" onClick={() => setIsLiked(!isLiked)}>
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              좋아요 {post.likes + (isLiked ? 1 : 0)}
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <MessageSquare className="mr-2 h-4 w-4" />
              댓글 {postComments.length}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold">댓글 {postComments.length}</h2>

        {/* Write Comment */}
        <Card>
          <CardContent className="pt-6">
            <Textarea
              placeholder="댓글을 입력하세요"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="mb-3"
            />
            <div className="flex justify-end">
              <Button onClick={handleCommentSubmit} disabled={!commentText.trim()}>
                댓글 작성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        {postComments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback className="bg-secondary">{comment.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{comment.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {comment.likes}
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
