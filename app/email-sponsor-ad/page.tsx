'use client';

import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label/Label';
import LabelError from '@/components/ui/LabelError/LabelError';
import Textarea from '@/components/ui/Textarea';
import { IconLoading } from '@/components/Icons';
import fileUploader from '@/utils/supabase/fileUploader';
import { type EmailSponsorAdConfig } from '@/utils/email-templates/email-sponsor-ad';
import axios from 'axios';
import { type ChangeEvent, useEffect, useState } from 'react';

const emptyConfig: EmailSponsorAdConfig = {
  bannerImageUrl: '',
  bannerLinkUrl: '',
  title: '',
  description: '',
  ctaLinkUrl: '',
  ctaText: 'Learn More ›',
};

export default function EmailSponsorAdPage() {
  const [config, setConfig] = useState<EmailSponsorAdConfig>(emptyConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const refreshPreview = async (nextConfig: EmailSponsorAdConfig) => {
    setIsPreviewLoading(true);
    try {
      const res = await axios.post('/api/email-sponsor-ad?preview=1', nextConfig, { responseType: 'text' });
      setPreviewHtml(res.data);
    } catch {
      setPreviewHtml('');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get('/api/email-sponsor-ad')
      .then(res => {
        setConfig(res.data);
        refreshPreview(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 403) {
          setIsUnavailable(true);
        } else {
          setError('Could not load the current ad settings.');
        }
        setIsLoading(false);
      });
  }, []);

  const handleUploadBanner = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.includes('image')) return;

    setIsUploading(true);
    setError('');
    fileUploader({ files: file, options: 'w=600' }).then(data => {
      if (data?.file) {
        setConfig(current => {
          const nextConfig = { ...current, bannerImageUrl: data.file };
          refreshPreview(nextConfig);
          return nextConfig;
        });
      } else {
        setError('Image upload failed. Please try again.');
      }
      setIsUploading(false);
    });
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Reset the ad back to the original ListingBott version? This will overwrite your saved changes.');
    if (!confirmed) return;

    setIsResetting(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.delete('/api/email-sponsor-ad');
      setConfig(res.data.config);
      setSuccess('Reset to the original ad.');
      await refreshPreview(res.data.config);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not reset the ad.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/email-sponsor-ad', config);
      setSuccess('Saved. The launch reminder email will use this ad on the next send.');
      await refreshPreview(config);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save changes. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="container-custom-screen py-16 flex justify-center">
        <IconLoading className="w-8 h-8 text-orange-500" />
      </section>
    );
  }

  if (isUnavailable) {
    return (
      <section className="container-custom-screen py-16 max-w-2xl">
        <h1 className="text-xl text-slate-50 font-semibold">Email sponsor ad editor</h1>
        <p className="mt-4 text-slate-400">This page is only available when running the app locally in development mode.</p>
      </section>
    );
  }

  return (
    <section className=" max-w-7xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-xl text-slate-50 font-semibold">Email sponsor ad editor</h1>
        <p className="mt-2 text-slate-400">
          Update the sponsored ad block in the launch reminder newsletter. Changes apply locally and are saved to{' '}
          <code className="text-slate-300">data/email-sponsor-ad.json</code>.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/40 p-6">
          <div>
            <Label>Banner image</Label>
            <p className="text-sm text-slate-400 mt-1">Recommended size: 600x300 pixels.</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <label
                htmlFor="banner-upload"
                className="relative block w-full max-w-[300px] aspect-[2/1] cursor-pointer overflow-hidden rounded-lg border border-dashed border-slate-600 bg-slate-900"
              >
                {config.bannerImageUrl ? (
                  <img src={config.bannerImageUrl} alt="Banner preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-sm text-slate-500">No banner yet</span>
                )}
                {isUploading ? <IconLoading className="absolute inset-0 m-auto text-orange-500" /> : null}
              </label>
              <div>
                <Button
                  type="button"
                  className="bg-slate-800 hover:bg-slate-800/50 text-xs"
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  Upload banner
                </Button>
                <input id="banner-upload" type="file" accept="image/*" className="sr-only" onChange={handleUploadBanner} />
              </div>
            </div>
          </div>

          <div>
            <Label>Banner link URL</Label>
            <Input
              className="w-full mt-2"
              placeholder="https://example.com/"
              value={config.bannerLinkUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig(current => ({ ...current, bannerLinkUrl: e.target.value }))}
            />
            <p className="text-sm text-slate-500 mt-1">Where users go when they click the banner image.</p>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              className="w-full mt-2"
              placeholder="Submit Website To Directories with ListingBott"
              value={config.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig(current => ({ ...current, title: e.target.value }))}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className="w-full h-32 mt-2"
              placeholder="Short description shown under the title"
              value={config.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setConfig(current => ({ ...current, description: e.target.value }))}
            />
          </div>

          <div>
            <Label>Button link URL</Label>
            <Input
              className="w-full mt-2"
              placeholder="https://example.com/"
              value={config.ctaLinkUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig(current => ({ ...current, ctaLinkUrl: e.target.value }))}
            />
          </div>

          <div>
            <Label>Button text</Label>
            <Input
              className="w-full mt-2"
              placeholder="Learn More ›"
              value={config.ctaText}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfig(current => ({ ...current, ctaText: e.target.value }))}
            />
          </div>

          <LabelError>{error}</LabelError>
          {success ? <p className="text-sm text-green-400">{success}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" className="w-full sm:flex-1" isLoad={isSaving} onClick={handleSave}>
              Save changes
            </Button>
            <Button type="button" variant="shiny" className="w-full sm:flex-1" isLoad={isResetting} onClick={handleReset}>
              Reset to original ad
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-slate-200">Live preview</h2>
            <Button
              type="button"
              variant="shiny"
              className="text-xs px-3 py-1.5"
              isLoad={isPreviewLoading}
              onClick={() => refreshPreview(config)}
            >
              Refresh preview
            </Button>
          </div>
          <iframe
            title="Email ad preview"
            srcDoc={previewHtml}
            className="w-full min-h-[520px] rounded-lg border border-slate-700 bg-[#1e293b]"
          />
        </div>
      </div>
    </section>
  );
}
