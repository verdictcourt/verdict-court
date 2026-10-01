export const caseStatuses = [
  "draft",
  "bench_review",
  "changes_requested",
  "respondent_pending",
  "record_lock",
  "deliberating",
  "verdict_ready",
  "closed",
  "rejected",
  "disabled",
] as const;

export type CaseStatus = (typeof caseStatuses)[number];
export type CaseMode = "public_two_sided" | "hypothetical";

const transitions: Record<CaseStatus, readonly CaseStatus[]> = {
  draft: ["bench_review"],
  bench_review: ["changes_requested", "respondent_pending", "record_lock", "rejected", "disabled"],
  changes_requested: ["bench_review", "rejected"],
  respondent_pending: ["bench_review", "record_lock", "rejected", "disabled"],
  record_lock: ["deliberating", "disabled"],
  deliberating: ["verdict_ready", "disabled"],
  verdict_ready: ["closed", "disabled"],
  closed: [],
  rejected: [],
  disabled: ["bench_review", "closed"],
};

export type TransitionContext = {
  mode: CaseMode;
  respondentConsented: boolean;
  benchApproved: boolean;
  recordLocked: boolean;
};

export function canTransition(from: CaseStatus, to: CaseStatus, context: TransitionContext) {
  if (!transitions[from].includes(to)) return false;
  if (["respondent_pending", "record_lock", "deliberating", "verdict_ready", "closed"].includes(to) && !context.benchApproved) return false;
  if (context.mode === "public_two_sided" && ["record_lock", "deliberating", "verdict_ready", "closed"].includes(to) && !context.respondentConsented) return false;
  if (["deliberating", "verdict_ready", "closed"].includes(to) && !context.recordLocked) return false;
  return true;
}
