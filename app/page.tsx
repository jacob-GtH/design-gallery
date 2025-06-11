'use client'

import { useEffect, useState } from 'react'
import SplashScreen from '@/components/SplashScreen'
import HeroSection from '@/components/HeroSection'
import DesignCard from '@/components/designs/DesignCard'
import CaseStudiesSection from '@/components/CaseStudiesSection'
import ServicesSection from '@/components/ServicesSection'
import ContactSection from '@/components/ContactSection'
import DesignsSection from '@/components/DesignsSection'
import { motion } from 'framer-motion'

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
          console.log('✅ data from API:', data)
        } catch (err) {
          setError(true)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [splashDone])

  if (!splashDone) return <SplashScreen onComplete={() => setSplashDone(false)} />
  // if (loading) return <div><RevealTransition color="bg-gray-900" onComplete={() => console.log('Reveal transition completed')} />
  // </div>

  return (
    <main>
      <HeroSection />
      <CaseStudiesSection />
      <ServicesSection />
      <ContactSection />

      <DesignsSection designs={designs} />

      <section className="bg-black text-white py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6">منصة تجمع الإبداع العربي</h2>
          <p className="text-gray-300 text-lg">
            نقدم لك فرصة لاكتشاف، عرض، وتواصل مع أفضل المصممين في الوطن العربي، عبر تجربة مرئية مميزة.
          </p>
        </motion.div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
        © {new Date().getFullYear()} Design Gallery. جميع الحقوق محفوظة.
      </footer>
    </main>
  )
}
