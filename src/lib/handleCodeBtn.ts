// emailApi 로 설정했던 api를 이용하여 인증관련 버튼 클릭시 해당 api로 요청을 보내고 응답을 처리하는 함수


import { sendEmailCode, verifyEmailCode, sendEmailResetCode, verifyEmailResetCode } from "@/src/api/emailApi"
import { EmailVal, CodeVal } from "@/src/lib/validation"; // 유효성 검사에 대한 모든 함수를 가져옴

export const handleEmailBtn = ({ email, onSuccess }: { email:string, onSuccess:() => void }) => {
    const handleSendClick = async () => {
        if(!email) {
            alert('이메일을 입력하세요');
            return;
        }

        if(!EmailVal(email)) {
            alert('이메일 형식이 올바르지 않습니다');
            return;
        }

        try {
            await sendEmailCode(email);
            alert('이메일 전송에 성공했습니다. 3분내 입력해 주세요');
            onSuccess();
        } catch (error: any) {
            if(error.response?.data?.message === '이미 가입된 회원입니다.') {
                alert('이미 가입된 회원입니다.');
                return;
            } else {
                alert('이메일 전송에 실패했습니다.');
                return;
            }
        }
    }

    return handleSendClick;
}


export const handleVerifyBtn = ({ email, code, onSuccess }: { email:string, code:number, onSuccess:() => void}) => {
    const handleVerifyClick = async () => {
        if(!email) {
            alert('이메일을 입력하세요');
            return;
        }

        if(!CodeVal(code.toString())) {
            alert('코드 형식이 올바르지 않습니다');
            return;
        }

        try {

        } catch (error: any) {
            if(error.response?.data?.message === '인증 코드가 일치하지 않습니다.') {
                alert('인증 코드가 일치하지 않습니다.');
                return;
            } else {
                alert('인증 코드 확인에 실패했습니다.');
                return;
            }
        }
    }
    return handleVerifyClick;
}

export const handleSendResetBtn = ({ email, onSuccess }: { email:string, onSuccess:() => void }) => {
    const handleSendResetClick = async () => {

        if(!email) {
            alert('이메일을 입력하세요');
            return;
        }

        if(!EmailVal(email)) {
            alert('이메일 형식이 올바르지 않습니다');
            return;
        }

        try {
            await sendEmailResetCode(email);
            alert('이메일 전송에 성공했습니다. 3분내 입력해 주세요');
            onSuccess();
        } catch (error: any) {
            if(error.response?.data?.message === '이메일이 존재하지 않습니다.') {
                alert('이메일이 존재하지 않습니다.');
                return;
            } else {
                alert('이메일 전송에 실패했습니다.');
                return;
            }
        }
    }
    return handleSendResetClick;
}

export const handleVerifyResetBtn = ({ email, code, onSuccess }: { email:string, code:number, onSuccess:() => void }) => {
    const handleVerifyResetClick = async () => {
        if(!email) {
            alert('이메일을 입력하세요');
            return;
        }

        if(!CodeVal(code.toString())) {
            alert('코드 형식이 올바르지 않습니다');
            return;
        }

        try {
            await verifyEmailResetCode(email, code);
            alert('비밀번호 재설정에 성공했습니다.');
            onSuccess();
        } catch (error: any) {
            if(error.response?.data?.message === '인증 코드가 일치하지 않습니다.') {
                alert('인증 코드가 일치하지 않습니다.');
                return;
            } else {
                alert('인증 코드 확인에 실패했습니다.');
                return;
            }
        }
    }
    return handleVerifyResetClick;
}