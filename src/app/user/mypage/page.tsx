"use client"

import { useAuthStore } from "@/src/stores/authStore"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import {
  MapPin,
  Heart,
  Bell,
  Settings,
  LogOut,
  FileText,
  TrendingUp,
  Filter,
  Search,
  Trash2,
  Eye,
  MessageSquare,
  X,
  CheckCheck,
  User,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Save,
  Edit3,
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import Link from "next/link"
import { useToast } from "@/src/hooks/use-toast"
import API from "@/src/api/axiosApi"

type FilterType = "all" | "cafe" | "fashion" | "it" | "food"
type SortType = "recent" | "score" | "name"

export default function MyPagePage() {
  const { user, logout, isLoggedIn } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("recent")
  const { toast } = useToast()
  const isLoading = false // authStore는 즉시 로드되므로 로딩 상태 불필요

type MyPost = {
  id: number
  title: string
  category: string | null
  views: number
  likes: number
  comments: number
  createdAt: string
}

const [posts, setPosts] = useState<MyPost[]>([])
const [loadingPosts, setLoadingPosts] = useState(false)
const POSTS_PER_PAGE = 5
const [postPage, setPostPage] = useState(1)
const [postTotalPages, setPostTotalPages] = useState(1)
const [postTotalCount, setPostTotalCount] = useState(0)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.nickname || "",
    email: user?.email || "",
    phone: "010-1234-5678",
    business: "",
    bio: "간단히 소개글을 입력해주세요.",
  })
  
  // user가 변경되면 profileData 업데이트
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.nickname || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user])


  const fetchPosts = useCallback(async (targetPage: number) => {
    if (!user?.email) return
    
    try {
      setLoadingPosts(true)
      const response = await API.get(`/board/user/${user.email}`, {
        params: {
          page: targetPage,
          limit: POSTS_PER_PAGE,
        },
      })
      const { data = [], pagination } = response.data ?? {}
      const fetchedPosts: MyPost[] = data.map((post: any) => ({
        id: post.idx,
        title: post.title ?? "제목 없음",
        category: post.category ?? "카테고리 미지정",
        views: post.views ?? 0,
        likes: post.likes ?? 0,
        comments: post.comments_count ?? 0,
        createdAt: post.created_at
          ? new Date(post.created_at).toLocaleDateString("ko-KR")
          : "",
      }))
      setPosts(fetchedPosts)
      if (pagination) {
        setPostTotalPages(pagination.totalPages ?? 1)
        setPostTotalCount(pagination.totalCount ?? fetchedPosts.length)
      } else {
        setPostTotalPages(1)
        setPostTotalCount(fetchedPosts.length)
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoadingPosts(false);
    }
  }, [user?.email])

  useEffect(() => {
    if (!user?.email) return
    setPostPage(1)
  }, [user?.email])

  useEffect(() => {
    if (user?.email) {
      fetchPosts(postPage)
    }
  }, [user?.email, postPage, fetchPosts])

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const [favorites, setFavorites] = useState([
    {
      id: "1",
      name: "강남역 10번 출구",
      address: "서울특별시 강남구 강남대로 396",
      score: 85,
      addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "상승",
      change: "+5",
      category: "cafe" as const,
      categoryLabel: "카페/음식점",
    },
    {
      id: "2",
      name: "홍대입구역 9번 출구",
      address: "서울특별시 마포구 양화로 160",
      score: 92,
      addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: "상승",
      change: "+2",
      category: "fashion" as const,
      categoryLabel: "패션/의류",
    },
    {
      id: "3",
      name: "판교역 테크노밸리",
      address: "경기도 성남시 분당구 판교역로 192",
      score: 78,
      addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "하락",
      change: "-3",
      category: "it" as const,
      categoryLabel: "IT/서비스",
    },
    {
      id: "4",
      name: "이태원역 상권",
      address: "서울특별시 용산구 이태원로 146",
      score: 88,
      addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: "상승",
      change: "+7",
      category: "food" as const,
      categoryLabel: "음식점",
    },
  ])

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "favorite",
      message: '관심 지역 "강남역 10번 출구"의 유동인구가 15% 증가했습니다',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: "2",
      type: "comment",
      message: "작성하신 게시글 '강남역 근처 카페 창업 후기'에 새로운 댓글이 달렸습니다",
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: "3",
      type: "favorite",
      message: '관심 지역 "홍대입구역 9번 출구"의 평균 매출이 상승했습니다',
      time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isRead: false,
    },
    {
      id: "4",
      type: "system",
      message: "이달의 상권 분석 리포트가 업데이트되었습니다",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: "5",
      type: "favorite",
      message: '관심 지역 "판교역 테크노밸리"의 점수가 변경되었습니다',
      time: new Date(Date.now() - 48 * 60 * 60 * 1000),
      isRead: true,
    },
  ])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    return `${diffDays}일 전`
  }

  const handlePostPageChange = (nextPage: number) => {
    if (loadingPosts) return
    if (nextPage < 1 || nextPage > postTotalPages || nextPage === postPage) return
    setPostPage(nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getPostPageNumbers = () => {
    const pagesPerGroup = 5
    const pages: number[] = []
    const currentGroup = Math.ceil(postPage / pagesPerGroup)
    const startPage = (currentGroup - 1) * pagesPerGroup + 1
    const endPage = Math.min(currentGroup * pagesPerGroup, postTotalPages)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/user/login")
    }
  }, [isLoggedIn, user, router])

  const handleSaveProfile = () => {
    setIsEditingProfile(false)
    toast({
      title: "프로필 저장 완료",
      description: "프로필 정보가 성공적으로 업데이트되었습니다.",
    })
  }

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 비밀번호 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "비밀번호 길이 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    toast({
      title: "비밀번호 변경 완료",
      description: "비밀번호가 성공적으로 변경되었습니다.",
    })
  }

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm("정말 탈퇴하시겠습니까? 계정이 비활성화되면 다시 로그인할 수 없습니다.")
    if (!confirmed) return

    try {
      setIsWithdrawing(true)
      await API.post("/user/withdraw")
      toast({
        title: "계정 비활성화 완료",
        description: "다시 이용하려면 고객센터를 통해 문의해주세요.",
      })
      await logout()
      router.push("/")
    } catch (error: any) {
      console.error(error)
      toast({
        title: "계정 비활성화 실패",
        description: error.response?.data?.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (isLoading || !user) {
    return null
  }

  const removeFavorite = (id: string, name: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
    toast({
      title: "관심 지역 삭제 완료",
      description: `"${name}"을(를) 관심 지역에서 삭제했습니다.`,
    })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    toast({
      title: "알림 읽음 처리 완료",
      description: "모든 알림을 읽음으로 표시했습니다.",
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    toast({
      title: "알림 삭제",
      description: "알림을 삭제했습니다.",
    })
  }

  const filteredFavorites = favorites
    .filter((fav) => {
      const matchesSearch =
        fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.address.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === "all" || fav.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "recent") return b.addedAt.getTime() - a.addedAt.getTime()
      if (sortBy === "score") return b.score - a.score
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const stats = [
    // { label: "관심 지역", value: favorites.length, icon: Heart, color: "text-red-500" },
    { label: "작성 글", value: posts.length, icon: FileText, color: "text-blue-500" },
    // { label: "알림", value: unreadCount, icon: Bell, color: "text-primary" },
    // { label: "분석 횟수", value: 23, icon: TrendingUp, color: "text-secondary" },
  ]

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Profile Header */}
      <Card className="mb-8 shadow-lg border-2 border-primary/10">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-4xl font-bold">
                {user.nickname?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">{user.nickname || user.email}</h1>
                <Badge variant="secondary" className="text-sm px-3 py-1 shadow-sm">
                  {user.role === "admin" ? "관리자" : "일반회원"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-5 text-lg">{user.email}</p>
              <div className="flex gap-3">
                {/* <Button variant="outline" size="sm" className="shadow-sm bg-background hover:bg-muted" asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Link>
                </Button> */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    await logout();
                    router.push('/user/login');
                  }} 
                  className="shadow-sm bg-background hover:bg-muted"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 bg-muted/50 rounded-2xl", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-muted/50">
          <TabsTrigger
            value="profile"
            className="text-base data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer hover:bg-muted"
          >
            <User className="mr-2 h-4 w-4" />내 정보
          </TabsTrigger>
          {/* <TabsTrigger
            value="favorites"
            className="text-base data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer hover:bg-muted"
          >
            <Heart className="mr-2 h-4 w-4" />
            관심 지역
          </TabsTrigger> */}
          <TabsTrigger
            value="posts"
            className="text-base data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer hover:bg-muted"
          >
            <FileText className="mr-2 h-4 w-4" />내 게시글
          </TabsTrigger>
          {/* <TabsTrigger
            value="notifications"
            className="text-base data-[state=active]:bg-background data-[state=active]:shadow-sm relative cursor-pointer hover:bg-muted"
          >
            <Bell className="mr-2 h-4 w-4" />
            알림
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-2 text-xs animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">내 정보 관리</h2>
            <p className="text-muted-foreground">프로필 정보와 비밀번호를 관리하세요</p>
          </div>

          {/* Profile Information Card */}
          <Card className="border-2 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  프로필 정보
                </h3>
                {!isEditingProfile ? (
                  <Button size="sm" onClick={() => setIsEditingProfile(true)} className="shadow-md">
                    <Edit3 className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} className="shadow-md">
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      닉네임
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditingProfile}
                      className={cn(
                        "h-11 transition-all",
                        isEditingProfile && "border-primary/50 bg-background",
                        !isEditingProfile && "bg-muted/50",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      이메일
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      readOnly
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditingProfile}
                      className={cn(
                        "h-11 transition-all cursor-not-allowed bg-muted/50",
                        isEditingProfile && "border-primary/50 bg-background",
                        !isEditingProfile && "bg-muted/50",
                      )}
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      연락처
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditingProfile}
                      className={cn(
                        "h-11 transition-all",
                        isEditingProfile && "border-primary/50 bg-background",
                        !isEditingProfile && "bg-muted/50",
                      )}
                    />
                  </div> */}

                  {/* <div className="space-y-2">
                    <Label htmlFor="business" className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      업종
                    </Label>
                    <Input
                      id="business"
                      value={profileData.business}
                      onChange={(e) => setProfileData({ ...profileData, business: e.target.value })}
                      disabled={!isEditingProfile}
                      className={cn(
                        "h-11 transition-all",
                        isEditingProfile && "border-primary/50 bg-background",
                        !isEditingProfile && "bg-muted/50",
                      )}
                    />
                  </div> */}
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    소개
                  </Label>
                  <Input
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditingProfile}
                    className={cn(
                      "h-11 transition-all",
                      isEditingProfile && "border-primary/50 bg-background",
                      !isEditingProfile && "bg-muted/50",
                    )}
                  />
                </div> */}
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card className="border-2 border-primary/10 w-full">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                비밀번호 변경
              </h3>

              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">
                    현재 비밀번호
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    새 비밀번호
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    새 비밀번호 확인
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    className="h-11"
                  />
                </div>

                <Button onClick={handleChangePassword} className="w-full md:w-auto shadow-md">
                  <Lock className="h-4 w-4 mr-2" />
                  비밀번호 변경
                </Button>
              </div>
  
            </CardContent>
          </Card>   
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">관심 지역 관리</h2>
              <p className="text-muted-foreground">등록한 지역의 상권 변화를 실시간으로 확인하세요</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="지역명 또는 주소로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as FilterType)}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  <SelectItem value="cafe">카페/음식점</SelectItem>
                  <SelectItem value="fashion">패션/의류</SelectItem>
                  <SelectItem value="it">IT/서비스</SelectItem>
                  <SelectItem value="food">음식점</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최근 등록순</SelectItem>
                  <SelectItem value="score">점수 높은순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>총 {filteredFavorites.length}개의 관심 지역</span>
              {(searchQuery || filterCategory !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterCategory("all")
                  }}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  필터 초기화
                </Button>
              )}
            </div>
          </div>

          {filteredFavorites.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">관심 지역이 없습니다</p>
                <p className="text-sm text-muted-foreground mb-4">
                  지도에서 원하는 지역을 검색하고 하트 버튼을 눌러 관심 지역으로 등록해보세요
                </p>
                <Button asChild>
                  <Link href="/map">지도에서 찾기</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredFavorites.map((favorite) => (
              <Card
                key={favorite.id}
                className="hover:shadow-xl transition-all border-2 border-primary/10 hover:border-primary/30"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl mb-1">{favorite.name}</h3>
                          <p className="text-sm text-muted-foreground break-words">{favorite.address}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="secondary" className="shadow-sm">
                          {favorite.categoryLabel}
                        </Badge>
                        <Badge
                          variant={favorite.status === "상승" ? "default" : "destructive"}
                          className="flex items-center gap-1 shadow-sm"
                        >
                          <TrendingUp className="h-3 w-3" />
                          {favorite.status} {favorite.change}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(favorite.addedAt)} 등록</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">상권 점수</p>
                          <p className="text-3xl font-bold text-primary">{favorite.score}점</p>
                        </div>
                        <div className="h-3 flex-1 bg-muted rounded-full overflow-hidden max-w-md">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${favorite.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="whitespace-nowrap shadow-md" asChild>
                        <Link href={`/map?location=${encodeURIComponent(favorite.name)}`}>지도보기</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap bg-background hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeFavorite(favorite.id, favorite.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">내가 작성한 게시글</h2>
              <p className="text-muted-foreground">커뮤니티에 작성한 게시글을 관리하세요</p>
            </div>
            <Button asChild className="shadow-md">
              <Link href="/board/write">글쓰기</Link>
            </Button>
          </div>
          {loadingPosts ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                내 게시글을 불러오는 중입니다...
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">작성한 게시글이 없습니다</p>
                <p className="text-sm text-muted-foreground mb-4">커뮤니티에서 첫 게시글을 작성해보세요.</p>
                <Button asChild>
                  <Link href="/board/write">글쓰기</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 border-primary/10 hover:border-primary/30"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary" className="text-sm px-3 py-1 shadow-sm">
                            {post.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{post.createdAt}</span>
                        </div>
                        <h3 className="font-bold text-xl mb-4 hover:text-primary transition-colors">{post.title}</h3>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" /> {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> {post.comments}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="shadow-sm bg-background" asChild>
                          <Link href={`/board/${post.id}`}>보기</Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="shadow-sm bg-background"
                          onClick={() => router.push(`/board/edit/${post.id}`)}
                          >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shadow-sm bg-background hover:bg-destructive hover:text-destructive-foreground"
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {postTotalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                  {/* <p className="text-sm text-muted-foreground">
                    총 {postTotalCount.toLocaleString()}개 게시글 · {postPage}/{postTotalPages} 페이지
                  </p> */}
                  <div className="w-full flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePostPageChange(postPage - 1)}
                      disabled={postPage === 1 || loadingPosts}
                      className="min-w-[70px]"
                    >
                      이전
                    </Button>
                    {getPostPageNumbers().map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === postPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePostPageChange(pageNumber)}
                        disabled={loadingPosts}
                      >
                        {pageNumber}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePostPageChange(postPage + 1)}
                      disabled={postPage === postTotalPages || loadingPosts}
                      className="min-w-[70px]"
                    >
                      다음
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">알림</h2>
              <p className="text-muted-foreground">관심 지역 변화와 커뮤니티 활동을 확인하세요</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="shadow-sm bg-transparent"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                모두 읽음
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">알림이 없습니다</p>
                <p className="text-sm text-muted-foreground">새로운 활동이 있으면 여기에 알림이 표시됩니다</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "hover:shadow-lg transition-all border-2 group",
                  !notification.isRead && "border-primary/50 bg-primary/5",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-2xl flex-shrink-0 shadow-sm",
                        notification.type === "favorite" && "bg-red-100 text-red-600",
                        notification.type === "comment" && "bg-blue-100 text-blue-600",
                        notification.type === "system" && "bg-primary/20 text-primary",
                      )}
                    >
                      {notification.type === "favorite" ? (
                        <Heart className="h-6 w-6" />
                      ) : notification.type === "comment" ? (
                        <MessageSquare className="h-6 w-6" />
                      ) : (
                        <Bell className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("leading-relaxed text-base", !notification.isRead && "font-semibold")}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{formatTimeAgo(notification.time)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <>
                          <Badge variant="default" className="flex-shrink-0 animate-pulse">
                            NEW
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="읽음으로 표시"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        title="삭제"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
