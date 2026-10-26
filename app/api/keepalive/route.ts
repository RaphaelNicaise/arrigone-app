import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Esta ruta mantiene activo el proyecto de Supabase (Free Tier) y evita que se pause
// por inactividad. Ejecuta tanto una lectura como una actualización real (escritura)
// en Postgres para asegurar que el motor registre actividad continua de transacciones.
export async function GET() {
  const startTime = Date.now()
  try {
    const supabase = await createServerClient()

    // 1. Obtenemos una propiedad para actualizar
    const { data: prop, error: selectError } = await supabase
      .from("propiedades")
      .select("id, updated_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (selectError) throw selectError

    let updatedPropertyId: string | null = null
    const now = new Date().toISOString()

    // 2. Ejecutamos una escritura real actualizando el campo updated_at
    if (prop?.id) {
      const { error: updateError } = await supabase
        .from("propiedades")
        .update({ updated_at: now })
        .eq("id", prop.id)

      if (updateError) throw updateError
      updatedPropertyId = prop.id
    }

    // 3. Consulta de vendedores para registrar actividad adicional en el schema cache
    await supabase.from("vendedores").select("id").limit(1)

    return NextResponse.json({
      status: "ok",
      message: "Supabase keepalive exitoso (lectura + escritura activa)",
      updatedPropertyId,
      timestamp: now,
      durationMs: Date.now() - startTime,
    })
  } catch (error: any) {
    console.error("Keepalive error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Fallo al ejecutar keepalive en Supabase",
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET()
}
