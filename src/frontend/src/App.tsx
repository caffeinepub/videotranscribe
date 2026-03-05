import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import TranscribeApp from "./components/TranscribeApp";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <TranscribeApp />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.02 265)",
            border: "1px solid oklch(0.28 0.025 265)",
            color: "oklch(0.93 0.02 255)",
          },
        }}
      />
    </div>
  );
}
