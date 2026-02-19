"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { HeaderRoleSwitch } from "@/components/common/HeaderRoleSwitch";
import { ErrorFallbackToast } from "@/components/common/ErrorFallbackToast";
import { SyncStatusChip } from "@/components/common/SyncStatusChip";
import { IngredientInputPanel } from "@/components/nutritionist/IngredientInputPanel";
import { MenuGeneratorPanel } from "@/components/nutritionist/MenuGeneratorPanel";
import { PublishNoticeButton } from "@/components/nutritionist/PublishNoticeButton";
import { RiskCheckPanel } from "@/components/nutritionist/RiskCheckPanel";
import { RiskDetailCard } from "@/components/nutritionist/RiskDetailCard";
import { WeeklyMenuView } from "@/components/nutritionist/WeeklyMenuView";
import { MenuPlan, RiskEventItem } from "@/components/nutritionist/types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80";

type Dataset = {
  srvcSn: number;
  serviceName: string;
};

const HACKATHON_FLOW = [
  {
    title: "식자재 등록",
    description: "오늘 급식에 실제 투입될 재료를 우선 등록합니다.",
  },
  {
    title: "위해도 점검",
    description: "식약처 공개 데이터와 교차 조회해 위험 가능성을 확인합니다.",
  },
  {
    title: "조치 우선순위 정리",
    description: "위험/주의 항목을 기준으로 대체 식자재 검토 대상을 정합니다.",
  },
  {
    title: "주간 메뉴 생성",
    description: "인원·예산·알레르기 제약을 반영해 대체 메뉴를 생성합니다.",
  },
  {
    title: "학부모 공지 발행",
    description: "위험 대응 내용과 메뉴 변경사항을 즉시 공유합니다.",
  },
  {
    title: "피드백 반영",
    description: "학부모 문의와 반응을 다음 급식 계획에 반영합니다.",
  },
];

export default function NutritionistPage() {
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEventItem[]>([]);
  const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [people, setPeople] = useState(100);
  const [budget, setBudget] = useState(500000);
  const [allergies, setAllergies] = useState("");
  const [noticeResult, setNoticeResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const canRunRiskCheck = useMemo(() => ingredients.length > 0, [ingredients]);
  const canPublish = useMemo(
    () => riskEvents.length > 0 || Boolean(menuPlan),
    [riskEvents.length, menuPlan],
  );

  useEffect(() => {
    let alive = true;

    async function loadPortalDatasets() {
      try {
        const response = await fetch("/api/mfds/datasets");
        if (!response.ok) {
          throw new Error("dataset fetch failed");
        }

        const data = (await response.json()) as { datasets: Dataset[] };
        if (alive) {
          setDatasets(data.datasets.slice(0, 3));
        }
      } catch {
        if (alive) {
          setDatasets([]);
        }
      }
    }

    void loadPortalDatasets();
    return () => {
      alive = false;
    };
  }, []);

  function addIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = ingredientInput.trim();
    if (!next) {
      return;
    }

    setIngredients((current) =>
      current.includes(next) ? current : [...current, next],
    );
    setIngredientInput("");
  }

  async function runRiskCheck() {
    setErrorMessage("");

    try {
      const response = await fetch("/api/risk/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredients.map((name) => ({ name })),
        }),
      });

      if (!response.ok) {
        throw new Error("위해도 검사 요청 실패");
      }

      const data = (await response.json()) as {
        riskEvents: RiskEventItem[];
        syncedAt: string | null;
      };

      setRiskEvents(data.riskEvents);
      setSyncedAt(data.syncedAt);
    } catch {
      setErrorMessage("위해도 검사 중 오류가 발생했습니다.");
    }
  }

  async function runMenuGenerate() {
    setErrorMessage("");

    try {
      const response = await fetch("/api/menu/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          constraints: {
            people,
            budget,
            allergies: allergies
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("메뉴 생성 요청 실패");
      }

      const data = (await response.json()) as {
        menuPlan: MenuPlan;
        fallbackUsed: boolean;
      };

      setMenuPlan(data.menuPlan);
      setFallbackUsed(data.fallbackUsed);
    } catch {
      setErrorMessage("메뉴 생성 중 오류가 발생했습니다.");
    }
  }

  async function publishNotice() {
    setErrorMessage("");
    setNoticeResult("");

    try {
      const title =
        riskEvents.length > 0
          ? `[안전공지] ${riskEvents[0]?.ingredientName ?? "식자재"} 위험 안내`
          : "[안전공지] 메뉴/안전 업데이트";
      const body =
        riskEvents.length > 0
          ? `위험 이벤트 ${riskEvents.length}건을 확인하고 조치했습니다.`
          : "새로운 메뉴와 안전 현황을 반영했습니다.";

      const response = await fetch("/api/parent/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          riskEventIds: riskEvents.map((item) => item.id),
          menuPlanId: menuPlan?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("공지 발행 실패");
      }

      setNoticeResult("학부모 공지가 발행되었습니다.");
    } catch {
      setErrorMessage("공지 발행 중 오류가 발생했습니다.");
    }
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <HeaderRoleSwitch />

        <section className="hero-card fade-up">
          <div className="hero-card__content">
            <span className="hero-card__eyebrow">영양사 운영 플로우</span>
            <h1>영양사 대시보드</h1>
            <p>
              오늘 상태 요약부터 공지 발행까지 실무 순서 그대로 배치해 빠르게 의사결정할
              수 있도록 구성했습니다.
            </p>
            <SyncStatusChip syncedAt={syncedAt} />
          </div>
          <div className="hero-card__media">
            <Image src={HERO_IMAGE} alt="영양사 운영 대시보드 비주얼" fill priority />
          </div>
        </section>

        <section className="story-grid">
          <article className="story-panel fade-up">
            <h2>오늘 운영 요약</h2>
            <p>등록 식자재 {ingredients.length}건, 위험 이벤트 {riskEvents.length}건</p>
            {noticeResult ? (
              <p>{noticeResult}</p>
            ) : (
              <p>아직 공지가 발행되지 않았습니다.</p>
            )}
          </article>
          <article className="story-panel story-panel--soft fade-up">
            <h2>식약처 포털 최신 공개 데이터</h2>
            {datasets.length === 0 ? (
              <p>데이터를 불러오지 못했거나 아직 없습니다.</p>
            ) : (
              <ul className="list">
                {datasets.map((dataset) => (
                  <li key={dataset.srvcSn}>{dataset.serviceName}</li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section className="story-panel fade-up">
          <h2>해커톤 발표 플로우</h2>
          <p>아래 6단계를 따라 설명하면 데모에서 기능 흐름을 짧고 명확하게 전달할 수 있습니다.</p>
          <div className="flow-guide">
            {HACKATHON_FLOW.map((step, index) => (
              <article className="flow-step" key={step.title}>
                <span className="flow-step__index">단계 {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="kpi-grid fade-up">
          <article className="kpi-card">
            <span>오늘 점검 식자재</span>
            <strong>{ingredients.length}건</strong>
          </article>
          <article className="kpi-card">
            <span>탐지된 위험 이벤트</span>
            <strong>{riskEvents.length}건</strong>
          </article>
          <article className="kpi-card">
            <span>입력 예산</span>
            <strong>{budget.toLocaleString("ko-KR")}원</strong>
          </article>
        </section>

        <div className="flow-stack">
          <IngredientInputPanel
            value={ingredientInput}
            ingredients={ingredients}
            onValueChange={setIngredientInput}
            onSubmit={addIngredient}
          />
          <RiskCheckPanel onRun={runRiskCheck} disabled={!canRunRiskCheck} />
          <RiskDetailCard riskEvents={riskEvents} />
          <MenuGeneratorPanel
            people={people}
            budget={budget}
            allergies={allergies}
            onPeopleChange={setPeople}
            onBudgetChange={setBudget}
            onAllergiesChange={setAllergies}
            onGenerate={runMenuGenerate}
          />
          <WeeklyMenuView menuPlan={menuPlan} fallbackUsed={fallbackUsed} />
          <section className="story-panel fade-up">
            <h2>공지 발행 단계</h2>
            <p>
              위험 대응 및 메뉴 조정 결과를 학부모에게 즉시 공유해 신뢰를 확보합니다.
            </p>
            <PublishNoticeButton onClick={publishNotice} disabled={!canPublish} />
            {noticeResult ? <p>{noticeResult}</p> : null}
          </section>
        </div>

        <ErrorFallbackToast
          message={errorMessage || "외부 API 응답 오류로 캐시 데이터를 표시했습니다."}
          visible={Boolean(errorMessage)}
        />
      </div>
    </main>
  );
}
