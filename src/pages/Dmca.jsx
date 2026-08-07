import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dmca() {
  const { setCurrentRoute } = useAuth();

  return (
    <div className="pt-24 md:pt-28 px-5 md:px-12 max-w-7xl mx-auto pb-24">
      <div className="glass-card rounded-3xl border border-white/10 bg-[#0f0b1d]/80 shadow-[0_16px_50px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-fuchsia-600 p-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">DMCA Policy</h1>
          <p className="mt-4 text-sm md:text-base text-zinc-200 max-w-3xl mx-auto">
            Copyright infringement is taken seriously at Ronkws. If you believe your intellectual property rights have been violated, please submit a proper DMCA request and we will respond promptly.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="glass-card rounded-3xl border border-white/10 bg-[#14121d]/80 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">DMCA Overview</h2>
            <p className="text-sm text-zinc-300 leading-7">
              We take intellectual property rights seriously and comply with the Digital Millennium Copyright Act (DMCA). At Ronkws, our team evaluates all takedown notices promptly. If you believe content hosted or linked by the service infringes your copyright, submit a valid notice and we will act in accordance with the law.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="glass-card rounded-3xl border border-white/10 bg-[#14121d]/80 p-6">
              <h3 className="text-base font-semibold text-white mb-3">Review</h3>
              <p className="text-sm text-zinc-300 leading-7">We review all DMCA requests carefully and verify that they meet the legal requirements.</p>
            </div>
            <div className="glass-card rounded-3xl border border-white/10 bg-[#14121d]/80 p-6">
              <h3 className="text-base font-semibold text-white mb-3">Verify</h3>
              <p className="text-sm text-zinc-300 leading-7">We verify that all required information is included and that the claim appears valid.</p>
            </div>
            <div className="glass-card rounded-3xl border border-white/10 bg-[#14121d]/80 p-6">
              <h3 className="text-base font-semibold text-white mb-3">Action</h3>
              <p className="text-sm text-zinc-300 leading-7">If the notice is valid, we remove or disable access to the infringing material without delay.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/10 bg-[#14121d]/80 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">DMCA Request Requirements</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-white mb-2">Description of Copyrighted Work</p>
                <p className="text-sm text-zinc-300 leading-7">Provide a description of the copyrighted work that you claim has been infringed.</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Location of Infringing Material</p>
                <p className="text-sm text-zinc-300 leading-7">Include the URL(s) or location of material that is infringing your copyright.</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Your Contact Information</p>
                <p className="text-sm text-zinc-300 leading-7">Your name, email address, mailing address, and telephone number.</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Good Faith Statement</p>
                <p className="text-sm text-zinc-300 leading-7">A statement that you believe in good faith the use is not authorized by the copyright owner.</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Accuracy Statement</p>
                <p className="text-sm text-zinc-300 leading-7">A statement that the information is accurate and you are authorized to act on behalf of the owner.</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Legal Accountability Statement</p>
                <p className="text-sm text-zinc-300 leading-7">A statement that submitting a false DMCA request may result in legal consequences.</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Signature</p>
                <p className="text-sm text-zinc-300 leading-7">Your electronic or physical signature, or that of an authorized agent.</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/10 bg-[#14121d]/80 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Submit DMCA Request</h2>
            <p className="text-sm text-zinc-300 leading-7 mb-4">
              Send your DMCA request to our designated contact email below. Include all required details so we can process your request quickly.
            </p>
            <a
              href="mailto:aarontemple44@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition-all"
            >
              contact@aarontemple44@gmail.com
            </a>
          </div>

          <div className="text-center text-xs text-zinc-500 py-6 border-t border-white/10">
            <p>Copyright © {new Date().getFullYear()} Ronkws. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
