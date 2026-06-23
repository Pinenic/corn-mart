'use client'

import { useBranding } from '@/lib/branding-context'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function PreviewHero() {
  const { config } = useBranding()
  const { layout, title, subtitle, ctaText, textAlignment, overlayOpacity } = config.hero

  const textAlignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[textAlignment]

  const heroImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop'

  if (layout === 'full-width') {
    return (
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
        <div className={`absolute inset-0 flex flex-col justify-center px-8 ${textAlignClass}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg text-white/80 mb-6 max-w-xl">{subtitle}</p>
          <Button size="lg" className="w-fit">{ctaText}</Button>
        </div>
      </section>
    )
  }

  if (layout === 'split') {
    return (
      <section className="grid md:grid-cols-2 min-h-[400px]">
        <div className={`flex flex-col justify-center p-8 bg-card ${textAlignClass}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-muted-foreground mb-6 max-w-md">{subtitle}</p>
          <Button size="lg" className="w-fit">{ctaText}</Button>
        </div>
        <div className="relative min-h-[300px]">
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      </section>
    )
  }

  if (layout === 'carousel') {
    return (
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
        <div className={`absolute inset-0 flex flex-col justify-center px-8 ${textAlignClass}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg text-white/80 mb-6 max-w-xl">{subtitle}</p>
          <Button size="lg" className="w-fit">{ctaText}</Button>
        </div>
        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <span className="w-8 h-1 bg-white rounded-full" />
          <span className="w-8 h-1 bg-white/40 rounded-full" />
          <span className="w-8 h-1 bg-white/40 rounded-full" />
        </div>
      </section>
    )
  }

  if (layout === 'text-only') {
    return (
      <section className={`py-20 px-8 bg-card ${textAlignClass} flex flex-col`}>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{subtitle}</p>
        <Button size="lg" className="w-fit">{ctaText}</Button>
      </section>
    )
  }

  if (layout === 'video-overlay') {
    return (
      <section className="relative h-[400px] overflow-hidden bg-card">
        <img
          src={heroImage}
          alt="Hero"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-8 text-left items-start">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg text-white/80 mb-6 max-w-xl">{subtitle}</p>
          <div className="flex gap-4">
            <Button size="lg">{ctaText}</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Watch Video
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return null
}
