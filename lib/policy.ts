export const launchCategories = [
  "relationships",
  "family boundaries",
  "friendship",
  "roommates",
  "social etiquette",
  "weddings & events",
  "creator collaborations",
  "small informal money disagreements",
] as const;

export const prohibitedCaseSignals = [
  "violent crime allegation",
  "sexual assault or sexual misconduct accusation",
  "child abuse",
  "domestic violence adjudication",
  "active litigation",
  "restraining-order dispute",
  "immigration status",
  "medical diagnosis dispute",
  "intimate imagery",
  "minor as a party",
  "self-harm threat",
  "financial account data",
  "professional malpractice claim",
] as const;

export const hypotheticalIdentifiersToRemove = [
  "full names",
  "handles",
  "employers",
  "addresses",
  "schools",
  "unique photos",
  "phone numbers",
  "license plates",
] as const;
