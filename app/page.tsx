'use client';
import { useState } from 'react';

export default function Page() {
  // If you don’t have a preview image yet, you can set this to '' and it will hide.
  const previewSrc = '/hero-preview.png'; // put a real file in /public or leave '' to hide

  const [showPreview, setShowPreview] = useState(Boolean(previewSrc));

  return (
    <main>
      <section className="container hero">
        <div className="hero-grid">
          {/* LEFT: copy */}
          <div>
            {/* If you have a brand image, render it here (guard with a src check) */}
            {/* {logoSrc && <img src={logoSrc} alt="BuyerPref" style={{height: 32}} />} */}

            <h1>One link to collect buyer preferences. Instant summary + match score.</h1>
            <p className="lead">
              Stop chasing vague texts. Send a single link, get structured answers, auto-summarized
              with a score so you can prioritize.
            </p>

            <div className="row">
              <a className="btn btn-primary" href="/join">Create my form</a>
              <a className="btn btn-ghost" href="/form/0455136e-693c-4acc-b40c-aa2052669753">See a sample</a>
            </div>
          </div>

          {/* RIGHT: preview image (hidden if it fails to load or you don't have one yet) */}
          <div>
            {showPreview && previewSrc ? (
              <img
                src={previewSrc}
                alt="BuyerPref preview"
                onError={() => setShowPreview(false)}
                style={{ borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,.08)' }}
              />
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
// app/page.tsx
const previewSrc = ''; // no image for now – the right column hides itself
