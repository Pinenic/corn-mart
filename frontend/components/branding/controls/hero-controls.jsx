'use client'

import { useBranding } from '@/lib/branding-context'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const heroLayouts = [
  { id: 'full-width', name: 'Full Width', description: 'Banner with centered text' },
  { id: 'split', name: 'Split Layout', description: 'Image left, text right' },
  { id: 'carousel', name: 'Carousel', description: 'Sliding banner with controls' },
  { id: 'text-only', name: 'Text Only', description: 'Minimal text-focused hero' },
  { id: 'video-overlay', name: 'Video Overlay', description: 'Gradient overlay style' },
]

export function HeroControls() {
  const { config, updateConfig } = useBranding()
  const { layout, title, subtitle, ctaText, textAlignment, overlayOpacity } = config.hero

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Layout Style</Label>
        <div className="grid gap-2">
          {heroLayouts.map((item) => (
            <button
              key={item.id}
              onClick={() => updateConfig('hero', { layout: item.id })}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                layout === item.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="hero-title" className="text-sm font-medium mb-2 block">Title</Label>
          <Input
            id="hero-title"
            value={title}
            onChange={(e) => updateConfig('hero', { title: e.target.value })}
            placeholder="Enter hero title"
          />
        </div>
        <div>
          <Label htmlFor="hero-subtitle" className="text-sm font-medium mb-2 block">Subtitle</Label>
          <Input
            id="hero-subtitle"
            value={subtitle}
            onChange={(e) => updateConfig('hero', { subtitle: e.target.value })}
            placeholder="Enter hero subtitle"
          />
        </div>
        <div>
          <Label htmlFor="hero-cta" className="text-sm font-medium mb-2 block">CTA Button Text</Label>
          <Input
            id="hero-cta"
            value={ctaText}
            onChange={(e) => updateConfig('hero', { ctaText: e.target.value })}
            placeholder="Shop Now"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Text Alignment</Label>
        <Select
          value={textAlignment}
          onValueChange={(value) => updateConfig('hero', { textAlignment: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Overlay Opacity: {overlayOpacity}%</Label>
        <Slider
          value={[overlayOpacity]}
          onValueChange={(value) => updateConfig('hero', { overlayOpacity: value[0] })}
          max={100}
          step={5}
        />
      </div>
    </div>
  )
}
