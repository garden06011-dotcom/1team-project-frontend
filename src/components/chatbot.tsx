"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! 상부상조 AI 상담사입니다. 무엇을 도와드릴까요?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("상권") || lowerInput.includes("분석")) {
      return "상권 분석은 지도 페이지에서 원하는 위치를 클릭하시면 자세한 정보를 확인하실 수 있습니다. 유동인구, 매출 데이터, 주변 시설 정보를 제공해드립니다."
    } else if (lowerInput.includes("강남") || lowerInput.includes("홍대") || lowerInput.includes("판교")) {
      return `해당 지역은 높은 유동인구와 우수한 접근성을 가진 상권입니다. 지도 페이지에서 더 자세한 분석 결과를 확인해보세요!`
    } else if (lowerInput.includes("창업") || lowerInput.includes("시작")) {
      return "창업을 준비 중이시군요! 커뮤니티 페이지에서 다른 창업자분들의 경험담을 참고하시면 도움이 될 것입니다. 필요하신 정보가 있다면 언제든지 질문해주세요."
    } else if (lowerInput.includes("관심") || lowerInput.includes("저장")) {
      return "관심 지역은 마이페이지에서 관리하실 수 있습니다. 지도에서 하트 아이콘을 클릭하면 관심 지역으로 등록되며, 해당 지역의 변화를 실시간으로 알려드립니다."
    } else {
      return "더 자세한 내용은 고객센터(1234-5678)로 문의해주시거나, 커뮤니티에 질문을 남겨주세요. 다른 도움이 필요하신가요?"
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">AI 상담사</CardTitle>
                <p className="text-xs text-muted-foreground">온라인</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <CardContent className="pt-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="메시지를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
