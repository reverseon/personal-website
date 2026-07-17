import { useState, useEffect } from 'react'
import { ArrowUpOutlined } from '@ant-design/icons'
import './FloatingBackToTop.css'

export function FloatingBackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="floating-back-to-top"
      aria-label="Back to top"
    >
      <ArrowUpOutlined />
    </button>
  )
}
