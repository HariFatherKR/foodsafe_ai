type PublishNoticeButtonProps = {
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
};

export function PublishNoticeButton({
  onClick,
  disabled,
  loading = false,
}: PublishNoticeButtonProps) {
  return (
    <button className="btn-primary" type="button" onClick={onClick} disabled={disabled || loading}>
      {loading ? "공지 발행 중..." : "학부모 공지 발행"}
    </button>
  );
}
