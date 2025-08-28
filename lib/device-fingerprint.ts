// Device fingerprinting utility for single device restriction
export function generateDeviceFingerprint(): string {
  if (typeof window === "undefined") {
    return "server-side"
  }

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  ctx?.fillText("Device fingerprint", 10, 10)
  const canvasFingerprint = canvas.toDataURL()

  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint.slice(-50), // Last 50 chars of canvas fingerprint
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory || "unknown",
  }

  // Create a hash of the fingerprint
  const fingerprintString = JSON.stringify(fingerprint)
  return btoa(fingerprintString).slice(0, 32) // Base64 encoded, first 32 chars
}

export function getDeviceInfo() {
  if (typeof window === "undefined") {
    return null
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}
