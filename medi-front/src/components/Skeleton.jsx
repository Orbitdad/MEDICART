export function Skeleton({ height = 16, width = "100%" }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 8,
        background:
          "linear-gradient(90deg,#e5e7eb 25%,#f1f5f9 37%,#e5e7eb 63%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.4s ease infinite",
      }}
    />
  );
}
