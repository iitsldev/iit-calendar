'use client';

import React, { useState } from 'react';
import ScreenIcon, { ScreenIconName } from './ScreenIcon';

interface TriagePhoneFrameProps {
  screenType: ScreenIconName;
  headerClass: string;
  screenTitle: string;
  screenSubtitle?: string;
  imageSrc: string;
  placeholderPath?: string;
  priority?: boolean;
}

export default function TriagePhoneFrame({
  screenType,
  screenTitle,
  imageSrc,
  placeholderPath,
  priority = false,
}: TriagePhoneFrameProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="triage-phone-frame">
      {/* Screen Body: Shows full screenshot with optimized loading */}
      <div className="phone-screen-content-area">
        {!imageError && imageSrc ? (
          <img
            src={imageSrc}
            alt={`${screenTitle} screen — IIT Calendar mobile app interface`}
            className="phone-real-img"
            width={320}
            height={668}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="phone-screenshot-placeholder">
            <div className="placeholder-icon-circle">
              <ScreenIcon name={screenType} size={28} />
            </div>
            <div className="placeholder-text-meta">
              <span className="placeholder-screen-name">{screenTitle}</span>
              <span className="placeholder-slot-label">Screenshot Placeholder</span>
              <code className="placeholder-path">{placeholderPath || imageSrc}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
