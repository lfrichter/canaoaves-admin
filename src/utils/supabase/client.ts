import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./constants";

// 1. Definições de Cookie
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

// 2. Funções Auxiliares para Manipular Cookies no Navegador
function fetchCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  const domainAttr = COOKIE_DOMAIN ? `; domain=${COOKIE_DOMAIN}` : '';
  const secureAttr = process.env.NODE_ENV === "production" ? '; Secure' : '';
  // Expira em 1 ano (persistente)
  document.cookie = `${name}=${encodeURIComponent(value)}${domainAttr}; path=/; max-age=31536000; SameSite=Lax${secureAttr}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  const domainAttr = COOKIE_DOMAIN ? `; domain=${COOKIE_DOMAIN}` : '';
  document.cookie = `${name}=${domainAttr}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// 3. O Storage Inteligente (Chunking)
// Esse objeto intercepta a gravação do token. Se for muito grande, ele fatia.
const customCookieStorage = {
  getItem: (key: string) => {
    // Tenta pegar o cookie inteiro
    const item = fetchCookie(key);
    if (item) return item;

    // Se não achou, tenta reconstruir dos pedaços (.0, .1, .2...)
    let value = '';
    let i = 0;
    while (true) {
      const chunk = fetchCookie(`${key}.${i}`);
      if (!chunk) break;
      value += chunk;
      i++;
    }
    return value || null;
  },

  setItem: (key: string, value: string) => {
    const chunkSize = 3000; // Margem de segurança (Browser limit ~4096)

    // Se couber num só, grava normal
    if (value.length <= chunkSize) {
      setCookie(key, value);
      return;
    }

    // Se for grande, limpa o principal e grava os pedaços
    deleteCookie(key);
    const chunkCount = Math.ceil(value.length / chunkSize);

    for (let i = 0; i < chunkCount; i++) {
      const chunk = value.slice(i * chunkSize, (i + 1) * chunkSize);
      setCookie(`${key}.${i}`, chunk);
    }
  },

  removeItem: (key: string) => {
    deleteCookie(key);
    // Remove possíveis sobras de chunks
    for (let i = 0; i < 10; i++) deleteCookie(`${key}.${i}`);
  },
};

// 4. Criação do Cliente com o Storage Customizado
export const supabaseBrowserClient = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    db: {
      schema: "public",
    },
    // Aqui injetamos nossa lógica de fatiamento
    auth: {
      storage: customCookieStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
);
