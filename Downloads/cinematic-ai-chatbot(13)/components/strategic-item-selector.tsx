"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStrategic } from "@/lib/strategic-context"
import { Layers, Target, Search } from "lucide-react"

interface StrategicItemSelectorProps {
  isOpen: boolean
  onClose: () => void
  onItemSelected: (id: string, type: "initiative" | "operation") => void
}

export function StrategicItemSelector({ isOpen, onClose, onItemSelected }: StrategicItemSelectorProps) {
  const { initiatives, operations, isLoading } = useStrategic()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInitiatives = initiatives.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredOperations = operations.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelect = (id: string, type: "initiative" | "operation") => {
    onItemSelected(id, type)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Strategic Context</DialogTitle>
          <DialogDescription>
            Choose an Initiative or Operation to focus this chat session. The AI will use this context.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs defaultValue="initiatives" className="flex-grow flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="initiatives">
              <Layers className="w-4 h-4 mr-2" />
              Initiatives ({filteredInitiatives.length})
            </TabsTrigger>
            <TabsTrigger value="operations">
              <Target className="w-4 h-4 mr-2" />
              Operations ({filteredOperations.length})
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-grow mt-2">
            <TabsContent value="initiatives" className="space-y-2 p-1">
              {isLoading && <p>Loading initiatives...</p>}
              {!isLoading && filteredInitiatives.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No initiatives found.</p>
              )}
              {filteredInitiatives.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-2 px-3 text-left"
                  onClick={() => handleSelect(item.id, "initiative")}
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.desiredOutcome}</p>
                  </div>
                </Button>
              ))}
            </TabsContent>
            <TabsContent value="operations" className="space-y-2 p-1">
              {isLoading && <p>Loading operations...</p>}
              {!isLoading && filteredOperations.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No operations found.</p>
              )}
              {filteredOperations.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-2 px-3 text-left"
                  onClick={() => handleSelect(item.id, "operation")}
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.deliverable}</p>
                  </div>
                </Button>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}
