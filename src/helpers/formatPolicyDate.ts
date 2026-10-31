const FORMAT = new Intl.DateTimeFormat("fr-CA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// The ACF date picker comes through as "20261030", "2026-10-30" or a full
// ISO date depending on its settings; anything else is shown as typed
export const formatPolicyDate = (value: string | null | undefined): string | null => {
  if (!value?.trim()) return null;
  const match = value.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
  if (!match) return value.trim();
  const [, year, month, day] = match;
  return FORMAT.format(new Date(Date.UTC(+year, +month - 1, +day)));
};
