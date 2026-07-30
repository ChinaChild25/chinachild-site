import type { ComparisonRange, DateRange } from "./types.mts";

const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function utcDate(value: string, label: string): Date {
  if (!ISO_DATE.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} is not a valid calendar date`);
  }
  return parsed;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function countInclusiveDays(startDate: string, endDate: string): number {
  const start = utcDate(startDate, "start date");
  const end = utcDate(endDate, "end date");
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

export function buildComparisonRange(
  options: { days?: number; startDate?: string; endDate?: string },
  now = new Date(),
): ComparisonRange {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const yesterday = addDays(today, -1);

  let start: Date;
  let end: Date;

  if (options.startDate || options.endDate) {
    if (!options.startDate || !options.endDate) {
      throw new Error("--start and --end must be provided together");
    }
    if (options.days !== undefined) {
      throw new Error("--days cannot be combined with --start/--end");
    }
    start = utcDate(options.startDate, "--start");
    end = utcDate(options.endDate, "--end");
  } else {
    const days = options.days ?? 90;
    if (!Number.isInteger(days) || days < 1 || days > 480) {
      throw new Error("--days must be an integer from 1 to 480");
    }
    end = yesterday;
    start = addDays(end, -(days - 1));
  }

  if (start > end) {
    throw new Error("start date must not be after end date");
  }
  if (end > today) {
    throw new Error("end date must not be in the future");
  }

  const days = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (days > 480) {
    throw new Error("date range must not exceed 480 days");
  }

  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(days - 1));
  const current: DateRange = {
    startDate: iso(start),
    endDate: iso(end),
    days,
    includesToday: end.getTime() === today.getTime(),
  };
  const previous: DateRange = {
    startDate: iso(previousStart),
    endDate: iso(previousEnd),
    days,
    includesToday: false,
  };

  return { current, previous };
}

export function deriveEffectiveComparisonRange(
  requested: ComparisonRange,
  latestCompleteDate: string,
): ComparisonRange {
  const requestedStart = utcDate(
    requested.current.startDate,
    "requested current start",
  );
  const requestedEnd = utcDate(
    requested.current.endDate,
    "requested current end",
  );
  const latest = utcDate(latestCompleteDate, "latest complete date");
  const effectiveEnd = latest < requestedEnd ? latest : requestedEnd;
  if (effectiveEnd < requestedStart) {
    throw new Error(
      `No complete provider data is available on or after ${requested.current.startDate}`,
    );
  }

  const days =
    Math.round((effectiveEnd.getTime() - requestedStart.getTime()) / DAY_MS) + 1;
  const previousEnd = addDays(requestedStart, -1);
  const previousStart = addDays(previousEnd, -(days - 1));
  return {
    current: {
      startDate: iso(requestedStart),
      endDate: iso(effectiveEnd),
      days,
      includesToday: false,
    },
    previous: {
      startDate: iso(previousStart),
      endDate: iso(previousEnd),
      days,
      includesToday: false,
    },
  };
}

export function dateOnly(value: string): string {
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (!match) throw new Error(`API date is invalid: ${value}`);
  utcDate(match[0], "API date");
  return match[0];
}
