"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ErrorFallbackToast } from "@/components/common/ErrorFallbackToast";
import { HeaderRoleSwitch } from "@/components/common/HeaderRoleSwitch";
import { SyncStatusChip } from "@/components/common/SyncStatusChip";
import { TrustEvidenceBar } from "@/components/common/TrustEvidenceBar";
import { AllergyInfoCard } from "@/components/parent/AllergyInfoCard";
import { MenuPreviewCard } from "@/components/parent/MenuPreviewCard";
import { RiskNoticeList } from "@/components/parent/RiskNoticeList";
import { TodaySafetyBanner } from "@/components/parent/TodaySafetyBanner";
import { ParentMenuPlan, ParentNotice } from "@/components/parent/types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=1400&q=80";
const HERO_IMAGE_FALLBACK = "/images/parent-hero-fallback.svg";

const PARENT_FLOW = [
  {
    title: "안전 공지 확인",
    description: "상단 배너와 최근 공지를 먼저 확인해 위험 여부를 즉시 파악합니다.",
  },
  {
    title: "메뉴와 알레르기 확인",
    description: "이번 주 메뉴와 알레르기 주의 항목을 함께 비교합니다.",
  },
  {
    title: "가정 대응 안내",
    description: "필요 시 아이에게 주의 식품과 대체 간식 안내를 전달합니다.",
  },
];

export default function ParentPage() {
  const [notices, setNotices] = useState<ParentNotice[]>([]);
  const [menuPlan, setMenuPlan] = useState<ParentMenuPlan | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [heroImage, setHeroImage] = useState(HERO_IMAGE);

  useEffect(() => {
    let alive = true;

    async function fetchFeed() {
      try {
        const response = await fetch("/api/parent/feed");
        if (!response.ok) {
          throw new Error("feed fetch failed");
        }

        const data = (await response.json()) as {
          notices: ParentNotice[];
          latestMenuPlan: ParentMenuPlan | null;
          syncedAt: string | null;
        };

        if (!alive) {
          return;
        }

        setNotices(data.notices);
        setMenuPlan(data.latestMenuPlan);
        setSyncedAt(data.syncedAt);
      } catch {
        if (alive) {
          setErrorMessage("학부모 피드를 불러오지 못했습니다.");
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    }

    void fetchFeed();
    return () => {
      alive = false;
    };
  }, []);

  const allergyItems = useMemo(() => {
    if (!menuPlan) {
      return [];
    }

    const warnings = menuPlan.days.flatMap((day) => day.allergyWarnings ?? []);
    return Array.from(new Set(warnings));
  }, [menuPlan]);

  return (
    <main className="page-shell">
      <div className="page-container">
        <HeaderRoleSwitch />
        <section className="brutal-marquee fade-up" aria-label="학부모 피드 배너">
          PARENT FEED // TODAY SAFETY STATUS // NOTICE WATCH // MENU PREVIEW // LIVE SYNC //
        </section>
        <TrustEvidenceBar syncedAt={syncedAt} fromCache={Boolean(errorMessage)} />

        <section className="hero-card hero-card--parent fade-up">
          <div className="hero-card__content">
            <span className="hero-card__eyebrow">Parent Review Feed</span>
            <h1>TODAY SAFETY BRIEFING</h1>
            <p>
              Today risk signals and menu updates are collected in one view for faster
              parent response.
            </p>
            <SyncStatusChip
              syncedAt={syncedAt}
              fromCache={Boolean(errorMessage)}
              language="en"
            />
          </div>
          <div className="hero-card__media">
            <Image
              src={heroImage}
              alt="학부모가 급식 안전 정보를 확인하는 장면"
              fill
              priority
              onError={() => setHeroImage(HERO_IMAGE_FALLBACK)}
            />
          </div>
        </section>

        <section className="ops-metrics fade-up" aria-label="학부모 핵심 확인 지표">
          <article className="ops-metrics__item">
            <span>RISK</span>
            <strong>{notices.length > 0 ? "ALERT" : "CLEAR"}</strong>
          </article>
          <article className="ops-metrics__item">
            <span>MENU</span>
            <strong>{menuPlan ? "READY" : "WAIT"}</strong>
          </article>
          <article className="ops-metrics__item">
            <span>SYNC</span>
            <strong>{syncedAt ? "LIVE" : "N/A"}</strong>
          </article>
        </section>

        {isLoading ? (
          <section className="story-panel fade-up">
            <p>피드를 불러오는 중입니다.</p>
          </section>
        ) : null}

        <section className="story-grid">
          <TodaySafetyBanner hasRiskNotice={notices.length > 0} />
          <RiskNoticeList notices={notices} />
          <MenuPreviewCard menuPlan={menuPlan} />
          <AllergyInfoCard items={allergyItems} />
        </section>

        <section className="story-panel fade-up">
          <h2>학부모 확인 플로우</h2>
          <p>해커톤 데모에서는 아래 3단계를 따라 설명하면 학부모 관점의 사용 흐름이 명확합니다.</p>
          <div className="flow-guide">
            {PARENT_FLOW.map((step, index) => (
              <article className="flow-step" key={step.title}>
                <span className="flow-step__index">단계 {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <ErrorFallbackToast
          message={errorMessage || "오류가 발생해 기본 피드를 표시합니다."}
          visible={Boolean(errorMessage)}
          mode="alert"
        />
      </div>
    </main>
  );
}
