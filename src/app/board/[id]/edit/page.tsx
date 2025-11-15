import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { X } from 'lucide-react'
import API from '@/src/api/axiosApi'
import { useAuth } from '@/src/lib/auth-context'
import { mockPosts } from '@/src/lib/community-data'


export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    


    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const categoryRef = useRef<HTMLSelectElement>(null);

    const post = mockPosts.find((p) => p.id === id);
    if(!post) {
        return (
            <div className="container mx-auto p-4 max-w-4xl text-center py-12">
                <p className="text-muted-foreground">게시글을 찾을 수 없습니다</p>
                <Button className="mt-4" onClick={() => router.push("/board")}>
                    목록으로 돌아가기
                </Button>
            </div>
        )
    }

    const handleAddTag = () => {
        if(tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
        }
    }
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            EditPostPage
        </div>
    )
}