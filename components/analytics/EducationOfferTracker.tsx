"use client";

import { useEffect, useRef } from "react";
import {
  Goals,
  trackEducationOfferEvent,
  type EducationOfferAnalyticsContext,
} from "@/lib/analytics";

export default function EducationOfferTracker({
  context,
}: {
  context: EducationOfferAnalyticsContext;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEducationOfferEvent(Goals.EDUCATION_OFFER_VIEW, context);
  }, [context]);

  return null;
}
