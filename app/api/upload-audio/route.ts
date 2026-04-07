import { NextRequest, NextResponse } from "next/server";

/** n8n으로 넘길 multipart 필드 이름 (워크플로에서 동일 이름으로 수신하세요) */
const AUDIO_FIELD_NAME = "audio";

/**
 * 음성 파일을 받아 n8n 웹훅 URL로 그대로 전달합니다.
 * CORS·비밀 URL 노출을 줄이기 위해 브라우저는 이 API만 호출합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const webhook_url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (!webhook_url) {
      console.error(
        "[upload-audio] NEXT_PUBLIC_N8N_WEBHOOK_URL이 설정되지 않았습니다.",
      );
      return NextResponse.json(
        {
          error:
            "서버 설정이 완료되지 않았습니다. 관리자에게 문의하거나 나중에 다시 시도해 주세요.",
        },
        { status: 500 },
      );
    }

    const form_data = await request.formData();
    const audio_file = form_data.get(AUDIO_FIELD_NAME);

    if (!(audio_file instanceof File) || audio_file.size === 0) {
      return NextResponse.json(
        {
          error:
            "음성 파일을 선택한 뒤 다시 시도해 주세요. 문제가 계속되면 다른 파일 형식을 사용해 보세요.",
        },
        { status: 400 },
      );
    }

    const forward_form = new FormData();
    forward_form.append(AUDIO_FIELD_NAME, audio_file, audio_file.name);

    const webhook_response = await fetch(webhook_url, {
      method: "POST",
      body: forward_form,
    });

    if (!webhook_response.ok) {
      const text_snippet = await webhook_response.text().catch(() => "");
      console.error(
        "[upload-audio] n8n 응답 오류",
        webhook_response.status,
        text_snippet.slice(0, 500),
      );
      return NextResponse.json(
        {
          error:
            "외부 서비스로 전송하지 못했습니다. 네트워크 상태를 확인한 뒤 잠시 후 다시 시도해 주세요.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[upload-audio] 처리 중 예외:", error);
    return NextResponse.json(
      {
        error:
          "요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}
