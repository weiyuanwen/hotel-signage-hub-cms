export type VideoPlayback =
  | { provider: "youtube"; id: string; url: string }
  | { provider: "vimeo"; id: string; url: string }
  | { provider: "file"; url: string };

export function parseVideoUrl(raw: string): VideoPlayback | null {
  const url = raw.trim();
  if (!url || url.length > 2048) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const youtube = youtubeId(host, parsed);
  if (youtube) return { provider: "youtube", id: youtube, url };

  const vimeo = vimeoId(host, parsed.pathname);
  if (vimeo) return { provider: "vimeo", id: vimeo, url };

  if (/\.(mp4|webm|ogg|mov)$/i.test(parsed.pathname)) return { provider: "file", url };

  return null;
}

export function embedSrc(playback: VideoPlayback, mode: "preview" | "background"): string | null {
  if (playback.provider === "file") return null;

  if (playback.provider === "youtube") {
    const base = `https://www.youtube-nocookie.com/embed/${playback.id}`;
    if (mode === "background") {
      return `${base}?autoplay=1&mute=1&loop=1&playlist=${playback.id}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3`;
    }
    return `${base}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;
  }

  if (mode === "background") {
    return `https://player.vimeo.com/video/${playback.id}?autoplay=1&muted=1&loop=1&background=1`;
  }

  return `https://player.vimeo.com/video/${playback.id}?autoplay=1&muted=1`;
}

export function remoteLinkFrom(url: string | null): string {
  if (!url || url.includes("/storage/")) return "";
  return parseVideoUrl(url) ? url : "";
}

function youtubeId(host: string, parsed: URL): string | null {
  const youtubeHosts = ["youtu.be", "youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"];
  if (!youtubeHosts.includes(host)) return null;

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    return validYoutubeId(id) ? id : null;
  }

  const fromQuery = parsed.searchParams.get("v");
  if (fromQuery && validYoutubeId(fromQuery)) return fromQuery;

  const match = parsed.pathname.match(/\/(embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
  return match ? match[2] : null;
}

function validYoutubeId(id: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

function vimeoId(host: string, pathname: string): string | null {
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  const match = pathname.match(/\/(\d{6,12})/);
  return match ? match[1] : null;
}
