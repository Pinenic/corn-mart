'use client'

import { useBranding } from '@/lib/branding-context'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const cardStyles = [
  { id: 'minimal', name: 'Minimal', description: 'Image + name + price' },
  { id: 'hover-actions', name: 'Hover Actions', description: 'Actions appear on hover' },
  { id: 'quick-add', name: 'Quick Add', description: 'Plus button on hover' },
  { id: 'elevated', name: 'Elevated', description: 'Shadow card with padding' },
  { id: 'border-only', name: 'Border Only', description: 'Clean bordered card' },
]

export function ProductCardControls() {
  const { config, updateConfig } = useBranding()
  const { style, showRatings, showPrice, showDiscount, buttonStyle } = config.productCard

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Card Style</Label>
        <div className="grid gap-2">
          {cardStyles.map((item) => (
            <button
              key={item.id}
              onClick={() => updateConfig('productCard', { style: item.id })}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                style === item.id
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
        <Label className="text-sm font-medium">Display Options</Label>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-ratings" className="text-sm text-muted-foreground">Show Ratings</Label>
          <Switch
            id="show-ratings"
            checked={showRatings}
            onCheckedChange={(checked) => updateConfig('productCard', { showRatings: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-price" className="text-sm text-muted-foreground">Show Price</Label>
          <Switch
            id="show-price"
            checked={showPrice}
            onCheckedChange={(checked) => updateConfig('productCard', { showPrice: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-discount" className="text-sm text-muted-foreground">Show Discount Badge</Label>
          <Switch
            id="show-discount"
            checked={showDiscount}
            onCheckedChange={(checked) => updateConfig('productCard', { showDiscount: checked })}
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Button Style</Label>
        <Select
          value={buttonStyle}
          onValueChange={(value) => updateConfig('productCard', { buttonStyle: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="filled">Filled</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="text">Text Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
