const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8081/api/v1";

// When testing on another device, localhost refers to that device. Reuse the
// frontend host so the API remains reachable over the local network.
export const API_URL =
  typeof window !== "undefined" &&
  /^(https?:\/\/)(localhost|127\.0\.0\.1)(?::\d+)?(\/|$)/i.test(configuredApiUrl)
    ? configuredApiUrl.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)/i, `$1${window.location.hostname}`)
    : configuredApiUrl;