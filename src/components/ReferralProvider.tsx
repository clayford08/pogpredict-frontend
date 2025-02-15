'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ReferralContextType {
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
}

const ReferralContext = createContext<ReferralContextType>({
  referralCode: null,
  setReferralCode: () => {},
});

export const useReferral = () => useContext(ReferralContext);

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check URL parameters for referral code
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  return (
    <ReferralContext.Provider value={{ referralCode, setReferralCode }}>
      {children}
    </ReferralContext.Provider>
  );
} 