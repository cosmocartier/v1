"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Process the content to handle markdown formatting
  const processedContent = React.useMemo(() => {
    let result = content

    // Process headlines (# Headline)
    result = result.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length
      return `<h${level} class="markdown-headline markdown-h${level}">${text}</h${level}>`
    })

    // Process bold text (**bold**)
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="markdown-bold">$1</strong>')

    // Process italic text (*italic*)
    result = result.replace(/\*([^*]+)\*/g, '<em class="markdown-italic">$1</em>')

    // Process underline text (_underline_)
    result = result.replace(/_(.*?)_/g, '<span class="markdown-underline">$1</span>')

    // Process code blocks (```code```)
    result = result.replace(/```([\s\S]*?)```/g, '<pre class="markdown-codeblock"><code>$1</code></pre>')

    // Process inline code (`code`)
    result = result.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')

    // Process lists
    // Unordered lists
    result = result.replace(/^(\s*)-\s+(.+)$/gm, '<li class="markdown-list-item">$2</li>')
    // Ordered lists
    result = result.replace(/^(\s*)\d+\.\s+(.+)$/gm, '<li class="markdown-list-item ordered">$2</li>')

    // Group list items
    result = result.replace(
      /(<li class="markdown-list-item">.*<\/li>)(\s*)(<li class="markdown-list-item">)/g,
      "$1$2$3",
    )

    // Wrap unordered lists
    result = result.replace(
      /(<li class="markdown-list-item(?!\s+ordered)">[\s\S]*?)(?=<h|\n\n|<li class="markdown-list-item ordered">|$)/g,
      '<ul class="markdown-list">$1</ul>',
    )

    // Wrap ordered lists
    result = result.replace(
      /(<li class="markdown-list-item ordered">[\s\S]*?)(?=<h|\n\n|<li class="markdown-list-item(?!\s+ordered)">|$)/g,
      '<ol class="markdown-list ordered">$1</ol>',
    )

    // Process blockquotes
    result = result.replace(/^>\s+(.+)$/gm, '<blockquote class="markdown-blockquote">$1</blockquote>')

    // Process horizontal rules
    result = result.replace(/^---$/gm, '<hr class="markdown-hr" />')

    // Process paragraphs (lines that aren't headlines, lists, etc.)
    result = result.replace(/^(?!<h|<ul|<ol|<blockquote|<hr|<pre|<li)(.+)$/gm, '<p class="markdown-paragraph">$1</p>')

    // Remove empty paragraphs
    result = result.replace(/<p class="markdown-paragraph"><\/p>/g, "")

    return result
  }, [content])

  return <div className={cn("markdown-content", className)} dangerouslySetInnerHTML={{ __html: processedContent }} />
}
