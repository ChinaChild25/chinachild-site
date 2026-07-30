export type Provider =
  | "yandex_webmaster"
  | "yandex_metrika"
  | "google_search_console"
  | "google_analytics";

export type PeriodLabel = "current" | "previous";

export type DateRange = {
  startDate: string;
  endDate: string;
  days: number;
  includesToday: boolean;
};

export type ComparisonRange = {
  current: DateRange;
  previous: DateRange;
};

export type CollectionStatus = "success" | "failed" | "skipped";

export type SourceCollectionMetadata = {
  provider: Provider;
  status: CollectionStatus;
  startedAt: string;
  completedAt: string;
  requestedRanges: ComparisonRange;
  actualRanges?: Partial<Record<PeriodLabel, { startDate: string; endDate: string }>>;
  requestCount: number;
  recordCount: number;
  warnings: string[];
  limitations: string[];
  sampling?: Array<{
    view: string;
    period: PeriodLabel;
    sampled?: boolean;
    sampleShare?: number;
    dataLossFromOtherRow?: boolean;
    subjectToThresholding?: boolean;
  }>;
  error?: string;
};

export type SearchPerformanceRecord = {
  provider: "yandex_webmaster" | "google_search_console";
  searchEngine: "yandex" | "google";
  view: "daily" | "query" | "page" | "device" | "detail" | "popular_query";
  period: PeriodLabel;
  date?: string;
  dateRange: { startDate: string; endDate: string };
  query?: string;
  page?: string;
  device?: string;
  country?: string;
  clicks: number;
  impressions: number;
  ctr: number | null;
  averagePosition: number | null;
  sourceMetadata: {
    aggregation: string;
    topRowsOnly: boolean;
    averageClickPosition?: number | null;
    queryId?: string;
    sortedBy?: string[];
    returnedDateRange?: { startDate: string; endDate: string };
    rawQueryText?: string;
    queryTargetHost?: string;
    queryTargetSource?: "query_text_suffix";
  };
};

export type TrafficRecord = {
  provider: "yandex_metrika" | "google_analytics";
  searchEngine: "yandex" | "google" | "other" | "total_search";
  view: "total" | "daily" | "landing_page" | "source" | "device";
  period: PeriodLabel;
  date?: string;
  dateRange: { startDate: string; endDate: string };
  landingPage?: string;
  source?: string;
  sourceMedium?: string;
  device?: string;
  visits?: number;
  users?: number;
  sessions?: number;
  activeUsers?: number;
  newUsers?: number;
  engagedSessions?: number;
  engagementRate?: number;
  averageEngagementSecondsPerActiveUser?: number | null;
  bounceRate?: number;
  pageDepth?: number;
  averageVisitDurationSeconds?: number;
  conversions?: number;
  sourceMetadata: {
    metricSemantics: Record<string, string>;
    aggregation: string;
    sampled?: boolean;
    sampleShare?: number;
  };
};

export type GoalRecord = {
  provider: "yandex_metrika" | "google_analytics";
  period: PeriodLabel;
  dateRange: { startDate: string; endDate: string };
  goalId?: string;
  goalName: string;
  goalType?: string;
  searchEngine?: "yandex" | "google" | "other" | "total_search";
  conversions: number;
  sourceMetadata: {
    metric: string;
    configuredAsKeyEvent?: boolean;
    repositoryDocumentedCandidate?: boolean;
  };
};

export type TechnicalRecord = {
  provider: "yandex_webmaster";
  type:
    | "site_summary"
    | "diagnostic"
    | "indexing"
    | "pages_in_search"
    | "broken_internal_link"
    | "broken_internal_link_history"
    | "external_link"
    | "external_link_history"
    | "sqi";
  date?: string;
  metric?: string;
  value?: number | string | boolean | null;
  sourceUrl?: string;
  destinationUrl?: string;
  severity?: string;
  state?: string;
  sourceMetadata: Record<string, unknown>;
};

export type NormalizedCollection = {
  schemaVersion: 1;
  runId: string;
  generatedAt: string;
  requestedRanges: ComparisonRange;
  searchPerformance: SearchPerformanceRecord[];
  traffic: TrafficRecord[];
  goals: GoalRecord[];
  technical: TechnicalRecord[];
  sourceMetadata: SourceCollectionMetadata[];
  configuredCommercialQueries: string[];
  notes: string[];
};

export type SourceResult = {
  provider: Provider;
  raw: Record<string, unknown>;
  searchPerformance?: SearchPerformanceRecord[];
  traffic?: TrafficRecord[];
  goals?: GoalRecord[];
  technical?: TechnicalRecord[];
  metadata: SourceCollectionMetadata;
  diagnostics?: Record<string, unknown>;
};

export type CheckItem = {
  provider: Provider;
  status: "ok" | "error" | "missing";
  message: string;
  details?: string[];
};
