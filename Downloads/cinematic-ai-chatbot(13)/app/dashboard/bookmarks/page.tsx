"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bookmark, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BookmarksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
          <p className="text-muted-foreground">Saved items and important references</p>
        </div>
        <Button>
          <Bookmark className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Strategic Planning Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <span>Q4 Strategic Review Template</span>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <span>Initiative Planning Framework</span>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
