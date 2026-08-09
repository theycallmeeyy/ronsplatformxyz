import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

const regions = ['US', 'EU', 'Asia', 'Latin America', 'Africa', 'Oceania'];
const sections = ['Movies', 'TV Shows', 'Anime', 'Manga', 'Live TV', 'Sports', 'Paid', 'Apps'];

export default function RequestSite() {
  const { setCurrentRoute, user } = useAuth();
  const { addSiteRequest } = useContent();

  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [whyAdd, setWhyAdd] = useState('');
  const [regionSectionPairs, setRegionSectionPairs] = useState([{ region: '', section: '' }]);
  const [formStatus, setFormStatus] = useState(null);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return siteUrl.trim() && siteName.trim() && whyAdd.trim();
  }, [siteUrl, siteName, whyAdd]);

  const updatePair = (index, key, value) => {
    setRegionSectionPairs((prev) => prev.map((pair, idx) => (idx === index ? { ...pair, [key]: value } : pair)));
  };

  const addPair = () => {
    setRegionSectionPairs((prev) => [...prev, { region: '', section: '' }]);
  };

  const removePair = (index) => {
    setRegionSectionPairs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Please fill in the required fields.');
      return;
    }

    if (!siteUrl.startsWith('http')) {
      setError('Please enter a valid URL starting with https:// or http://');
      return;
    }

    addSiteRequest({
      siteUrl: siteUrl.trim(),
      siteName: siteName.trim(),
      whyAdd: whyAdd.trim(),
      regionsSections: regionSectionPairs.filter((pair) => pair.region || pair.section),
      createdBy: user?.email || 'anonymous',
      submittedAt: new Date().toISOString()
    });

    setFormStatus('submitted');
    setSiteUrl('');
    setSiteName('');
    setWhyAdd('');
    setRegionSectionPairs([{ region: '', section: '' }]);
  };

  return (
    <div className="pt-24 md:pt-28 px-5 md:px-12 max-w-5xl mx-auto pb-24">
      <button
        onClick={() => setCurrentRoute('home')}
        className="text-xs text-zinc-300 hover:text-white transition-colors mb-6 inline-flex items-center gap-2"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to home
      </button>

      <div className="glass-card rounded-3xl border border-white/10 bg-[#14121d]/90 p-8 shadow-[0_16px_50px_rgba(0,0,0,0.3)]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-purple-200 border border-purple-500/20">
              <span className="material-symbols-outlined text-purple-300">web</span>
              Request a Site
            </div>
            <h1 className="text-3xl font-extrabold text-white">Submit your site request</h1>
            <p className="text-sm text-zinc-300 max-w-2xl">
              Add your recommended streaming site to the catalog. We’ll review submissions and add the best sites to the platform.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white mb-3">What we look for</h2>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li>Working active streaming sites</li>
                  <li>Mobile-friendly interface</li>
                  <li>Good content library</li>
                  <li>Minimal ads/pop-ups</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white mb-3">What we avoid</h2>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li>Broken or offline sites</li>
                  <li>Excessive pop-ups or malware</li>
                  <li>Scam or phishing sites</li>
                  <li>Paid sites unless clearly exceptional</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0f0b1d]/90 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Request form</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Site URL</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Awesome Streaming Site"
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Why should we add it?</label>
                <textarea
                  value={whyAdd}
                  onChange={(e) => setWhyAdd(e.target.value)}
                  rows="4"
                  placeholder="Tell us what makes this site special..."
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.2em]">Regions + Sections</h3>
                  <button
                    type="button"
                    onClick={addPair}
                    className="text-xs font-semibold text-purple-300 hover:text-white transition-colors"
                  >
                    + Add another pair
                  </button>
                </div>

                <div className="space-y-3">
                  {regionSectionPairs.map((pair, index) => (
                    <div key={index} className="grid gap-3 sm:grid-cols-2 items-end">
                      <label className="space-y-2">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.18em]">Select region</span>
                        <select
                          value={pair.region}
                          onChange={(e) => updatePair(index, 'region', e.target.value)}
                          className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        >
                          <option value="">Choose region</option>
                          {regions.map((region) => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.18em]">Select section</span>
                        <select
                          value={pair.section}
                          onChange={(e) => updatePair(index, 'section', e.target.value)}
                          className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        >
                          <option value="">Choose section</option>
                          {sections.map((section) => (
                            <option key={section} value={section}>{section}</option>
                          ))}
                        </select>
                      </label>
                      {regionSectionPairs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePair(index)}
                          className="rounded-full bg-rose-600/10 px-4 py-3 text-xs font-semibold text-rose-200 hover:bg-rose-600/20 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-rose-300">{error}</p>}
              {formStatus === 'submitted' && !error && (
                <p className="text-sm text-emerald-300">Your request has been submitted and is pending review.</p>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm py-3 transition-all disabled:cursor-not-allowed disabled:bg-white/10"
                disabled={!canSubmit}
              >
                Submit request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
