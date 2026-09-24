import type { ReactNode } from 'react'

// Minimal, safe markdown subset for quiz content: paragraphs, "- " lists,
// fenced code blocks, `inline code`, **bold** and *italic*. No HTML injection.

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <code key={i}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 1) return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

type Block = { type: 'p'; text: string } | { type: 'ul'; items: string[] } | { type: 'code'; text: string }

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = []
  const lines = source.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++])
      i++
      blocks.push({ type: 'code', text: body.join('\n') })
    } else if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) items.push(lines[i++].slice(2))
      blocks.push({ type: 'ul', items })
    } else if (line.trim() === '') {
      i++
    } else {
      const body: string[] = []
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('- ') && !lines[i].startsWith('```'))
        body.push(lines[i++])
      blocks.push({ type: 'p', text: body.join(' ') })
    }
  }
  return blocks
}

export function RichText({ text, inline = false }: { text: string; inline?: boolean }) {
  if (inline) return <>{renderInline(text)}</>
  return (
    <>
      {parseBlocks(text).map((block, i) => {
        if (block.type === 'code')
          return (
            <pre key={i}>
              <code>{block.text}</code>
            </pre>
          )
        if (block.type === 'ul')
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        return <p key={i}>{renderInline(block.text)}</p>
      })}
    </>
  )
}
