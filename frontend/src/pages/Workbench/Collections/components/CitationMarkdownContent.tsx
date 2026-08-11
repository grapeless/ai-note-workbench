import type {ChatCitation} from "@/api/workbench/types"
import {MarkdownContent} from "@/components/MarkdownContent"

export function CitationMarkdownContent({
    content,
    citations,
    onCitationClick,
}: {
    content: string
    citations: ChatCitation[]
    onCitationClick: (citation: ChatCitation) => void
}) {
    const citationMap = new Map(citations.map(citation => [citation.citationId, citation]))
    const markdown = content
        .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
        .map((block, blockIndex) => blockIndex % 2 === 1
            ? block
            : block.split(/(`+[^`]*`+)/g)
                .map((part, partIndex) => partIndex % 2 === 1
                    ? part
                    : part.replace(/\[(D\d+-[CP]\d+)](?!\()/g, (match, citationId: string) =>
                        citationMap.has(citationId)
                            ? `[${citationId}](#citation-${encodeURIComponent(citationId)})`
                            : match
                    )
                )
                .join("")
        )
        .join("")

    return (
        <MarkdownContent
            content={markdown}
            components={{
                a: ({href, children}) => {
                    if (!href?.startsWith("#citation-")) {
                        return <a href={href}>{children}</a>
                    }

                    const citation = citationMap.get(decodeURIComponent(href.slice("#citation-".length)))

                    if (!citation) return <>{children}</>

                    return citation.available ? (
                        <button
                            type="button"
                            title={`查看来源：${citation.documentTitle}`}
                            onClick={() => onCitationClick(citation)}
                            className="mx-0.5 inline-flex translate-y-px cursor-pointer items-center border border-ink bg-marker-yellow px-1.5 py-0.5 font-mono text-[10px] font-black leading-none text-ink no-underline shadow-[1px_1px_0_var(--ink)] hover:bg-marker-yellow/70 active:translate-y-0.5 active:shadow-none"
                        >
                            {children}
                        </button>
                    ) : (
                        <span
                            title="引用对应的原文版本已失效"
                            className="mx-0.5 inline-flex translate-y-px items-center gap-1 border border-ink/40 bg-kraft/20 px-1.5 py-0.5 font-mono text-[10px] font-black leading-none text-ink/50 line-through"
                        >
                            {children}
                            <span className="no-underline">失效</span>
                        </span>
                    )
                },
            }}
        />
    )
}
