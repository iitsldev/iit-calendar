import React from 'react';

// Store links can be updated to point to live store listings
export const STORE_LINKS = {
  appleAppStore: 'https://apps.apple.com/app/iit-calendar/id6470000000',
  googlePlayStore: 'https://play.google.com/store/apps/details?id=com.iitcalendar.applet&pcampaignid=web_share',
  gitHub: 'https://github.com/iitsldev/iit-calendar',
};

interface StoreButtonsProps {
  className?: string;
}

export const AppleStoreButton: React.FC<{ url?: string; className?: string; id?: string }> = ({
  url = STORE_LINKS.appleAppStore,
  className = '',
  id = 'cta-apple-app-store',
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`store-badge ${className}`}
      aria-label="Download IIT Calendar on the Apple App Store"
      id={id}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.76 1.04-1.81.93-2.87-.9.04-2 .6-2.65 1.36-.57.66-1.07 1.73-.93 2.76 1.01.08 2.03-.49 2.65-1.25z" />
      </svg>
      <div className="store-badge-text">
        <span className="store-badge-sub">Download on the</span>
        <span className="store-badge-main">App Store</span>
      </div>
    </a>
  );
};

export const GooglePlayButton: React.FC<{ url?: string; className?: string; id?: string }> = ({
  url = STORE_LINKS.googlePlayStore,
  className = '',
  id = 'cta-google-play-store',
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`store-badge ${className}`}
      aria-label="Get IIT Calendar on Google Play"
      id={id}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.37-.61-.9-.61-1.492V3.306c0-.592.24-1.122.609-1.492zm11.242 11.245l2.296 2.296-12.08 6.945 9.784-9.241zm2.984-1.747c.563.324.915.912.915 1.688s-.352 1.364-.915 1.688l-2.029 1.168-2.584-2.584 2.584-2.584 2.029 1.168zm-2.984-1.747L5.067 2.327l12.08 6.945-2.296 2.293z" />
      </svg>
      <div className="store-badge-text">
        <span className="store-badge-sub">GET IT ON</span>
        <span className="store-badge-main">Google Play</span>
      </div>
    </a>
  );
};

export const StoreButtons: React.FC<StoreButtonsProps> = ({
  className = '',
}) => {
  return (
    <div className={`store-actions ${className}`}>
      <AppleStoreButton />
      <GooglePlayButton />
    </div>
  );
};
