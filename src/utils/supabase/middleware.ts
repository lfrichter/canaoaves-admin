import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Configuração inicial da resposta
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Cliente Supabase (MANTIDO IGUAL)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({
              name,
              value,
              ...options,
            })
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
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

  // 3. Verifica o Usuário
  // Isso renova o token se necessário e nos diz quem é o usuário
  const { data: { user } } = await supabase.auth.getUser()

  // --- 🔒 AQUI ENTRA A PROTEÇÃO (GATEKEEPER) ---

  const url = request.nextUrl.clone()

  // REGRA 1: Proteção de Rotas
  // Se NÃO tem usuário E NÃO está tentando entrar no login ou rotas de auth
  // -> Chuta para o /login
  if (!user && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/auth')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // REGRA 2: Redirecionamento de Logado
  // Se JÁ tem usuário E está tentando acessar a tela de login
  // -> Manda para o Dashboard (/)
  if (user && url.pathname.startsWith('/login')) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}
