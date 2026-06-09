import {
  type EmailSponsorAdConfig,
  getEmailSponsorAdConfig,
  isLocalEmailAdEditorEnabled,
  renderEmailSponsorAdPreview,
  resetEmailSponsorAdConfig,
  saveEmailSponsorAdConfig,
} from '@/utils/email-templates/email-sponsor-ad';
import { NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('This editor is only available in local development.', { status: 403 });
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeConfig(body: Partial<EmailSponsorAdConfig>): EmailSponsorAdConfig | null {
  const bannerImageUrl = body.bannerImageUrl?.trim();
  const bannerLinkUrl = body.bannerLinkUrl?.trim();
  const title = body.title?.trim();
  const description = body.description?.trim();
  const ctaLinkUrl = body.ctaLinkUrl?.trim();
  const ctaText = body.ctaText?.trim();

  if (!bannerImageUrl || !bannerLinkUrl || !title || !description || !ctaLinkUrl || !ctaText) {
    return null;
  }

  if (!isValidUrl(bannerImageUrl) || !isValidUrl(bannerLinkUrl) || !isValidUrl(ctaLinkUrl)) {
    return null;
  }

  return {
    bannerImageUrl,
    bannerLinkUrl,
    title,
    description,
    ctaLinkUrl,
    ctaText,
  };
}

export async function GET(req: Request) {
  if (!isLocalEmailAdEditorEnabled()) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('preview') === '1') {
    return new NextResponse(renderEmailSponsorAdPreview(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  return NextResponse.json(getEmailSponsorAdConfig());
}

export async function POST(req: Request) {
  if (!isLocalEmailAdEditorEnabled()) {
    return unauthorized();
  }

  const body = (await req.json()) as Partial<EmailSponsorAdConfig>;
  const config = normalizeConfig(body);

  if (!config) {
    return NextResponse.json({ error: 'Please fill in all fields with valid URLs.' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('preview') === '1') {
    return new NextResponse(renderEmailSponsorAdPreview(config), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  saveEmailSponsorAdConfig(config);

  return NextResponse.json({ success: true, config });
}

export async function DELETE() {
  if (!isLocalEmailAdEditorEnabled()) {
    return unauthorized();
  }

  const config = resetEmailSponsorAdConfig();
  return NextResponse.json({ success: true, config });
}
