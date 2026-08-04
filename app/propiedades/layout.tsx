"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function PropiedadesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-white border-b border-[#EAEAEA] sticky top-0 z-30">
        <div className="h-full px-4 md:px-6 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-[40px] h-[40px]">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="font-medium text-lg hidden sm:block">Arrigone Propiedades</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>
      <main className="flex-1 w-full mx-auto px-4 md:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
