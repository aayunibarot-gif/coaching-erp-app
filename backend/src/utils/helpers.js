export function computeAttendanceStatus(percent) {
  return percent < 75 ? "Warning: Low attendance" : "Good attendance";
}

export function computeMarksLevel(score) {
  if (score < 40) return "Weak";
  if (score <= 70) return "Average";
  return "Good";
}

export function computeTrend(scores) {
  if (!scores || scores.length < 2) return "Stable";
  const first = scores[0];
  const last = scores[scores.length - 1];
  if (last > first) return "Improving";
  if (last < first) return "Declining";
  return "Stable";
}
