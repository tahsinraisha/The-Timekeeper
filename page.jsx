import dynamic from "next/dynamic";

// Canvas & Three.js cannot run on the server — load entirely client-side
const TimekeeperExperience = dynamic(
  () => import("../components/TimekeeperExperience"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "24px",
          color: "#C9A84C",
          fontFamily: "'Courier New', monospace",
          letterSpacing: "0.3em",
          fontSize: "11px",
          textTransform: "uppercase",
        }}
      >
        {/* Spinning clock ring loader */}
        <div
          style={{
            width: 64,
            height: 64,
            border: "1px solid #C9A84C",
            borderTop: "1px solid transparent",
            borderRadius: "50%",
            animation: "spin 1.2s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ opacity: 0.6 }}>Loading Experience</span>
      </div>
    ),
  }
);

export default function Home() {
  return <TimekeeperExperience />;
}
