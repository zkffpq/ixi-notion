"use client";

import { useCallback, useState, type DragEvent, type FormEvent } from "react";
import Image from "next/image";

const AUDIO_FIELD_NAME = "audio";

/**
 * 홈 화면 — 음성 파일 선택 후 서버 API를 통해 n8n 웹훅으로 전송합니다.
 */
export default function HomePage() {
  const [selected_file, set_selected_file] = useState<File | null>(null);
  const [is_uploading, set_is_uploading] = useState(false);
  const [user_message, set_user_message] = useState<string | null>(null);
  const [is_error, set_is_error] = useState(false);
  const [is_drag_active, set_is_drag_active] = useState(false);

  const reset_feedback = useCallback(() => {
    set_user_message(null);
    set_is_error(false);
  }, []);

  const pick_files = useCallback(
    (file_list: FileList | null) => {
      const file = file_list?.[0];
      if (!file) {
        return;
      }
      reset_feedback();
      set_selected_file(file);
    },
    [reset_feedback],
  );

  async function handle_submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset_feedback();

    if (!selected_file) {
      set_is_error(true);
      set_user_message(
        "먼저 음성 파일을 선택하거나 여기로 끌어다 놓아 주세요.",
      );
      return;
    }

    set_is_uploading(true);
    try {
      const form_data = new FormData();
      form_data.append(AUDIO_FIELD_NAME, selected_file);

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: form_data,
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        set_is_error(true);
        set_user_message(
          payload.error ??
            "전송에 실패했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.",
        );
        return;
      }

      set_is_error(false);
      set_user_message("전송이 완료되었습니다. 노션에서 확인해 보세요.");
      set_selected_file(null);
    } catch (error) {
      console.error("[HomePage] 업로드 요청 실패:", error);
      set_is_error(true);
      set_user_message(
        "네트워크 오류가 발생했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.",
      );
    } finally {
      set_is_uploading(false);
    }
  }

  function handle_drag_over(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    set_is_drag_active(true);
  }

  function handle_drag_leave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    set_is_drag_active(false);
  }

  function handle_drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    set_is_drag_active(false);
    pick_files(event.dataTransfer.files);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Image
            src="/images/ixi-logo.png"
            alt="익시오 로고"
            width={220}
            height={72}
            className="h-auto w-[180px] sm:w-[220px]"
            priority
          />
          <Image
            src="/images/notion-logo.png"
            alt="노션 로고"
            width={220}
            height={110}
            className="h-auto w-[180px] sm:w-[220px]"
            priority
          />
        </div>
        <p className="mb-3 text-3xl font-semibold tracking-tight text-white">
          익시오 통화*노션 워크스페이스 연계 서비스
        </p>
        <p className="mt-2 text-sm text-slate-400">
          파일을 업로드 해주시면 통화요약 정보를 노션으로 안전하게 전달합니다.
        </p>
      </div>

      <form
        onSubmit={handle_submit}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl shadow-black/20"
      >
        <label className="mb-2 block text-sm font-medium text-slate-300">
          음성 파일
        </label>

        <div
          onDragOver={handle_drag_over}
          onDragLeave={handle_drag_leave}
          onDrop={handle_drop}
          className={`mb-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-colors ${
            is_drag_active
              ? "border-[var(--accent)] bg-blue-500/10"
              : "border-slate-600 bg-slate-900/40 hover:border-slate-500"
          }`}
        >
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
            className="hidden"
            id="audio-input"
            disabled={is_uploading}
            onChange={(event) => pick_files(event.target.files)}
          />
          <label
            htmlFor="audio-input"
            className="cursor-pointer text-center text-sm text-slate-300"
          >
            <span className="text-[var(--accent)] underline-offset-4 hover:underline">
              파일 선택
            </span>
            <span className="text-slate-500"> 또는 드래그하여 놓기</span>
          </label>
          {selected_file ? (
            <p className="mt-3 max-w-full truncate text-xs text-slate-400">
              {selected_file.name} · {(selected_file.size / 1024).toFixed(1)} KB
            </p>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              MP3, WAV, M4A 등 일반적인 음성 형식을 지원합니다.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={is_uploading || !selected_file}
          className="w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {is_uploading ? "전송 중…" : "노션으로 보내기"}
        </button>

        {user_message ? (
          <p
            role="status"
            className={`mt-4 text-center text-sm ${
              is_error ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {user_message}
          </p>
        ) : null}
      </form>
    </main>
  );
}
