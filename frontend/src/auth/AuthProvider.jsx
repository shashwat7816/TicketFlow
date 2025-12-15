import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function useAuth(){ return useContext(AuthContext) }

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  // create axios instance
  const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

  // request interceptor: attach access token
  api.interceptors.request.use(cfg => {
    if(accessToken) cfg.headers['Authorization'] = 'Bearer ' + accessToken
    cfg.withCredentials = true // send cookies for refresh
    return cfg
  })

  // response interceptor: on 401 try refresh once
  api.interceptors.response.use(r=>r, async err => {
    const original = err.config
    if(err.response && err.response.status === 401 && !original._retry){
      original._retry = true
      try{
        const resp = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/refresh', {}, { withCredentials: true })
        setAccessToken(resp.data.accessToken)
        original.headers['Authorization'] = 'Bearer ' + resp.data.accessToken
        return axios(original)
      }catch(e){
        setUser(null)
        setAccessToken(null)
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  })

  useEffect(()=>{
    // try to fetch /me if no user but there might be a cookie
    (async ()=>{
      try{
        const resp = await api.get('/api/auth/me')
        setUser(resp.data)
      }catch(e){ /* ignore */ }
    })()
  }, [])

  async function login(email, password){
    const resp = await api.post('/api/auth/login', { email, password })
    setAccessToken(resp.data.accessToken)
    setUser(resp.data.user)
    return resp.data
  }

  async function register(email, password, name){
    const resp = await api.post('/api/auth/register', { email, password, name })
    setAccessToken(resp.data.accessToken)
    setUser(resp.data.user)
    return resp.data
  }

  async function logout(){
    await api.post('/api/auth/logout')
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  )
}
