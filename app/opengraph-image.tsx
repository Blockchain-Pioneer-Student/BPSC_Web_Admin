import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Blockchain Pioneer Student UTC";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #004987 0%, #0070b8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "white",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "20px",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                fontWeight: "bold",
                color: "#004987",
              }}
            >
              B
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
                lineHeight: 1,
              }}
            >
              Blockchain Pioneer Student
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "rgba(255, 255, 255, 0.8)",
                marginTop: "8px",
              }}
            >
              University of Transport and Communications
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "white",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Where students learn, grow, and apply Blockchain technology
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "20px",
            }}
          >
            🏆 Hackathon
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "20px",
            }}
          >
            📚 Courses
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "20px",
            }}
          >
            🤝 Community
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          blockchain-utc.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
