'use client'

import { useEffect, ReactNode } from "react"

// Client component to handle browser extension style injection
export function HtmlWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Remove browser extension injected styles that cause hydration mismatches
    const html = document.documentElement

    // Remove VS Code Live Share extension styles
    const style = html.getAttribute('style')
    if (style && (style.includes('--vsc-domain') || style.includes('vscode'))) {
      html.removeAttribute('style')
    }

    // Also check for other common browser extension attributes that might cause issues
    const dataAttributes = ['data-vscode-theme-id', 'data-vscode-extension-id']
    dataAttributes.forEach(attr => {
      if (html.hasAttribute(attr)) {
        html.removeAttribute(attr)
      }
    })
  }, [])

  return <>{children}</>
}

