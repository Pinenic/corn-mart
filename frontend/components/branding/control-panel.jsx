'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useBranding } from '@/lib/branding-context'
import { HeaderControls } from './controls/header-controls'
import { HeroControls } from './controls/hero-controls'
import { ProductGridControls } from './controls/product-grid-controls'
import { ProductCardControls } from './controls/product-card-controls'
import { ThemeControls } from './controls/theme-controls'
import { TypographyControls } from './controls/typography-controls'
import {
  LayoutGrid,
  Image,
  Grid3X3,
  CreditCard,
  Palette,
  Type,
  RotateCcw,
} from 'lucide-react'

const sections = [
  { id: 'header', name: 'Header', icon: LayoutGrid },
  { id: 'hero', name: 'Hero', icon: Image },
  { id: 'productGrid', name: 'Product Grid', icon: Grid3X3 },
  { id: 'productCard', name: 'Product Card', icon: CreditCard },
  { id: 'theme', name: 'Color Theme', icon: Palette },
  { id: 'typography', name: 'Typography', icon: Type },
]

export function ControlPanel() {
  const [activeSection, setActiveSection] = useState('header')
  const { resetConfig } = useBranding()

  const renderControls = () => {
    switch (activeSection) {
      case 'header':
        return <HeaderControls />
      case 'hero':
        return <HeroControls />
      case 'productGrid':
        return <ProductGridControls />
      case 'productCard':
        return <ProductCardControls />
      case 'theme':
        return <ThemeControls />
      case 'typography':
        return <TypographyControls />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg mb-1">Branding Customizer</h2>
        <p className="text-xs text-muted-foreground">Customize your storefront appearance</p>
      </div>

      <div className="flex-1 flex flex-col overflow-scroll">
        <div className="p-2 border-b border-border">
          <div className="grid grid-cols-3 gap-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="truncate">{section.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {renderControls()}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={resetConfig}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
      </div>
    </div>
  )
}
