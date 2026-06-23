'use client'

import { useBranding } from '@/lib/branding-context'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const typographyPresets = [
  { id: 'modern-sans', name: 'Modern Sans', fonts: 'Inter + Inter', preview: 'Aa' },
  { id: 'serif-combo', name: 'Serif Combo', fonts: 'Playfair + Source Sans', preview: 'Aa' },
  { id: 'display-body', name: 'Display + Body', fonts: 'Poppins + Open Sans', preview: 'Aa' },
  { id: 'minimal-clean', name: 'Minimal Clean', fonts: 'DM Sans + DM Sans', preview: 'Aa' },
  { id: 'bold-editorial', name: 'Bold Editorial', fonts: 'Bebas Neue + Roboto', preview: 'Aa' },
]

const fontOptions = [
  'Inter',
  'Playfair Display',
  'Source Sans Pro',
  'Poppins',
  'Open Sans',
  'DM Sans',
  'Bebas Neue',
  'Roboto',
  'Montserrat',
  'Lato',
]

export function TypographyControls() {
  const { config, updateConfig } = useBranding()
  const { preset, headingFont, bodyFont, scale } = config.typography

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Font Pairing</Label>
        <div className="grid gap-2">
          {typographyPresets.map((item) => (
            <button
              key={item.id}
              onClick={() => updateConfig('typography', { preset: item.id })}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                preset === item.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.fonts}</div>
                </div>
                <div className="text-2xl font-bold">{item.preview}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Heading Font</Label>
          <Select
            value={headingFont}
            onValueChange={(value) => updateConfig('typography', { headingFont: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font} value={font}>{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Body Font</Label>
          <Select
            value={bodyFont}
            onValueChange={(value) => updateConfig('typography', { bodyFont: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font} value={font}>{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Font Scale</Label>
          <Select
            value={scale}
            onValueChange={(value) => updateConfig('typography', { scale: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
