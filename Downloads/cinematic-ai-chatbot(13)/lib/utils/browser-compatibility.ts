// Browser compatibility and error handling utilities
export class BrowserCompatibilityManager {
  private static instance: BrowserCompatibilityManager
  private storageQuotaWarningThreshold = 0.8 // 80% of quota
  private maxStorageItems = 1000

  static getInstance(): BrowserCompatibilityManager {
    if (!BrowserCompatibilityManager.instance) {
      BrowserCompatibilityManager.instance = new BrowserCompatibilityManager()
    }
    return BrowserCompatibilityManager.instance
  }

  // Check and manage storage quota
  async checkStorageQuota(): Promise<{ available: number; used: number; percentage: number }> {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const available = estimate.quota || 0
        const percentage = available > 0 ? used / available : 0

        return { available, used, percentage }
      }
    } catch (error) {
      console.warn("Storage quota check failed:", error)
    }

    return { available: 0, used: 0, percentage: 0 }
  }

  // Clean up storage when quota is exceeded
  async cleanupStorage(): Promise<void> {
    try {
      // Clear old localStorage items
      const keys = Object.keys(localStorage)
      const timestampedKeys = keys
        .filter((key) => key.startsWith("app_"))
        .map((key) => ({
          key,
          timestamp: Number.parseInt(localStorage.getItem(`${key}_timestamp`) || "0"),
        }))
        .sort((a, b) => a.timestamp - b.timestamp)

      // Remove oldest 25% of items
      const itemsToRemove = Math.floor(timestampedKeys.length * 0.25)
      for (let i = 0; i < itemsToRemove; i++) {
        localStorage.removeItem(timestampedKeys[i].key)
        localStorage.removeItem(`${timestampedKeys[i].key}_timestamp`)
      }

      // Clear old sessionStorage
      const sessionKeys = Object.keys(sessionStorage)
      if (sessionKeys.length > this.maxStorageItems) {
        sessionKeys.slice(0, sessionKeys.length - this.maxStorageItems).forEach((key) => {
          sessionStorage.removeItem(key)
        })
      }

      console.log("Storage cleanup completed")
    } catch (error) {
      console.error("Storage cleanup failed:", error)
    }
  }

  // Safe storage setter with quota management
  async safeSetItem(key: string, value: string, storage: "local" | "session" = "local"): Promise<boolean> {
    try {
      const storageObj = storage === "local" ? localStorage : sessionStorage
      const timestamp = Date.now().toString()

      // Check quota before setting
      const quota = await this.checkStorageQuota()
      if (quota.percentage > this.storageQuotaWarningThreshold) {
        await this.cleanupStorage()
      }

      storageObj.setItem(key, value)
      storageObj.setItem(`${key}_timestamp`, timestamp)
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.warn("Storage quota exceeded, attempting cleanup...")
        await this.cleanupStorage()

        try {
          const storageObj = storage === "local" ? localStorage : sessionStorage
          storageObj.setItem(key, value)
          return true
        } catch (retryError) {
          console.error("Storage still full after cleanup:", retryError)
          return false
        }
      }
      console.error("Storage error:", error)
      return false
    }
  }

  // Check autoplay policy support
  async checkAutoplaySupport(): Promise<boolean> {
    try {
      // Create a silent video element to test autoplay
      const video = document.createElement("video")
      video.muted = true
      video.playsInline = true
      video.src =
        "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTMgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGIAAAQAAAEAAAAAB2htZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAAAIAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAEybWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA8nN0YmwAAACYc3RzZAAAAAAAAAABAAAAiGF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAA1YXZjQwFkAAr/4QAYZ//hAAXpFxDplIcBAQEAAAMAEAAAAwPIDxYtlgEABWjLg8sgAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAAAAAAABAAAAFAAAABRzdGNvAAAAAAAAAAEAAAAsAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY1Ni40MC4xMDE="

      const playPromise = video.play()
      if (playPromise !== undefined) {
        await playPromise
        video.pause()
        return true
      }
      return false
    } catch (error) {
      console.warn("Autoplay not supported:", error)
      return false
    }
  }

  // Get supported media formats
  getSupportedMediaFormats(): { audio: string[]; video: string[] } {
    const audio = document.createElement("audio")
    const video = document.createElement("video")

    const audioFormats: string[] = []
    const videoFormats: string[] = []

    // Test audio formats
    const audioTests = [
      { format: "mp3", mime: "audio/mpeg" },
      { format: "ogg", mime: 'audio/ogg; codecs="vorbis"' },
      { format: "wav", mime: "audio/wav" },
      { format: "aac", mime: "audio/aac" },
      { format: "webm", mime: 'audio/webm; codecs="vorbis"' },
    ]

    audioTests.forEach((test) => {
      if (audio.canPlayType(test.mime) !== "") {
        audioFormats.push(test.format)
      }
    })

    // Test video formats
    const videoTests = [
      { format: "mp4", mime: 'video/mp4; codecs="avc1.42E01E"' },
      { format: "webm", mime: 'video/webm; codecs="vp8"' },
      { format: "ogg", mime: 'video/ogg; codecs="theora"' },
      { format: "webm-vp9", mime: 'video/webm; codecs="vp9"' },
    ]

    videoTests.forEach((test) => {
      if (video.canPlayType(test.mime) !== "") {
        videoFormats.push(test.format)
      }
    })

    return { audio: audioFormats, video: videoFormats }
  }
}
