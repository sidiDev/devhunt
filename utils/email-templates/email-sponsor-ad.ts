import baseTemplate from '@/utils/email-templates/new-tools-launch-reminder-email-template';
import fs from 'fs';
import path from 'path';

export type EmailSponsorAdConfig = {
  bannerImageUrl: string;
  bannerLinkUrl: string;
  title: string;
  description: string;
  ctaLinkUrl: string;
  ctaText: string;
};

const ORIGINAL_TRACKING_URL =
  'https://e.sensorpro.net/run/Url.aspx?m1=DZ.cDUKBhlmH3BaI2T2yTJcPnofJ.HvA8MXi2au8ybQ9CiQVLPztuY.M.Q5ftKxOSZXE4Dv1u-o_hdtd_etha7ae|CjfKiQr3IiFVHIyO-ckQX9..79LMMnnDpOmJ2x1wyeNmiP-t516OELLPrORZ61TF_hdtd_zd&d2=&l1=1085951';

export const DEFAULT_EMAIL_SPONSOR_AD: EmailSponsorAdConfig = {
  bannerImageUrl: 'https://e.sensorpro.net/organization/devhunt/Images/listingbott_banner-2.png',
  bannerLinkUrl: ORIGINAL_TRACKING_URL,
  title: 'Submit Website To Directories with ListingBott',
  description:
    'ListingBott - your SaaS, tool, product, newsletter, or blog listed on 100+ directories in one click, saving you days of work to focus on more creative tasks.',
  ctaLinkUrl: ORIGINAL_TRACKING_URL,
  ctaText: 'Learn More ›',
};

const CONFIG_PATH = path.join(process.cwd(), 'data/email-sponsor-ad.json');

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function isLocalEmailAdEditorEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function getEmailSponsorAdConfig(): EmailSponsorAdConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_EMAIL_SPONSOR_AD, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EMAIL_SPONSOR_AD;
  }
}

export function saveEmailSponsorAdConfig(config: EmailSponsorAdConfig): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
}

export function resetEmailSponsorAdConfig(): EmailSponsorAdConfig {
  saveEmailSponsorAdConfig(DEFAULT_EMAIL_SPONSOR_AD);
  return DEFAULT_EMAIL_SPONSOR_AD;
}

export function applyEmailSponsorAd(template: string, config: EmailSponsorAdConfig = getEmailSponsorAdConfig()): string {
  return template
    .replace(/\{\{adBannerImageUrl\}\}/g, escapeHtml(config.bannerImageUrl))
    .replace(/\{\{adBannerLinkUrl\}\}/g, escapeHtml(config.bannerLinkUrl))
    .replace(/\{\{adTitle\}\}/g, escapeHtml(config.title))
    .replace(/\{\{adDescription\}\}/g, escapeHtml(config.description))
    .replace(/\{\{adCtaLinkUrl\}\}/g, escapeHtml(config.ctaLinkUrl))
    .replace(/\{\{adCtaText\}\}/g, escapeHtml(config.ctaText));
}

export const SPONSOR_AD_START_MARKER = '<!-- START OF SPONSOR AD -->';
export const SPONSOR_AD_END_MARKER = '<!-- END OF SPONSOR AD -->';

export function extractEmailSponsorAdBlock(template: string): string {
  const start = template.indexOf(SPONSOR_AD_START_MARKER);
  const end = template.indexOf(SPONSOR_AD_END_MARKER);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Email template missing sponsor ad markers');
  }
  return template.slice(start + SPONSOR_AD_START_MARKER.length, end).trim();
}

export function renderEmailSponsorAdPreview(config?: EmailSponsorAdConfig): string {
  const template = applyEmailSponsorAd(baseTemplate, config ?? getEmailSponsorAdConfig());
  const block = extractEmailSponsorAdBlock(template);
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body style="margin:0;background-color:#1e293b;">${block}</body></html>`;
}
