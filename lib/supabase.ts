import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** 싱글톤 캐시 — 동일 인스턴스를 재사용합니다. */
let supabase_client: SupabaseClient | null = null;

/**
 * Supabase 클라이언트를 반환합니다. (.env.local의 NEXT_PUBLIC_* 자동 로드)
 * 환경 변수가 없으면 로그를 남기고, 호출 시점에만 예외를 던집니다.
 */
export function get_supabase(): SupabaseClient {
  if (supabase_client) {
    return supabase_client;
  }

  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabase_url || !supabase_anon_key) {
    const log_message =
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 비어 있습니다. .env.local을 확인한 뒤 개발 서버를 재시작하세요.";
    console.error(log_message);
    throw new Error(
      "앱 설정을 불러오지 못했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해 주세요.",
    );
  }

  supabase_client = createClient(supabase_url, supabase_anon_key);
  return supabase_client;
}
