// Platform-aware directions links. One neutral "Directions" button in the UI;
// the routing intelligence lives here.
//
// Why https universal links instead of the old `maps://` scheme: the scheme
// only works on Apple platforms and is a silent dead link everywhere else.
// `maps.apple.com` opens the native Maps app on iPhone/iPad/Mac (incl. from a
// Home-Screen web app) and still loads a usable web page anywhere else, while
// Google's `dir/?api=1` URL opens the Google Maps app on Android via App
// Links and the normal web UI on desktop.

function isApplePlatform(): boolean {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod|Macintosh/.test(ua)
}

export function directionsUrl(query: string): string {
  const q = encodeURIComponent(query)
  if (isApplePlatform()) {
    return `https://maps.apple.com/?daddr=${q}&dirflg=d`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`
}
