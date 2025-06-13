import { BrowserCompatibilityManager } from "./browser-compatibility"

export class MediaManager {
  private static instance: MediaManager
  private compatibilityManager: BrowserCompatibilityManager
  private autoplayAllowed = false

  constructor() {
    this.compatibilityManager = BrowserCompatibilityManager.getInstance()
    this.initializeAutoplayDetection()
  }

  static getInstance(): MediaManager {
    if (!MediaManager.instance) {
      MediaManager.instance = new MediaManager()
    }
    return MediaManager.instance
  }

  private async initializeAutoplayDetection(): Promise<void> {
    this.autoplayAllowed = await this.compatibilityManager.checkAutoplaySupport()
  }

  // Safe audio playback with user interaction requirement
  async playAudio(audioElement: HTMLAudioElement, requireUserInteraction = true): Promise<boolean> {
    try {
      if (requireUserInteraction && !this.autoplayAllowed) {
        console.warn("Autoplay blocked - user interaction required")
        return false
      }

      audioElement.muted = false
      const playPromise = audioElement.play()

      if (playPromise !== undefined) {
        await playPromise
        return true
      }
      return false
    } catch (error) {
      console.error("Audio playback failed:", error)

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        console.warn("Autoplay prevented by browser policy")
        return false
      }

      throw error
    }
  }

  // Create audio element with proper fallbacks
  createAudioElement(sources: { src: string; type: string }[]): HTMLAudioElement {
    const audio = document.createElement("audio")
    audio.preload = "none" // Prevent automatic loading
    audio.playsInline = true

    const supportedFormats = this.compatibilityManager.getSupportedMediaFormats()

    // Add sources in order of browser support
    sources
      .filter((source) => {
        const format = source.type.split("/")[1].split(";")[0]
        return supportedFormats.audio.includes(format)
      })
      .forEach((source) => {
        const sourceElement = document.createElement("source")
        sourceElement.src = source.src
        sourceElement.type = source.type
        audio.appendChild(sourceElement)
      })

    return audio
  }

  // Handle media loading with proper error handling
  async loadMedia(element: HTMLMediaElement): Promise<boolean> {
    return new Promise((resolve) => {
      const handleLoad = () => {
        element.removeEventListener("canplaythrough", handleLoad)
        element.removeEventListener("error", handleError)
        resolve(true)
      }

      const handleError = (event: Event) => {
        element.removeEventListener("canplaythrough", handleLoad)
        element.removeEventListener("error", handleError)
        console.error("Media loading failed:", event)
        resolve(false)
      }

      element.addEventListener("canplaythrough", handleLoad)
      element.addEventListener("error", handleError)

      try {
        element.load()
      } catch (error) {
        console.error("Media load error:", error)
        resolve(false)
      }
    })
  }
}
