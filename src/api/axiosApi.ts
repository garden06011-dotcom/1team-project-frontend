// 기본적으로 axios를 사용하여 API 호출을 관리하는 파일 json 형식으로 Content-Type 설정을 매번 요청을 방지하고 여기서 세팅을 하여 모든 요청에 적용을 하도록 하기 위함
import axios from "axios"

const baseURL =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8000"

if (process.env.NODE_ENV !== "production") {
  console.log("API baseURL:", baseURL)
}

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
})


// 요청 인터셉터: accessToken 헤더 주입
// API.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("accessToken")
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`
//         }
//         console.log('API request:', config)
//         return config;

//     },
//     (error) => Promise.reject(error)
// );


// 응답 인터셉터: 401 처리
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        if(error.response?.status === 401) {
            console.log('401 Unauthorized error, attempting to refresh token...')
        }
        return Promise.reject(error)
    }
);  


export default API;