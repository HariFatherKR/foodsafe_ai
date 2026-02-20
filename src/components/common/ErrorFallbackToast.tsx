type ErrorFallbackToastProps = {
  message: string;
  visible: boolean;
};

export function ErrorFallbackToast({
  message,
  visible,
}: ErrorFallbackToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div role="alert" className="notice">
      {message}
    </div>
  );
}
