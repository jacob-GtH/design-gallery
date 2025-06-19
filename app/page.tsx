'use client'

import { Suspense, useEffect, useState } from 'react'
import SplashScreen from '../components/SplashScreen'
import HeroSection from '../components/HeroSection'
import CaseStudiesSection from '../components/CaseStudiesSection'
import ServicesSection from '../components/ServicesSection'
import ContactSection from '../components/ContactSection'
import DesignsSection from '../components/DesignsSection'
import { motion } from 'framer-motion'
import Footer from './footer/page'
import DesignForm from '../components/admin/DesignForm'

export default function Home() {
  const [splashDone, setSplashDone] = useState(false)
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)


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
    <main >
      <Suspense>
      {/* <Suspense fallback={<p className="text-white text-center">جارٍ تحميل الصفحة...</p>}> */}
        {/* {loading && <p className="text-center text-white">جاري تحميل التصاميم...</p>} */}
        {/* {error && <p className="text-center text-red-500">حدث خطأ أثناء تحميل التصاميم</p>} */}

          <HeroSection />

          <DesignsSection designs={designs} />
          <ServicesSection />
          <CaseStudiesSection />
          <ContactSection />
          <Footer />
        
      </Suspense>
    </main>
  )
}
