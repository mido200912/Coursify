import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      console.warn("YOUTUBE_API_KEY is missing");
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query + " tutorial"
      )}&key=${YOUTUBE_API_KEY}&maxResults=5&type=video&videoEmbeddable=true&videoDuration=medium`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch from YouTube");
    }

    const data = await res.json();
    const videoIds: string[] = data.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];

    if (videoIds.length === 0) {
       return NextResponse.json({ videos: [] }, { status: 200 });
    }

    // Secondary fetch to get video durations
    const videoDetailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`
    );

    let videos: { videoId: string, duration: string }[] = [];

    if (videoDetailsRes.ok) {
       const detailsData = await videoDetailsRes.json();
       videos = detailsData.items.map((item: any) => {
          let durationStr = "Unknown";
          const match = item.contentDetails?.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          if (match) {
             const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
             const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
             const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
             if (hours > 0) {
               durationStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
             } else {
               durationStr = `${minutes}:${seconds.toString().padStart(2, '0')} min`;
             }
          }
          return { videoId: item.id, duration: durationStr };
       });
    } else {
       // fallback if secondary fetch fails
       videos = videoIds.map(id => ({ videoId: id, duration: "Unknown" }));
    }

    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}
