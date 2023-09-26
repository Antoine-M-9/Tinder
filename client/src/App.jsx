import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import OnBoarding from './pages/Onboarding'
import Home from './pages/Home'

const App = () => {

  return (
    <>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/onboarding" element={<OnBoarding />}></Route>
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
