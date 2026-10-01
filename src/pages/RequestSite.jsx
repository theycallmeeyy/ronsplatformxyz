import React, { useState } from 'react';
import { AlertCircle, Check, Link2, Plus, Send, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

const REGIONS = [
  'United States', 'India', 'Russia', 'Germany', 'France', 'Brazil', 'Japan',
  'South Korea', 'Spain', 'Italy', 'Poland', 'Netherlands', 'Portugal',
  'Finland', 'Egypt', 'Kurdistan'
];

const SECTIONS = [
  'Movies & Shows', 'Anime', 'Manga', 'Live TV & Sports', 'Paid', 'Apps'
];

const FIELD_CLASS = 'w-full rounded-lg border border-white/12 bg-[#0b0a10] px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/15';

export default function RequestSite() {
  const { setCurrentRoute, user } = useAuth();
  const { addSiteRequest } = useContent();
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [whyAdd, setWhyAdd] = useState('');
  const [targets, setTargets] = useState([{ region: '', section: '' }]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateTarget = (index, field, value) => {
    setTargets((current) => current.map((target, targetIndex) => (
      targetIndex === index ? { ...target, [field]: value } : target
    )));
  };

  const addTarget = () => setTargets((current) => [...current, { region: '', section: '' }]);
  const removeTarget = (index) => setTargets((current) => current.filter((_, targetIndex) => targetIndex !== index));

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSubmitted(false);

    let normalizedUrl;
    try {
      normalizedUrl = new URL(siteUrl.trim());
      if (!['http:', 'https:'].includes(normalizedUrl.protocol)) throw new Error('Unsupported protocol');
    } catch {
      setError('Enter a valid site URL beginning with https:// or http://.');
      return;
    }

    const validTargets = targets.filter((target) => target.region && target.section);
    if (!validTargets.length) {
      setError('Choose at least one region and section for this site.');
      return;
    }

    addSiteRequest({
      siteUrl: normalizedUrl.href,
      siteName: siteName.trim(),
      whyAdd: whyAdd.trim(),
      regionsSections: validTargets,
      createdBy: user?.email || 'anonymous',
      submittedAt: new Date().toISOString()
    });
    setSiteUrl('');
    setSiteName('');
    setWhyAdd('');
    setTargets([{ region: '', section: '' }]);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen px-4 pb-24 pt-24 text-white sm:px-6 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-white/10 pb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-300">Community submissions</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Request a Site</h1>
          <p className="mt-2 text-sm text-zinc-400">Help us grow the collection with a site worth adding.</p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,0.7fr)]">
          <section className="rounded-xl border border-white/10 bg-[#111016] p-5 sm:p-7" aria-labelledby="request-form-title">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple-500/15 text-purple-300">
                <Link2 size={18} />
              </span>
              <div>
                <h2 id="request-form-title" className="text-base font-semibold">Submit your request</h2>
                <p className="mt-0.5 text-xs text-zinc-500">Provide the site details and where it belongs.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-zinc-300"><Link2 size={14} /> Site URL</span>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(event) => setSiteUrl(event.target.value)}
                    placeholder="https://example.com"
                    className={FIELD_CLASS}
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="block text-xs font-medium text-zinc-300">Site Name</span>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(event) => setSiteName(event.target.value)}
                    placeholder="Awesome Streaming Site"
                    className={FIELD_CLASS}
                    maxLength={80}
                    required
                  />
                </label>
              </div>

              <fieldset className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <legend className="text-xs font-medium text-zinc-300">Where should it go?</legend>
                  <span className="text-[11px] text-zinc-500">Add multiple region and section pairs.</span>
                </div>
                <div className="space-y-2.5">
                  {targets.map((target, index) => (
                    <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_36px] gap-2">
                      <label className="sr-only" htmlFor={`request-region-${index}`}>Region {index + 1}</label>
                      <select
                        id={`request-region-${index}`}
                        value={target.region}
                        onChange={(event) => updateTarget(index, 'region', event.target.value)}
                        className={FIELD_CLASS}
                        required={index === 0}
                      >
                        <option value="">Select region</option>
                        {REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
                      </select>
                      <label className="sr-only" htmlFor={`request-section-${index}`}>Section {index + 1}</label>
                      <select
                        id={`request-section-${index}`}
                        value={target.section}
                        onChange={(event) => updateTarget(index, 'section', event.target.value)}
                        className={FIELD_CLASS}
                        required={index === 0}
                      >
                        <option value="">Select section</option>
                        {SECTIONS.map((section) => <option key={section} value={section}>{section}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeTarget(index)}
                        disabled={targets.length === 1}
                        title="Remove region and section"
                        aria-label={`Remove region and section ${index + 1}`}
                        className="grid h-11 w-9 place-items-center rounded-lg border border-white/10 text-zinc-500 transition hover:border-rose-400/40 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addTarget}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-zinc-300 transition hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-white"
                >
                  <Plus size={15} /> Add another region/section
                </button>
              </fieldset>

              <label className="block space-y-2">
                <span className="flex items-center gap-2 text-xs font-medium text-zinc-300"><Sparkles size={14} /> Why should we add it?</span>
                <textarea
                  value={whyAdd}
                  onChange={(event) => setWhyAdd(event.target.value)}
                  rows={4}
                  placeholder="Tell us what makes this site special: content library, usability, accessibility…"
                  className={`${FIELD_CLASS} resize-y`}
                  maxLength={1000}
                />
              </label>

              {error && <p role="alert" className="flex items-center gap-2 text-sm text-rose-300"><AlertCircle size={16} />{error}</p>}
              {submitted && <p role="status" className="flex items-center gap-2 text-sm text-emerald-300"><Check size={16} />Your request was submitted and is pending review.</p>}

              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
              >
                <Send size={16} /> Submit request
              </button>
            </form>
          </section>

          <aside className="space-y-5" aria-labelledby="guidelines-title">
            <h2 id="guidelines-title" className="border-b border-white/10 pb-3 text-base font-semibold">Submission guidelines</h2>
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-300"><Sparkles size={15} /> We look for</h3>
              <ul className="space-y-2.5 text-sm text-zinc-400">
                <li className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />Working, active sites</li>
                <li className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />A good content library</li>
                <li className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />User-friendly interface</li>
                <li className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />Mobile compatibility</li>
                <li className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />Minimal intrusive ads</li>
              </ul>
            </section>
            <section className="border-t border-white/10 pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-rose-300"><ShieldAlert size={15} /> We avoid</h3>
              <ul className="space-y-2.5 text-sm text-zinc-400">
                <li className="flex gap-2"><AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />Broken or offline sites</li>
                <li className="flex gap-2"><AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />Excessive pop-ups or malware</li>
                <li className="flex gap-2"><AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />Scam or phishing sites</li>
                <li className="flex gap-2"><AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />Paid sites (exceptions apply)</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
