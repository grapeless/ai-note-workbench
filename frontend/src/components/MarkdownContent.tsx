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
    <div className="wrap-break-word space-y-3 overflow-x-hidden [&_a]:font-bold [&_a]:text-marker-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-marker-blue [&_blockquote]:pl-3 [&_blockquote]:text-ink/70 [&_code]:bg-kraft/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h1]:font-display [&_h1]:text-xl [&_h1]:font-black [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-black [&_h3]:font-black [&_hr]:border-ink/35 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:my-5 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-ink/70 [&_pre]:border-l-4 [&_pre]:border-l-marker-blue [&_pre]:bg-paper-warm [&_pre]:p-4 [&_pre]:text-ink [&_pre]:shadow-[3px_3px_0_var(--kraft)] [&_pre_code]:block [&_pre_code]:min-w-max [&_pre_code]:border-t [&_pre_code]:border-dashed [&_pre_code]:border-ink/25 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:pt-3 [&_pre_code]:text-[13px] [&_pre_code]:leading-6 [&_pre_code]:text-ink [&_pre_code]:whitespace-pre [&_strong]:font-black [&_table]:min-w-full [&_table]:border-collapse [&_td]:border [&_td]:border-ink/35 [&_td]:p-2 [&_th]:border [&_th]:border-ink/35 [&_th]:bg-kraft/20 [&_th]:p-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5">
        <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
            {content}
        </Markdown>
    </div>
))
