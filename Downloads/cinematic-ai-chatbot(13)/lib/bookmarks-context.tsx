"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { StorageManager } from "./utils/storage-manager"

interface BookmarksContextType {
  bookmarkedTemplates: string[] // Array of template IDs
  isBookmarked: (templateId: string) => boolean
  toggleBookmark: (templateId: string) => void
  clearAllBookmarks: () => void
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<string[]>([])
  const storage = StorageManager.getInstance()

  // Load bookmarks from storage on mount
  useEffect(() => {
    const load = async () => {
      if (user) {
        const savedBookmarks = await storage.getItem<string[]>(`template-bookmarks-${user.id}`)
        if (savedBookmarks) {
          setBookmarkedTemplates(savedBookmarks)
        }
      }
    }
    load()
  }, [user])

  // Save bookmarks to storage whenever they change
  useEffect(() => {
    const save = async () => {
      if (user) {
        const success = await storage.setItem(`template-bookmarks-${user.id}`, bookmarkedTemplates)
        if (!success) {
          await storage.performMaintenance("local")
        }
      }
    }
    save()
  }, [bookmarkedTemplates, user])

  const isBookmarked = (templateId: string): boolean => {
    return bookmarkedTemplates.includes(templateId)
  }

  const toggleBookmark = (templateId: string) => {
    setBookmarkedTemplates((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId],
    )
  }

  const clearAllBookmarks = () => {
    setBookmarkedTemplates([])
  }

  return (
    <BookmarksContext.Provider value={{ bookmarkedTemplates, isBookmarked, toggleBookmark, clearAllBookmarks }}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarksContext)
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarksProvider")
  }
  return context
}
