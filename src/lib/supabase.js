import { createClient } from '@supabase/supabase-js';

// anon key는 공개용(브라우저 노출 안전). RLS로 접근 제어.
// 빌드 환경변수(VITE_*)가 있으면 우선 사용, 없으면 GRIND 프로젝트 기본값.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://bfjgiotjgywrhqhyqngd.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmamdpb3RqZ3l3cmhxaHlxbmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4OTQ0MDksImV4cCI6MjA5ODQ3MDQwOX0.-nizll-Sbvqa1wlWTDLSbdQOgVRT9TtlB9ImYOm9RnE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
