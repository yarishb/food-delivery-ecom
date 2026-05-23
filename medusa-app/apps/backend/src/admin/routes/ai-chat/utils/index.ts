export function formatTime(date: Date) {
  return date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Сьогодні";
  if (diffDays === 1) return "Вчора";
  if (diffDays < 7) return `${diffDays} дн. тому`;
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export function generateUid() {
  return Math.random().toString(36).slice(2);
}
