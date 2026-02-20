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
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80";
const STORY_IMAGE_ONE =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80";
const STORY_IMAGE_TWO =
  "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80";

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

        <section className="hero-card fade-up">
          <div className="hero-card__content">
            <span className="hero-card__eyebrow">급식 안전 운영 스토리</span>
            <h1>급식 안전을 운영과 소통까지 한 화면에서 관리합니다.</h1>
            <p>
              식약처 공개 데이터 기반으로 영양사의 대응 단계를 정리하고, 학부모에게
              결과를 이해하기 쉽게 전달하는 클린 헬스케어 경험을 제공합니다.
            </p>
            <div className="input-row">
              <Link className="btn-primary" href="/nutritionist">
                운영 화면 시작
              </Link>
              <Link className="btn-secondary" href="/parent">
                학부모 화면 보기
              </Link>
            </div>
          </div>
          <div className="hero-card__media">
            <Image src={HERO_IMAGE} alt="급식 안전 운영 이미지" fill priority />
          </div>
        </section>

        <section className="story-grid">
          <article className="story-panel story-panel--image fade-up">
            <Image
              src={STORY_IMAGE_ONE}
              alt="건강한 급식 재료 이미지"
              width={720}
              height={480}
            />
          </article>
          <article className="story-panel fade-up">
            <h2>운영 스토리</h2>
            <p>
              영양사는 식자재 등록부터 위험도 확인, 메뉴 대체안 구성, 공지 발행까지
              하나의 흐름으로 수행합니다.
            </p>
            <p>
              각 단계는 실무 순서로 배치되어 데모 상황에서도 빠르게 설명할 수
              있습니다.
            </p>
          </article>
          <article className="story-panel fade-up">
            <h2>소통 스토리</h2>
            <p>
              학부모 화면은 오늘 안전 상태, 주요 공지, 메뉴 정보를 상단부터 순차적으로
              보여주어 확인 부담을 줄입니다.
            </p>
          </article>
          <article className="story-panel story-panel--image fade-up">
            <Image
              src={STORY_IMAGE_TWO}
              alt="병원형 위생 주방 이미지"
              width={720}
              height={480}
            />
          </article>
        </section>

        <section className="story-panel fade-up">
          <h2>해커톤 데모 시나리오</h2>
          <div className="flow-guide">
            <article className="flow-step">
              <span className="flow-step__index">단계 1</span>
              <h3>영양사 화면에서 식자재 점검</h3>
              <p>식자재 등록 후 위해도 검사를 실행해 위험 이벤트를 즉시 확인합니다.</p>
            </article>
            <article className="flow-step">
              <span className="flow-step__index">단계 2</span>
              <h3>대체 메뉴 생성 및 공지 발행</h3>
              <p>조건 기반으로 메뉴를 생성하고 학부모에게 안전 공지를 발행합니다.</p>
            </article>
            <article className="flow-step">
              <span className="flow-step__index">단계 3</span>
              <h3>학부모 화면에서 즉시 확인</h3>
              <p>학부모는 위험 공지, 메뉴, 알레르기 정보를 순서대로 확인합니다.</p>
            </article>
          </div>
        </section>

        <section className="story-panel fade-up">
          <h2>MFDS 공개 데이터 하이라이트</h2>
          <p>
            아래 목록은 지정한 식약처 공공데이터 페이지를 파싱해 가져온 최신 항목입니다.
          </p>
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
                      <a className="role-switch__link" href={dataset.usageLink} target="_blank" rel="noreferrer">
                        원문 보기
                      </a>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
