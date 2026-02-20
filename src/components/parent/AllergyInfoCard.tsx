type AllergyInfoCardProps = {
  items: string[];
};

export function AllergyInfoCard({ items }: AllergyInfoCardProps) {
  return (
    <section className="story-panel fade-up">
      <h2>알레르기 주의 정보</h2>
      {items.length === 0 ? (
        <p>현재 등록된 알레르기 주의 항목이 없습니다.</p>
      ) : (
        <ul className="list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
