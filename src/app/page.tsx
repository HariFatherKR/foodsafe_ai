"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderRoleSwitch } from "@/components/common/HeaderRoleSwitch";

type Dataset = {
  srvcSn: number;
  serviceName: string;
  category: string | null;
  provider: string | null;
  openedAt: string | null;
  usageLink: string | null;
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80";
const TERMINAL_IMAGE =
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1600&q=80";
const OPERATION_STEPS = [
  "INGREDIENT INTAKE",
  "RISK CHECK",
  "MENU GENERATION",
  "NOTICE PUBLISH",
  "PARENT FEED",
];

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadDatasets() {
      try {
        const response = await fetch("/api/mfds/datasets");
        if (!response.ok) {
          throw new Error("dataset fetch failed");
        }

        const data = (await response.json()) as { datasets: Dataset[] };
        if (!alive) {
          return;
        }

        setDatasets(data.datasets.slice(0, 6));
      } catch {
        if (alive) {
          setDatasets([]);
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    }

    void loadDatasets();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <div className="page-container">
        <HeaderRoleSwitch />

        <section className="brutal-marquee fade-up" aria-label="실시간 운영 배너">
          SCHOOL MEAL SAFETY // MFDS RISK SIGNAL // MENU ADJUSTMENT // PARENT NOTICE // LIVE STATUS //
        </section>

        <section className="home-brutal-hero fade-up">
          <div className="home-brutal-hero__media">
            <Image src={HERO_IMAGE} alt="학교 급식 식재료 준비 장면" fill priority />
          </div>
          <div className="home-brutal-hero__overlay">
            <p className="home-brutal-hero__tag">AI-powered school meal safety operations</p>
            <h1 className="home-brutal-hero__title">SCHOOL MEAL SAFETY</h1>
            <p className="home-brutal-hero__subtitle">
              Detect ingredient risks, generate safer menus, and notify parents in one flow.
            </p>
            <div className="home-brutal-hero__cta">
              <Link className="btn-primary" href="/nutritionist">
                ENTER NUTRITION CENTER
              </Link>
              <Link className="btn-secondary" href="/parent">
                OPEN PARENT FEED
              </Link>
            </div>
          </div>
        </section>

        <section className="home-segment-rail fade-up" aria-label="운영 단계 트랙">
          {OPERATION_STEPS.map((step) => (
            <span className="home-segment-rail__chip" key={step}>
              {step}
            </span>
          ))}
        </section>

        <section className="home-services fade-up">
          <div className="home-services__title-wrap">
            <h2 className="home-services__title">CORE SERVICES</h2>
            <span className="home-services__sub">FoodSafeAI Suite</span>
          </div>
          <div className="home-services__grid">
            <article className="home-services__card">
              <h3>01 RISK DETECTION</h3>
              <p>식약처 공개 데이터와 식자재를 교차해 위험 징후를 즉시 탐지합니다.</p>
            </article>
            <article className="home-services__card">
              <h3>02 MENU ENGINE</h3>
              <p>제약 조건 기반으로 대체 메뉴를 생성하고 알레르기 경고를 동시 반영합니다.</p>
            </article>
            <article className="home-services__card">
              <h3>03 PARENT ALERT</h3>
              <p>학부모 화면에 안전 공지와 변경 메뉴를 빠르게 동기화합니다.</p>
            </article>
          </div>
        </section>

        <section className="home-source-grid fade-up">
          <div className="home-source-grid__media">
            <Image src={TERMINAL_IMAGE} alt="학교 급식 메뉴 준비 장면" fill />
          </div>
          <div className="home-source-grid__content">
            <h2>MFDS DATA HUB</h2>
            <p>Public MFDS sources parsed for real-time school meal safety operations.</p>
            {isLoading ? (
              <p>데이터를 불러오는 중입니다.</p>
            ) : (
              <div className="dataset-grid">
                {datasets.length === 0 ? (
                  <article className="dataset-card">
                    <h3>데이터를 불러오지 못했습니다.</h3>
                    <p>네트워크 상태를 확인한 뒤 다시 시도해 주세요.</p>
                  </article>
                ) : (
                  datasets.map((dataset) => (
                    <article className="dataset-card" key={dataset.srvcSn}>
                      <h3>{dataset.serviceName}</h3>
                      <div className="dataset-card__meta">
                        {dataset.category ? <span className="pill-chip">{dataset.category}</span> : null}
                        {dataset.provider ? <span className="pill-chip">{dataset.provider}</span> : null}
                      </div>
                      <p>개방일자: {dataset.openedAt ?? "미확인"}</p>
                      {dataset.usageLink ? (
                        <a
                          className="role-switch__link"
                          href={dataset.usageLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          원문 보기
                        </a>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
