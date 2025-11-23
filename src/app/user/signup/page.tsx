"use client"

import type React from "react"

import { useState, useEffect, useRef, ChangeEvent, useMemo } from "react"
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
import API from "@/src/api/axiosApi"

import AgreementPageModal from "../agreementModal/page"

export default function SignupPage() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [nickname, setNickname] = useState<string>("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const [birth, setBirth] = useState("")  // YYYYMMDD
  const [genderDigit, setGenderDigit] = useState(""); // "1" | "2" | "3" | "4"



  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false); // ✅ 모달 열림 여부
  
  const [terms, setTerms] = useState(false)

  const genderInputRef = useRef<HTMLInputElement>(null);

  const [showCodeBox, setShowCodeBox] = useState(false);
  const [emailReadOnly, setEmailReadOnly] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const [code, setCode] = useState("")
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
  const [birthErr, setBirthErr] = useState("");
  const [genderErr, setGenderErr] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const birthRef = useRef<HTMLInputElement>(null);
  const genderDigitRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);


  // email 전송 이벤트
  const handleSendSuccess = () => {
    setShowCodeBox(true);
    setShowTimer(true);
    setShowTimer(true);
    setEmailReadOnly(false);
  }

  const handleSendClick = handleEmailBtn({ 
    email, onSuccess: handleSendSuccess 
  });
  
  // 인증번호 확인 이벤트
  const handleVerifySuccess = () => {
    setShowCodeBox(false);
    setShowTimer(false);
    setShowTimer(false);
    setEmailReadOnly(true);
  }

  const handleTimeout = () => {
    alert('시간이 만료되었습니다.')
    setIsCounting(false);
    setShowTimer(false);
  }

  const handleVerifyClick = handleVerifyBtn({ 
    email: email, 
    code: Number(code), 
    onSuccess: handleVerifySuccess 
  });




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
    
    // 스페이스바만 있는 경우는 에러 메시지 표시 안 함
    const trimmedValue = codeValue.trim()
    if(trimmedValue === "") {
      setCodeErr("")
      return;
    }
    
    // 숫자가 아닌 문자가 포함되어 있는지 확인 (스페이스바 제외)
    const hasNonNumericNonSpace = /[^0-9\s]/.test(codeValue)
    if(hasNonNumericNonSpace) {
      setCodeErr("인증번호는 6자리 숫자여야 합니다.")
      return;
    }
    
    // 숫자만 추출해서 검증
    const numericOnly = codeValue.replace(/\s/g, '')
    if(!CodeVal(numericOnly)) {
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


// [추가] util 함수들
const onlyDigits = (s: string) => s.replace(/\D/g, "");

const clampBirth = (s: string) => onlyDigits(s).slice(0, 8); // YYYYMMDD 최대 8자리

const isValidYyyymmdd = (yyyymmdd: string) => {
  if (yyyymmdd.length !== 8) return false;
  const y = parseInt(yyyymmdd.slice(0, 4), 10);
  const m = parseInt(yyyymmdd.slice(4, 6), 10);
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  const daysInMonth = new Date(y, m, 0).getDate(); // 해당 월의 마지막 날
  return d >= 1 && d <= daysInMonth;
};

const allowedGenderDigits = (yyyymmdd: string): ("1"|"2"|"3"|"4")[] => {
  if (yyyymmdd.length < 8 || !isValidYyyymmdd(yyyymmdd)) return ["1","2","3","4"];
  return yyyymmdd >= "20000101" ? ["3","4"] : ["1","2"];
};

const genderFromDigit = (digit: "1"|"2"|"3"|"4") => (digit === "1" || digit === "3" ? "M" : "F");



// 생년월일 인증
// [추가] 생년월일 변경
const handleBirthChange = (e: ChangeEvent<HTMLInputElement>) => {
  const next = clampBirth(e.target.value);
  setBirth(next);

  // 유효성
  if (next.length === 0) {
    setBirthErr("생년월일을 입력하세요.");
  } else if (next.length < 8) {
    setBirthErr("8자리로 입력하세요. 예: 19991231");
  } else if (!isValidYyyymmdd(next)) {
    setBirthErr("유효한 날짜가 아닙니다.");
  } else {
    setBirthErr("");
  }

  // 생년월일 바뀌면 성별코드 가능 범위도 바뀜 → 현재 값이 허용 범위 밖이면 비우기
  const allow = allowedGenderDigits(next);
  if (genderDigit && !allow.includes(genderDigit as any)) {
    setGenderDigit("");
  }
};

// [추가] 성별 한 자리 변경 (숫자만, 길이 1, 허용 범위 체크)
const handleGenderDigitChange = (e: ChangeEvent<HTMLInputElement>) => {
  const inputValue = e.target.value;
  const digit = onlyDigits(inputValue).slice(0, 1);
  const allow = allowedGenderDigits(birth) as string[];
  
  // 빈 값이면 그대로 설정
  if (!digit) {
    setGenderDigit("");
    setGenderErr("");
    return;
  }
  
  // 허용 범위 체크
  if (!allow.includes(digit)) {
    setGenderErr(
      birth && isValidYyyymmdd(birth)
        ? birth >= "20000101"
          ? "2000년생 이후는 3(남) 또는 4(여)만 가능합니다."
          : "1999년생 이전은 1(남) 또는 2(여)만 가능합니다."
        : "생년월일을 올바르게 입력하세요."
    );
    // 허용되지 않아도 입력은 유지 (사용자가 볼 수 있도록)
    setGenderDigit(digit);
    return;
  }
  
  // 허용된 값이면 설정하고 에러 제거
  setGenderDigit(digit);
  setGenderErr("");
};

// [참고] 전송/저장 시 가공 예시
const payloadPreview = useMemo(() => {
  if (birth.length === 8 && isValidYyyymmdd(birth) && ["1","2","3","4"].includes(genderDigit)) {
    const yyyy = birth.slice(0,4);
    const mm   = birth.slice(4,6);
    const dd   = birth.slice(6,8);
    const gender = genderFromDigit(genderDigit as "1"|"2"|"3"|"4"); // "M" | "F"
    return {
      birthISO: `${yyyy}-${mm}-${dd}`, // "1999-12-31"
      genderDigit,                     // "1"|"2"|"3"|"4"
      gender,                          // "M"|"F"
    };
  }
  return null;
}, [birth, genderDigit]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if(!email) {
      alert("이메일을 입력하세요.")
      emailRef.current?.focus();
      return;
    }

    if(!password) {
      alert('비밀번호를 입력하세요')
      passwordRef.current?.focus();
      return;
    }

    if(!confirmPassword) {
      alert('비밀번호 확인을 입력하세요')
      confirmPasswordRef.current?.focus();
      return;
    }

    if(password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.')
      passwordRef.current?.focus();
      confirmPasswordRef.current?.focus();
      return;
    }

    if(!name) {
      alert('이름을 입력하세요');
      nameRef.current?.focus();
      return;
    }

    if(!nickname) {
      alert('닉네임을 입력하세요');
      nicknameRef.current?.focus();
      return;
    }

    if(!birth) {
      alert('생년월일을 입력하세요');
      birthRef.current?.focus();
      return;
    }

    if(!genderDigit) {
      alert('성별을 입력하세요');
      genderDigitRef.current?.focus();
      return;
    }

    if(!agreedToTerms) {
      alert('이용약관에 동의하세요');
      setIsAgreementModalOpen(true); // 바로 모달 띄워주기
      return;
    }

    
    setIsLoading(true)

    try {
  
      await API.post("/user/signup", { email, password, name, nickname, birth, genderDigit })
      alert('회원가입 완료 로그인 화면으로 전환합니다')
      router.push("/user/login")
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
            <Button type="button" 
              className="w-full cursor-pointer hover:text-white transition-all duration-300" 
              onClick={handleSendClick}>
              {emailReadOnly ? "인증번호 재전송" : "인증번호 전송"}
            </Button>


            {
              showCodeBox && (
                  <div className="space-y-2">
                    <Label htmlFor="email-code">인증번호</Label>
                      <div className="relative flex items-center gap-1 justify-between">
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
                        
                      </div>
                      <div className="text-xs text-red-500">{codeErr}</div>
                  </div>
              )
            }
                
            

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


          {/* ✅ 주민등록번호 (생년월일 + 성별을 한 그룹으로) */}
          <div className="space-y-2">
            <Label htmlFor="birth">주민등록번호</Label>

            {/* 위 줄: 입력 영역 한 줄 */}
            <div className="flex items-center gap-1">
              {/* 생년월일 */}
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="birth"
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 20010415"
                  value={birth}
                  onChange={handleBirthChange}
                  maxLength={8}
                  className="pl-10"
                  required
                />
              </div>

              <div className="text-lg px-1">-</div>

              {/* 성별 한 자리 + ****** */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative w-10">
                  <Input
                    id="genderDigit"
                    ref={genderInputRef}
                    type="text"
                    inputMode="numeric"
                    value={genderDigit}
                    onChange={handleGenderDigitChange}
                    maxLength={1}
                    className="text-center"
                    required
                  />
                </div>
                <div className="text-lg">******</div>
              </div>
            </div>

            {/* 아래 줄: 에러 메시지 (둘 다 같이) */}
            <div className="flex justify-between text-xs text-red-500 min-h-[1rem]">
              <span>{birthErr}</span>
              <span>{genderErr}</span>
            </div>
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
                onClick={() => setIsAgreementModalOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsAgreementModalOpen(true)}
                className="text-sm leading-none text-left text-primary hover:underline cursor-pointer"
              >
                이용약관 및 개인정보처리방침에 동의합니다
              </button>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full cursor-pointer hover:text-white" 
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "가입 중..." : "가입하기"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/user/login" className="text-primary font-medium hover:underline">
                로그인
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      {/* ✅ AgreementModal 연결 */}
      <AgreementPageModal
        isOpen={isAgreementModalOpen}  // ✅ 모달 열림 여부
        onClose={() => setIsAgreementModalOpen(false)}  // ✅ 모달 닫기
        onConfirm={() => setAgreedToTerms(true)}  // ✅ 약관 동의 확인
      />
    </div>
  )
}
