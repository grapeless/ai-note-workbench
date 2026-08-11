import {FileText, LocateFixed} from "lucide-react"

import type {ChatCitation} from "@/api/workbench/types"

export function MessageCitations({
    content,
    citations,
    onCitationClick,
}: {
    content: string
    citations: ChatCitation[]
    onCitationClick: (citation: ChatCitation) => void
}) {
    const referencedCitations = citations.filter(citation =>
        content.includes(`[${citation.citationId}]`)
    )

    if (referencedCitations.length === 0) return null

    return (
        <section className="mt-3 border-t border-dashed border-ink/35 pt-3">
            <div className="mb-2 flex items-center gap-2">
                <p className="font-mono text-[10px] font-black tracking-[0.12em]">SOURCES / {referencedCitations.length}</p>
                <span className="h-px flex-1 bg-ink/25"/>
            </div>

            <div className="space-y-2">
                {referencedCitations.map(citation => (
                    <button
                        key={citation.citationId}
                        type="button"
                        disabled={!citation.available}
                        onClick={() => onCitationClick(citation)}
                        className="group flex w-full cursor-pointer items-start gap-2 border border-ink/45 bg-paper/70 p-2.5 text-left shadow-[2px_2px_0_var(--kraft)] hover:border-ink hover:bg-marker-yellow/15 active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:bg-kraft/15 disabled:text-ink/50 disabled:shadow-none"
                    >
                        <span className="grid size-7 shrink-0 place-items-center border border-ink bg-white/45">
                            <FileText className="size-3.5"/>
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="flex items-start gap-2">
                                <span className="raw-sticker shrink-0 bg-marker-yellow px-1.5 py-0.5 font-mono text-[9px] font-black">
                                    {citation.citationId}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-xs font-black">
                                    {citation.documentTitle}
                                </span>
                            </span>
                            <span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-ink/65">
                                {citation.quote}
                            </span>
                            <span className="mt-1.5 block font-mono text-[9px] font-bold text-ink/50">
                                {!citation.available
                                    ? "引用已失效 / 原文已更新"
                                    : citation.documentType === "PDF"
                                    ? citation.pageNumber === null ? "PDF SOURCE" : `PDF / PAGE ${citation.pageNumber}`
                                    : citation.sourceLocator ?? `${citation.documentType} SOURCE`}
                            </span>
                        </span>
                        <LocateFixed className="mt-1 size-3.5 shrink-0 text-ink/50 group-hover:text-ink group-disabled:text-ink/25"/>
                    </button>
                ))}
            </div>
        </section>
    )
}
