import { useEffect, useRef } from "react";

export function ComingSoonScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 99, 255, ${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f13",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Particle canvas background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Ambient glow blobs */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          animation: "blob-pulse 6s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)",
          bottom: "15%",
          right: "10%",
          animation: "blob-pulse 8s ease-in-out infinite reverse",
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes blob-pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.8; }
          50% { transform: translateX(-50%) scale(1.15); opacity: 1; }
        }
        @keyframes orb-glow {
          0%, 100% { box-shadow: 0 0 40px 12px rgba(108,99,255,0.35), 0 0 80px 30px rgba(108,99,255,0.15); }
          50% { box-shadow: 0 0 60px 20px rgba(108,99,255,0.55), 0 0 120px 50px rgba(108,99,255,0.25); }
        }
        @keyframes orb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orb-spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes line-expand {
          from { width: 0; opacity: 0; }
          to { width: 120px; opacity: 1; }
        }
        @keyframes progress-bar {
          0% { width: 0%; }
          60% { width: 75%; }
          80% { width: 82%; }
          100% { width: 90%; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          padding: "0 24px",
          maxWidth: 520,
          width: "100%",
        }}
      >
        {/* Animated orb */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #9b94ff, #6c63ff 60%, #3a3180)",
            animation: "orb-glow 3s ease-in-out infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginBottom: 36,
          }}
        >
          {/* Outer spinning ring */}
          <div
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: "50%",
              border: "1.5px solid rgba(108,99,255,0.25)",
              borderTopColor: "rgba(108,99,255,0.7)",
              animation: "orb-spin 3s linear infinite",
            }}
          />
          {/* Inner spinning ring */}
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: "1px solid rgba(108,99,255,0.15)",
              borderBottomColor: "rgba(108,99,255,0.5)",
              animation: "orb-spin-reverse 2s linear infinite",
            }}
          />
          {/* Icon inside orb */}
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Arabic Scholar Translator logo"
            style={{ opacity: 0.9 }}
          >
            <title>Arabic Scholar Translator</title>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Main heading */}
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 42px)",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            margin: 0,
            animation: "fade-up 0.8s ease forwards",
            animationDelay: "0.1s",
            opacity: 0,
          }}
        >
          Something is Coming...
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(15px, 3vw, 18px)",
            color: "#a09cc7",
            textAlign: "center",
            marginTop: 12,
            marginBottom: 0,
            fontWeight: 500,
            letterSpacing: "0.01em",
            animation: "fade-up 0.8s ease forwards",
            animationDelay: "0.25s",
            opacity: 0,
          }}
        >
          Mr. Sayed Hamza is on Work
        </p>

        {/* Animated divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 28,
            marginBottom: 28,
            animation: "fade-up 0.8s ease forwards",
            animationDelay: "0.4s",
            opacity: 0,
          }}
        >
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(108,99,255,0.6))",
              animation: "line-expand 1.2s ease forwards",
              animationDelay: "0.6s",
              width: 0,
              opacity: 0,
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#6c63ff",
              boxShadow: "0 0 10px 3px rgba(108,99,255,0.6)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to left, transparent, rgba(108,99,255,0.6))",
              animation: "line-expand 1.2s ease forwards",
              animationDelay: "0.6s",
              width: 0,
              opacity: 0,
            }}
          />
        </div>

        {/* Patience message */}
        <p
          style={{
            fontSize: "clamp(13px, 2.5vw, 15px)",
            color: "#706a9c",
            textAlign: "center",
            margin: 0,
            animation: "fade-up 0.8s ease forwards",
            animationDelay: "0.55s",
            opacity: 0,
          }}
        >
          Goodbye, have some patience 🙏
        </p>

        {/* Bouncing dots loader */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 36,
            animation: "fade-up 0.8s ease forwards",
            animationDelay: "0.7s",
            opacity: 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#6c63ff",
                animation: "dot-bounce 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            maxWidth: 320,
            marginTop: 20,
            animation: "fade-up 0.8s ease forwards",
            animationDelay: "0.8s",
            opacity: 0,
          }}
        >
          <div
            style={{
              height: 3,
              background: "rgba(108,99,255,0.12)",
              borderRadius: 9999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(to right, #6c63ff, #9b94ff)",
                borderRadius: 9999,
                animation: "progress-bar 8s ease forwards",
                animationDelay: "1s",
                width: 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Branding footer */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          zIndex: 1,
          animation: "fade-up 1s ease forwards",
          animationDelay: "1s",
          opacity: 0,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(108,99,255,0.5)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: 0,
            fontWeight: 600,
          }}
        >
          Arabic Scholar Translator
        </p>
        <p
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.15)",
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Made by Sayed Hamza Salafi 💙
        </p>
      </div>
    </div>
  );
}
