import "server-only";

export type CareerAttachment = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export type CareerApplication = {
  id: string;
  careerSlug: string;
  name: string;
  phone: string;
  email: string;
  experience?: string;
  salaryExpectations?: string;
  comment?: string;
  portfolioUrl?: string;
  sourcePage?: string;
  referrer?: string;
  utm: Record<string, string>;
  acceptedAt: string;
  consentVersion: string;
  ipHash: string;
  userAgent?: string;
  attachments: CareerAttachment[];
};
