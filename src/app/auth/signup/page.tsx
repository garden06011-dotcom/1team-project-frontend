"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/src/lib/auth-context"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Building2, Mail, Lock, User } from "lucide-react";
import { EmailVal, CodeVal, PasswordVal, NameVal, NicknameVal } from "@/src/lib/validation";
import { handleEmailBtn, handleVerifyBtn } from "@/src/lib/handleCodeBtn";

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [emailReadOnly, setEmailReadOnly] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [code, setCode] = useState("");
  const [showTimer, setShowTimer] = useState(false);


  const { signup } = useAuth()
  const router = useRouter();

  const [emailErr, setEmailErr] = useState("")
  const [codeErr, setCodeErr] = useState("")
  const [passwordErr, setPasswordErr] = useState("")
  const [confirmPasswordErr, setConfirmPasswordErr] = useState("")
  const [nameErr, setNameErr] = useState("")
  const [nicknameErr, setNicknameErr] = useState("")
  const [termsErr, setTermsErr] = useState("")

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);


  // email 전송 이벤트
  const handleSendSuccess = () => {
    setShowCodeBox(true);
    setShowTimer(true);
    setShowTimer(true);
    setEmailReadOnly(true);
  }

  const handleSendClick = handleEmailBtn({ email, onSuccess: handleSendSuccess });
  
  // 인증번호 확인 이벤트
  const handleVerifySuccess = () => {
    setShowCodeBox(false);
    setShowTimer(false);
    setShowTimer(false);
    setEmailReadOnly(false);
  }

  const handleTimeout = () => {
    alert('시간이 만료되었습니다.')
    setIsCounting(false);
    setShowTimer(false);
  }

  const handleVerifyClick = handleVerifyBtn({ email, code: Number(code), onSuccess: handleVerifySuccess });




  // 이메일 인증
  const handleEmail = (e: React.FormEvent) => {
    const emailValue = (e.target as HTMLInputElement).value
    setEmail(emailValue)
    if(!emailValue) {
      setEmailErr("")
      return;
    }
    if(!EmailVal(emailValue)) {
      setEmailErr("이메일 형식이 올바르지 않습니다.")
      return;
    } else {
      setEmailErr("")
      return;
    }
  }


  // 인증번호 인증
  const handleCode = (e: React.FormEvent) => {
    const codeValue = (e.target as HTMLInputElement).value
    setCode(codeValue)
    if(!codeValue) {
      setCodeErr("")
      return;
    }
    if(!CodeVal(codeValue)) {
      setCodeErr("인증번호는 6자리 숫자여야 합니다.")
      return;
    } else {
      setCodeErr("")
      return;
    }
  }

  // 비밀번호 인증
  const handlePassword = (e: React.FormEvent) => {
    const passwordValue = (e.target as HTMLInputElement).value
    setPassword(passwordValue)
    if(!passwordValue) {
      setPasswordErr("")
      return;
    }
    if(!PasswordVal(passwordValue)) {
      setPasswordErr("비밀번호는 8자 이상 및 특수문자를 포함해야 합니다.")
      return;
    } else {
      setPasswordErr("")
      return;
    }
  }

  // 비밀번호 확인 인증
  const handleConfirmPassword = (e: React.FormEvent) => {
    const confirmPasswordValue = (e.target as HTMLInputElement).value
    setConfirmPassword(confirmPasswordValue)
    if(!confirmPasswordValue) {
      setConfirmPasswordErr("")
      return;
    }
    if(confirmPasswordValue !== password) {
      setConfirmPasswordErr("비밀번호가 일치하지 않습니다.")
      return;
    } else {
      setConfirmPasswordErr("")
      return;
    }
  }

  // 이름 인증
  const handleName = (e: React.FormEvent) => {
    const nameValue = (e.target as HTMLInputElement).value
    setName(nameValue)
    if(!nameValue) {
      setNameErr("")
      return;
    }
    if(!NameVal(nameValue)) {
      setNameErr("이름은 2자 이상 5자 이하여야 합니다.")
      return;
    } else {
      setNameErr("")
      return;
    }
  }

  // 닉네임 인증
  const handleNickname = (e: React.FormEvent) => {
    const nicknameValue = (e.target as HTMLInputElement).value
    setNickname(nicknameValue)
    if(!nicknameValue) {
      setNicknameErr("")
      return;
    }
    if(!NicknameVal(nicknameValue)) {
      setNicknameErr("닉네임은 2자 이상이어야 합니다.")
      return;
    } else {
      setNicknameErr("")
      return;
    }
  }




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (!agreedToTerms) {
      setError("이용약관에 동의해주세요.")
      return
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)

    try {
      await signup(email, password, name)
      router.push("/")
    } catch (err) {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription className="text-balance">상부상조와 함께 성공적인 창업을 시작하세요</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  ref={nameRef}
                  
                  placeholder="홍길동"
                  value={name}
                  onChange={handleName}
                  className="pl-10"
                  required
                />
              </div>
              <div className="text-xs text-red-500">{nameErr}</div>
            </div>
            <div style={{ display: emailReadOnly ? "none" : "block" }} className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  readOnly={emailReadOnly}
                  type="email"
                  ref={emailRef}
                  placeholder="example@email.com"
                  value={email}
                  onChange={handleEmail}
                  className={`pl-10 ${emailReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  required
                />
              </div>
            </div>
            <Button type="button" className="w-full cursor-pointer hover:text-white transition-all duration-300" onClick={handleSendClick}>
              {emailReadOnly ? "인증번호 재전송" : "인증번호 전송"}
            </Button>
                <div className="space-y-2">
                <Label htmlFor="email-code">인증번호</Label>
                  <div className="relative flex items-center gap-2 justify-between">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-code"
                      type="code"
                      ref={codeRef}
                      value={code}
                      onChange={handleCode}
                      className="pl-10 w-50"
                      placeholder="******"
                    />
                    
                    <Button 
                    type="button"
                    className="w-50 space-y-2 cursor-pointer hover:text-white transition-all duration-300"
                    onClick={handleVerifyClick}
                    // disabled={isLoading}
                    >
                      인증번호 확인
                    </Button>
                    <div className="text-xs text-red-500">{codeErr}</div>
                  </div>
                </div>
            

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8자리 이상 입력"
                  value={password}
                  ref={passwordRef}
                  onChange={handlePassword}
                  className="pl-10"
                  required
                />
              </div>
              <div className="text-xs text-red-500">{passwordErr}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="비밀번호 재입력"
                  value={confirmPassword}
                  ref={confirmPasswordRef}
                  onChange={handleConfirmPassword}
                  className="pl-10"
                  required
                />
              </div>
              <div className="text-xs text-red-500">{confirmPasswordErr}</div>
            </div>

            {/* 닉네임 인증 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nickname"
                  type="nickname"
                  placeholder="닉네임을 입력하세요"
                  value={nickname}
                  ref={nicknameRef}
                  onChange={handleNickname}
                  className="pl-10"
                  required
                />
              </div>
              <div className="text-xs text-red-500">{nicknameErr}</div>
            </div>

            <div className="flex items-center space-x-2 mb-4 flex justify-center items-center">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <Link href="/auth/agreement" className="text-primary hover:underline">
                  이용약관
                </Link>{" "}
                및{" "}
                <Link href="/auth/agreement" className="text-primary hover:underline">
                  개인정보처리방침
                </Link>
                에 동의합니다
              </label>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "가입 중..." : "가입하기"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                로그인
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
