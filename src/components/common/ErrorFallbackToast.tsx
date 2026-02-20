type ErrorFallbackToastProps = {
  message: string;
  visible: boolean;
  mode?: "alert" | "status";
};

export function ErrorFallbackToast({
  message,
  visible,
  mode = "status",
}: ErrorFallbackToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      role={mode}
      aria-live={mode === "alert" ? "assertive" : "polite"}
      className={`notice${mode === "alert" ? " notice--danger" : ""}`}
    >
      {message}
    </div>
  );
}
