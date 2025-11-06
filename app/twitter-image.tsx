import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Blockchain Pioneer Student UTC";
export const size = {
  width: 1200,
  height: 600,
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
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "white",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "15px",
            }}
          >
            <div
              style={{
                fontSize: "30px",
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
                fontSize: "36px",
                fontWeight: "bold",
                color: "white",
                lineHeight: 1,
              }}
            >
              Blockchain Pioneer Student
            </div>
            <div
              style={{
                fontSize: "18px",
                color: "rgba(255, 255, 255, 0.8)",
                marginTop: "6px",
              }}
            >
              UTC - Blockchain Club
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            color: "white",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.3,
            marginBottom: "30px",
          }}
        >
          Learn, grow, and apply Blockchain & Web3
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "30px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "16px",
            }}
          >
            🏆 Hackathon
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "16px",
            }}
          >
            📚 Courses
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "16px",
            }}
          >
            🤝 Community
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              fontSize: "16px",
            }}
          >
            💡 Creativity
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            fontSize: "16px",
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
