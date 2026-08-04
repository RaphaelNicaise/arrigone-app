import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Arrigone Propiedades',
  description: 'Gestión de propiedades — Arrigone Propiedades',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='es' suppressHydrationWarning className={cn('antialiased', fontMono.variable, 'font-sans', geist.variable)}>
      <body className='bg-[#FBFBFA] text-[#2F3437]'>
        <ThemeProvider defaultTheme='light' enableSystem={false}>
          <TooltipProvider>
            {children}
            <Toaster position='bottom-right' richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
