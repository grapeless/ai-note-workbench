import {memo} from "react"
import Markdown, {type Components} from "react-markdown"
import remarkGfm from "remark-gfm"

export const MarkdownContent = memo(({
    content,
    components,
}: {
    content: string
    components?: Components
}) => (
    <div className="wrap-break-word space-y-3 overflow-x-auto [&_a]:font-bold [&_a]:text-marker-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-marker-blue [&_blockquote]:pl-3 [&_blockquote]:text-ink/70 [&_code]:bg-kraft/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h1]:font-display [&_h1]:text-xl [&_h1]:font-black [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-black [&_h3]:font-black [&_hr]:border-ink/35 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-ink/35 [&_pre]:bg-ink [&_pre]:p-3 [&_pre]:text-paper [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-paper [&_strong]:font-black [&_table]:min-w-full [&_table]:border-collapse [&_td]:border [&_td]:border-ink/35 [&_td]:p-2 [&_th]:border [&_th]:border-ink/35 [&_th]:bg-kraft/20 [&_th]:p-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5">
        <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
            {content}
        </Markdown>
    </div>
))
