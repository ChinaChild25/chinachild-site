import "server-only";

import {
  deliverYandexLeadEvent,
  type ServerLeadTrackingResult,
  type YandexLeadDeliveryInput,
} from "./yandex-metrika-delivery";

type TrackOpts = Omit<YandexLeadDeliveryInput, "env">;
export type { ServerLeadTrackingResult };

export async function trackServerLead(
  opts: TrackOpts = {},
): Promise<ServerLeadTrackingResult> {
  return deliverYandexLeadEvent({ ...opts, env: process.env });
}
