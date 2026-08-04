"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    
    if (!username || !password) {
      setError("Por favor, completa ambos campos")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      
      if (res.ok) {
        toast.success("Inicio de sesión exitoso")
        router.push("/propiedades")
      } else {
        const data = await res.json()
        setError(data.error || "Credenciales inválidas")
        toast.error("Error al iniciar sesión")
      }
    } catch (err) {
      setError("Error de conexión")
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#EAEAEA] shadow-none bg-white">
        <CardHeader className="space-y-4 items-center">
          <div className="relative w-[180px] h-[60px] mb-4">
            {/* Si no tienes logo.png aún, usa un div placeholder u oculta */}
            <Image 
              src="/logo.png" 
              alt="Arrigone Propiedades" 
              fill 
              sizes="180px"
              className="object-contain"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-semibold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa al sistema de gestión de propiedades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input 
                id="username" 
                name="username" 
                type="text" 
                placeholder="Ingresa tu usuario"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-[#111111] text-white hover:bg-[#111111]/90" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
