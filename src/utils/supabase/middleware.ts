import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Criamos uma resposta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Agora o TypeScript reconhecerá o getAll (após o update do npm)
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Atualizar o REQUEST
          // Isso garante que o Server Component/Action que roda DEPOIS do middleware
          // veja os cookies atualizados (incluindo as options como path/domain).
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({
              name,
              value,
              ...options,
            })
          )

          // 2. Atualizar o RESPONSE
          // Precisamos recriar a resposta para "carregar" as alterações do request
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          // 3. Persistir no BROWSER
          // Copiamos os cookies para a resposta final que vai para o navegador
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({
              name,
              value,
              ...options,
            })
          )
        },
      },
    }
  )

  // Atualiza a sessão
  await supabase.auth.getUser()

  return response
}
