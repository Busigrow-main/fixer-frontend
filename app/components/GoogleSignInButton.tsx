"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";

type Props = {
  onCredential: (idToken: string) => Promise<void>;
  disabled?: boolean;
};

export default function GoogleSignInButton({ onCredential, disabled }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!clientId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-outline" />
        <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant">
          Or
        </span>
        <div className="h-px flex-1 bg-outline" />
      </div>

      <div
        className={`flex justify-center ${disabled || busy ? "pointer-events-none opacity-50" : ""}`}
      >
        <GoogleLogin
          onSuccess={(response) => {
            if (!response.credential) {
              setError("Google did not return a sign-in token.");
              return;
            }
            setBusy(true);
            setError("");
            void onCredential(response.credential)
              .catch((err: unknown) => {
                setError(
                  err instanceof Error ? err.message : "Google sign-in failed",
                );
              })
              .finally(() => setBusy(false));
          }}
          onError={() => setError("Google sign-in was cancelled or failed.")}
          useOneTap={false}
          theme="outline"
          size="large"
          shape="pill"
          text="continue_with"
          width={320}
        />
      </div>

      {error && (
        <p className="text-center text-xs font-bold text-error">{error}</p>
      )}
    </div>
  );
}
