'use client';

import { useState, useEffect } from 'react';
import DashboardPage from './dashboard/page';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Home() {
  const { completedAt, hasSeenWelcome } = useOnboardingStore();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome modal if onboarding is completed but user hasn't seen welcome yet
    if (completedAt && !hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [completedAt, hasSeenWelcome]);

  return (
    <>
      <DashboardPage />
      <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />
    </>
  );
}
