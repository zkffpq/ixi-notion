import type { NextConfig } from "next";

/**
 * Next.js 설정 — 프로젝트 루트의 .env, .env.local 등이 빌드/실행 시 자동 로드됩니다.
 * (별도 설정 없이도 NEXT_PUBLIC_* 변수가 클라이언트에 주입됩니다.)
 */
const next_config: NextConfig = {
  reactStrictMode: true,
};

export default next_config;
