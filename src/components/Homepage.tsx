import { useEffect, useRef, useCallback } from 'react'

export function Homepage({ onStartCreating, onStartAIGenerate }: { onStartCreating: () => void, onStartAIGenerate: () => void }) {
  // FadingVideo component
  const FadingVideo = ({ src, className, style }: { src: string, className?: string, style?: React.CSSProperties }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const rAFId = useRef<number>(0)
    const fadingOutRef = useRef(false)
    
    const fadeTo = useCallback((targetOpacity: number, duration: number) => {
      if (rAFId.current) cancelAnimationFrame(rAFId.current)
      const video = videoRef.current
      if (!video) return
      
      const startOpacity = parseFloat(video.style.opacity) || 0
      const startTime = performance.now()
      
      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        video.style.opacity = String(startOpacity + (targetOpacity - startOpacity) * progress)
        
        if (progress < 1) {
          rAFId.current = requestAnimationFrame(animate)
        }
      }
      
      rAFId.current = requestAnimationFrame(animate)
    }, [])
    
    useEffect(() => {
      const video = videoRef.current
      if (!video) return
      
      const onLoadedData = () => {
        video.style.opacity = '0'
        video.play()
        fadeTo(1, 500)
      }
      
      const onTimeUpdate = () => {
        if (!video.duration) return
        const remaining = video.duration - video.currentTime
        if (!fadingOutRef.current && remaining <= 0.55 && remaining > 0) {
          fadingOutRef.current = true
          fadeTo(0, 500)
        }
      }
      
      const onEnded = () => {
        video.style.opacity = '0'
        setTimeout(() => {
          video.currentTime = 0
          video.play()
          fadingOutRef.current = false
          fadeTo(1, 500)
        }, 100)
      }
      
      video.addEventListener('loadeddata', onLoadedData)
      video.addEventListener('timeupdate', onTimeUpdate)
      video.addEventListener('ended', onEnded)
      
      return () => {
        video.removeEventListener('loadeddata', onLoadedData)
        video.removeEventListener('timeupdate', onTimeUpdate)
        video.removeEventListener('ended', onEnded)
        if (rAFId.current) cancelAnimationFrame(rAFId.current)
      }
    }, [fadeTo])
    
    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className={className}
        style={{ opacity: 0, ...style }}
      >
        <source src={src} type="video/mp4" />
      </video>
    )
  }
  
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'ChillRoundF, DouyinSans, sans-serif' }}>
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap');
        
        .font-heading { font-family: 'ZhanKuButter', CangErInk, serif; font-style: normal; }
        .font-body { font-family: 'ChillRoundF', DouyinSans, sans-serif; }
        
        @keyframes blurIn {
          0% { filter: blur(10px); opacity: 0; transform: translateY(50px); }
          50% { filter: blur(5px); opacity: 0.5; transform: translateY(-5px); }
          100% { filter: blur(0px); opacity: 1; transform: translateY(0px); }
        }
        
        @keyframes slideUp {
          from { filter: blur(10px); opacity: 0; transform: translateY(20px); }
          to { filter: blur(0px); opacity: 1; transform: translateY(0px); }
        }
        
        .liquid-glass {
          background: rgba(255,255,255,0.01);
          background-blend-mode: luminosity;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .liquid-glass::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.45) 0%,
            rgba(255,255,255,0.15) 20%,
            rgba(255,255,255,0) 40%,
            rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.15) 80%,
            rgba(255,255,255,0.45) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        
        .liquid-glass-strong {
          background: rgba(255,255,255,0.01);
          background-blend-mode: luminosity;
          backdrop-filter: blur(50px);
          -webkit-backdrop-filter: blur(50px);
          border: none;
          box-shadow: 4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15);
          position: relative;
          overflow: hidden;
        }
        
        .liquid-glass-strong::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.5) 0%,
            rgba(255,255,255,0.2) 20%,
            rgba(255,255,255,0) 40%,
            rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.2) 80%,
            rgba(255,255,255,0.5) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
      
      {/* Hero Section */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: "175.5%", height: "175.5%" }}
        />
        
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Navbar */}
          <nav style={{ position: 'fixed', top: '1rem', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
            <div className="liquid-glass" style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-heading" style={{ fontSize: 24, color: '#fff' }}>a</span>
            </div>
            
            <div className="liquid-glass" style={{ display: 'flex', alignItems: 'center', borderRadius: '9999px', padding: '0.375rem', gap: '0.25rem' }}>
              <button style={{ padding: '0.5rem 0.75rem', borderRadius: '9999px', border: 'none', background: '#fff', color: '#000', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                首页
              </button>
              <button style={{ padding: '0.5rem 0.75rem', borderRadius: '9999px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                创新
              </button>
              <button onClick={onStartAIGenerate} style={{ padding: '0.5rem 0.75rem', borderRadius: '9999px', border: 'none', background: 'linear-gradient(135deg, #ff4d4f, #ff7875)', color: '#fff', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                AI生成
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button onClick={onStartCreating} style={{ padding: '0.5rem 0.75rem', borderRadius: '9999px', border: 'none', background: '#fff', color: '#000', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                开始创作
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" />
                </svg>
              </button>
            </div>
            
            <div style={{ width: 48, height: 48 }}></div>
          </nav>
          
          {/* Hero Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1rem 0' }}>
            <div style={{ animation: 'slideUp 0.6s ease-out 0.6s both', marginTop: '3rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '3.75rem', lineHeight: '0.8', letterSpacing: '-4px', maxWidth: '40rem' }} className="font-heading">
                一键生成全套banner
              </h1>
            </div>
            
            <p style={{ animation: 'slideUp 0.6s ease-out 0.8s both', marginTop: '2rem', fontSize: '1rem', maxWidth: '40rem', color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: 300, lineHeight: '1.3' }}>
              上传新的视觉风格，自动生成全套画框背景，营销页背景图、banner等，现已支持春节，五一活动
            </p>
            
            <div style={{ animation: 'slideUp 0.6s ease-out 1.1s both', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={onStartAIGenerate}
                className="liquid-glass-strong"
                style={{
                  borderRadius: '9999px',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'ChillRoundF, DouyinSans, sans-serif',
                  background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                }}
              >
                AI 一键生成
                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button
                onClick={onStartCreating}
                className="liquid-glass-strong"
                style={{
                  borderRadius: '9999px',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'ChillRoundF, DouyinSans, sans-serif',
                }}
              >
                立即开始
                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
