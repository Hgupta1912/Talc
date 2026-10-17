import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import { Toaster } from './components/ui'
import ArtworkDetail from './pages/ArtworkDetail'
import Discover from './pages/Discover'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Upload from './pages/Upload'
import { useApp } from './store/useApp'

function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (<><Navbar /><main><Outlet /></main></>)
}

function RequireLogin({ children }: { children: ReactNode }) {
	const { currentUser, authLoading } = useApp()
	if (!currentUser) return authLoading ? null : <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login mode="login" />} />
        <Route path="/signup" element={<Login mode="signup" />} />
        <Route element={<Layout />}>
          <Route index element={<Discover />} />
          <Route path="art/:id" element={<ArtworkDetail />} />
          <Route path="upload" element={<RequireLogin><Upload /></RequireLogin>} />
          <Route path="profile" element={<Profile />} />
          <Route path="u/:username" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}