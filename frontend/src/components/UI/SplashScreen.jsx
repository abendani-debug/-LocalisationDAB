import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2400);
    const doneTimer = setTimeout(() => onDone(), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <img
        src="/logo.png"
        alt="localiseMyDab"
        className="w-64 h-auto object-contain"
      />
    </div>
  );
}
