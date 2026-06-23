'use client'

import { useBranding } from '@/lib/branding-context'
import { PreviewHeader } from './preview-header'
import { PreviewHero } from './preview-hero'
import { PreviewProductGrid } from './preview-product-grid'
import { ScrollArea } from '@/components/ui/scroll-area'

export function LivePreview() {
  const { config } = useBranding()
  const isTransparentHeader = config.header.layout === 'transparent-overlay'

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Live Preview</h3>
            <p className="text-xs text-muted-foreground">Changes update in real-time</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Auto-updating</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div
            className="rounded-lg overflow-hidden border border-border shadow-xl bg-background"
            style={{
              minHeight: '600px',
            }}
          >
            <div className={isTransparentHeader ? 'relative' : ''}>
              <PreviewHeader />
              <PreviewHero />
            </div>
            <PreviewProductGrid />

            <footer className="border-t border-border p-6 text-center text-sm text-muted-foreground">
              <p>© 2024 STOREFRONT. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
