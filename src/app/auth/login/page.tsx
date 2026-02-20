import { normalizeNextPath } from "@/lib/auth/guard";
import { signInWithGoogleAction } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const next = normalizeNextPath(params.next);
  const showError =
    params.error === "oauth_callback_failed" || params.error === "oauth_start_failed";

  return (
    <main className="page-shell">
      <div className="page-container">
        <section className="story-panel fade-up">
          <h1>로그인</h1>
          <p>FoodSafeAI를 사용하려면 Google 계정으로 로그인하세요.</p>
          {showError ? (
            <p className="notice">로그인 처리에 실패했습니다. 다시 시도해 주세요.</p>
          ) : null}

          <form action={signInWithGoogleAction} className="input-row">
            <input type="hidden" name="next" value={next} />
            <button type="submit" className="btn-primary">
              Google로 로그인
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
