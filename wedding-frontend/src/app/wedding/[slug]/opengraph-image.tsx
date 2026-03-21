import { ImageResponse } from "next/og";
import { WeddingResponse } from "@/lib/api";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "Wedding Invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Keep it defaulting to Node.js runtime because edge runtime
// sometimes struggles with Docker internal DNS (http://wedding-backend:8080)
// export const runtime = 'edge';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://wedding-backend:8080";

const getFullImageUrl = (path: string | undefined | null) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
};

async function getWeddingData(slug: string): Promise<WeddingResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/weddings/public/${slug}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let dancingScriptData;
  try {
    const fontPath = join(
      process.cwd(),
      "public",
      "fonts",
      "DancingScript-Regular.ttf"
    );
    dancingScriptData = readFileSync(fontPath);
  } catch (error) {
    console.error("Font loading failed:", error);
    // Fallback hoặc xử lý nếu không tìm thấy file
  }

  const wedding = await getWeddingData(slug);

  if (!wedding) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: "#faf8f5",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
          }}
        >
          Thiệp Cưới
        </div>
      ),
      { ...size }
    );
  }

  const primaryColor = wedding.primaryColor || "#d4af37";

  const groomImg = getFullImageUrl(wedding.groomImageUrl);
  const brideImg = getFullImageUrl(wedding.brideImageUrl);
  const fallbackImg = getFullImageUrl(wedding.images?.[0]?.imageUrl);

  // Parse date
  let dateText = "Save The Date";
  if (wedding.weddingDate) {
    const d = new Date(wedding.weddingDate);
    dateText = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${d.getFullYear()}`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#faf8f5",
        }}
      >
        {/* Background Decorative Frame */}
        {/* <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: `2px solid ${primaryColor}`,
            opacity: 0.3,
            borderRadius: 20,
          }}
        /> */}

        {/* <div
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            right: 50,
            bottom: 50,
            border: `1px solid ${primaryColor}`,
            opacity: 0.15,
            borderRadius: 15,
          }}
        /> */}

        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: primaryColor,
            marginBottom: 50,
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Wedding Invitation
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {groomImg ? (
              <img
                src={groomImg}
                width={300}
                height={300}
                style={{
                  borderRadius: 150,
                  objectFit: "cover",
                  border: `8px solid white`,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              />
            ) : fallbackImg ? (
              <img
                src={fallbackImg}
                width={300}
                height={300}
                style={{
                  borderRadius: 150,
                  objectFit: "cover",
                  border: `8px solid white`,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: "#e2e8f0",
                }}
              />
            )}
            <div
              style={{
                fontSize: 80,
                color: primaryColor,
              }}
            >
              {wedding.groomName}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 20px",
            }}
          >
            <span style={{ fontSize: 100 }}>❤️</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {brideImg ? (
              <img
                src={brideImg}
                width={300}
                height={300}
                style={{
                  borderRadius: 150,
                  objectFit: "cover",
                  border: `8px solid white`,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              />
            ) : fallbackImg ? (
              <img
                src={fallbackImg}
                width={300}
                height={300}
                style={{
                  borderRadius: 150,
                  objectFit: "cover",
                  border: `8px solid white`,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: "#e2e8f0",
                }}
              />
            )}
            <div
              style={{
                fontSize: 80,
                color: primaryColor,
              }}
            >
              {wedding.brideName}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "DancingScript",
          data: dancingScriptData!,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
