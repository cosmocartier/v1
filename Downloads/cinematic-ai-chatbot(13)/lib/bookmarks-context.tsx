"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

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

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedBookmarks = localStorage.getItem(`template-bookmarks-${user.id}`)
      if (savedBookmarks) {
        setBookmarkedTemplates(JSON.parse(savedBookmarks))
      }
    }
  }, [user])

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`template-bookmarks-${user.id}`, JSON.stringify(bookmarkedTemplates))
    }
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
