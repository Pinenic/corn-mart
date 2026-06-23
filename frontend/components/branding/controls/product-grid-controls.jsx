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

const gridLayouts = [
  { id: 'grid-2', name: '2-Column Grid', description: 'Two products per row' },
  { id: 'grid-3', name: '3-Column Grid', description: 'Three products per row' },
  { id: 'grid-4', name: '4-Column Grid', description: 'Four products per row' },
  { id: 'masonry', name: 'Masonry', description: 'Pinterest-style layout' },
  { id: 'list', name: 'List View', description: 'Vertical list layout' },
]

export function ProductGridControls() {
  const { config, updateConfig } = useBranding()
  const { layout, spacing, imageRatio, pagination } = config.productGrid

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Grid Layout</Label>
        <div className="grid gap-2">
          {gridLayouts.map((item) => (
            <button
              key={item.id}
              onClick={() => updateConfig('productGrid', { layout: item.id })}
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

      <div>
        <Label className="text-sm font-medium mb-2 block">Spacing</Label>
        <Select
          value={spacing}
          onValueChange={(value) => updateConfig('productGrid', { spacing: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tight">Tight</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="wide">Wide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Image Ratio</Label>
        <Select
          value={imageRatio}
          onValueChange={(value) => updateConfig('productGrid', { imageRatio: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="square">Square (1:1)</SelectItem>
            <SelectItem value="portrait">Portrait (3:4)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Pagination Style</Label>
        <Select
          value={pagination}
          onValueChange={(value) => updateConfig('productGrid', { pagination: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pagination">Pagination</SelectItem>
            <SelectItem value="infinite">Infinite Scroll</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
