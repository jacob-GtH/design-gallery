'use client'

import { useEffect, useState } from 'react'
import SplashScreen from '../components/SplashScreen'
import HeroSection from '../components/HeroSection'
import CaseStudiesSection from '../components/CaseStudiesSection'
import ServicesSection from '../components/ServicesSection'
import ContactSection from '../components/ContactSection'
import DesignsSection from '../components/DesignsSection'
import { motion } from 'framer-motion'
import Footer from './footer/page'

export default function Home() {
  const [splashDone, setSplashDone] = useState(false)
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const heroBgColor = "#0f172a"


  useEffect(() => {
    if (splashDone) {
      const fetchData = async () => {
        try {
          const res = await fetch('/api/designs')
          if (!res.ok) throw new Error('فشل في الجلب')
          const data = await res.json()
          setDesigns(data)
        } catch (err) {
          setError(true)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [splashDone])

  if (!splashDone) {

    return (<SplashScreen onComplete={() => { setSplashDone(true) }}
    />
    )
  }

  return (
    <main>
      <HeroSection />
      <DesignsSection designs={designs} />
      <ServicesSection />
      <CaseStudiesSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
