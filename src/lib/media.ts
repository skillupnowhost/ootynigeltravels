// Tiny inline gradient (forest-100 -> forest-200) used as a `next/image`
// `blurDataURL`. Being a data: URI it paints synchronously with the DOM —
// no network round trip — so photo tiles never show a blank/white flash
// while the real image is still loading.
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMicgaGVpZ2h0PSczMic+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdnJyB4MT0nMCcgeTE9JzAnIHgyPScxJyB5Mj0nMSc+PHN0b3Agb2Zmc2V0PScwJScgc3RvcC1jb2xvcj0nI2U0ZWVlOScvPjxzdG9wIG9mZnNldD0nMTAwJScgc3RvcC1jb2xvcj0nI2NmZTNkYScvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSczMicgaGVpZ2h0PSczMicgZmlsbD0ndXJsKCNnKScvPjwvc3ZnPg==";
