type PublishNoticeButtonProps = {
  onClick: () => void;
  disabled: boolean;
};

export function PublishNoticeButton({
  onClick,
  disabled,
}: PublishNoticeButtonProps) {
  return (
    <button className="btn-primary" type="button" onClick={onClick} disabled={disabled}>
      학부모 공지 발행
    </button>
  );
}
