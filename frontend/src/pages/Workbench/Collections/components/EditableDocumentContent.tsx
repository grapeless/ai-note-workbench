import {useDeferredValue, useEffect, useMemo, useRef, useState} from "react"
import {Check, Columns2, Eye, FileText, Link2, Pencil, RefreshCw, RotateCcw, X} from "lucide-react"

import {getEditableDocumentContent, updateEditableDocumentContent} from "@/api/workbench/documents"
import type {EditableDocument} from "@/api/workbench/types"
import {MarkdownContent} from "@/components/MarkdownContent"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {Textarea} from "@/components/ui/textarea"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

const modeButtonClass = "h-7 rounded-none border-2 border-ink px-2 font-sans text-[10px] font-black shadow-[2px_2px_0_var(--kraft)] transition-none active:translate-y-px active:shadow-none"

export function EditableDocumentContent({collectionId, documentId}: { collectionId: number; documentId: number }) {
    const refreshDocuments = useWorkbenchStore((state) => state.refreshDocuments)
    const loadDocument = useWorkbenchStore((state) => state.loadDocument)
    const activeCitation = useWorkbenchStore((state) => state.activeCitation)
    const clearCitation = useWorkbenchStore((state) => state.clearCitation)
    const [editableDocument, setEditableDocument] = useState<EditableDocument | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadVersion, setReloadVersion] = useState(0)
    const [draft, setDraft] = useState("")
    const [mode, setMode] = useState<"source" | "edit" | "preview" | "split">("source")
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        setEditableDocument(null)
        setLoading(true)
        setError(null)
        setSaveError(null)
        setDraft("")
        setMode("source")

        getEditableDocumentContent(collectionId, documentId)
            .then(result => {
                if (!cancelled) {
                    setEditableDocument(result)
                    setDraft(result.content)
                    setMode(result.documentType === "MARKDOWN" ? "preview" : "source")
                }
            })
            .catch(error => {
                if (!cancelled) {
                    setError(error instanceof Error ? error.message : "正文加载失败")
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [collectionId, documentId, reloadVersion])

    const changed = editableDocument !== null && draft !== editableDocument.content
    const previewContent = useDeferredValue(draft)
    const citation = activeCitation?.documentId === documentId ? activeCitation : null
    const citationRange = useMemo(
        () => citation === null ? null : findCitationRange(draft, citation.quote),
        [citation, draft]
    )
    const citationMarkRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (citation !== null && editableDocument !== null) setMode("source")
    }, [citation, editableDocument])

    useEffect(() => {
        citationMarkRef.current?.scrollIntoView({behavior: "smooth", block: "center"})
    }, [citationRange, mode])

    useEffect(() => {
        useWorkbenchStore.setState({dirtyDocumentId: changed ? documentId : null})
    }, [changed, documentId])

    useEffect(() => {
        if (!changed) return

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = true
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [changed])

    const editor = (
        <Textarea
            value={draft}
            disabled={saving}
            onChange={event => {
                setDraft(event.target.value)
                setSaveError(null)
            }}
            spellCheck={false}
            className="min-h-72 resize-y rounded-none border-0 bg-transparent p-4 font-mono text-sm leading-6 text-ink shadow-none focus-visible:border-0 focus-visible:ring-0"
        />
    )

    const preview = (
        <div className="min-h-72 bg-paper/55 p-5 font-reading text-sm leading-7">
            <MarkdownContent content={previewContent}/>
        </div>
    )

    return (
        <section className="border-b-2 border-ink py-7" aria-labelledby="document-body-title" aria-busy={loading}>
            <div className="flex items-end justify-between gap-4">
                <h2 id="document-body-title" className="section-index">CONTENT / 正文</h2>
                <span className="font-mono text-[10px] font-bold text-ink/55">SOURCE / UTF-8</span>
            </div>

            {loading ? (
                <div className="mt-4 border-2 border-ink bg-white/25 p-4">
                    <div className="flex items-center gap-2 border-b border-dashed border-ink/35 pb-3">
                        <Skeleton className="size-4 rounded-none"/>
                        <Skeleton className="h-3 w-28 rounded-none"/>
                    </div>
                    <div className="mt-4 space-y-3">
                        <Skeleton className="h-3 w-11/12 rounded-none"/>
                        <Skeleton className="h-3 w-4/5 rounded-none"/>
                        <Skeleton className="h-3 w-9/12 rounded-none"/>
                        <Skeleton className="h-3 w-10/12 rounded-none"/>
                    </div>
                </div>
            ) : error ? (
                <div className="mt-4 border-2 border-ink bg-marker-red/10 p-4">
                    <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 size-5 shrink-0"/>
                        <div className="min-w-0 flex-1">
                            <p className="font-black">正文加载失败</p>
                            <p className="mt-1 wrap-break-word text-sm leading-6 text-ink/70">{error}</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-4 h-9 rounded-none border-2 border-ink bg-paper font-black"
                        onClick={() => setReloadVersion(version => version + 1)}
                    >
                        <RefreshCw className="size-4"/>
                        重新加载
                    </Button>
                </div>
            ) : editableDocument ? (
                <div className="relative mt-4 border-2 border-ink bg-white/30 shadow-[4px_4px_0_var(--kraft)]">
                    <div className="flex min-h-10 flex-wrap items-center gap-2 border-b border-dashed border-ink/35 bg-kraft/10 px-3 py-2 font-mono text-[10px] font-black">
                        <FileText className="size-3.5"/>
                        <span>{editableDocument.documentType === "MARKDOWN" ? "MARKDOWN" : "PLAIN TEXT"}</span>
                        <span className={changed ? "raw-sticker ml-auto bg-marker-yellow px-2 py-1" : "ml-auto text-ink/55"}>
                            {saving
                                ? "SAVING"
                                : changed
                                    ? "UNSAVED"
                                    : mode === "edit" || mode === "split"
                                        ? "EDITING"
                                        : mode === "preview" ? "PREVIEW" : "READ ONLY"}
                        </span>

                        {editableDocument.documentType === "MARKDOWN" ? (
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={saving}
                                    className={cn(modeButtonClass, mode === "edit" ? "bg-marker-yellow" : "bg-paper")}
                                    onClick={() => setMode("edit")}
                                >
                                    <Pencil className="size-3"/>
                                    编辑
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={saving}
                                    className={cn(modeButtonClass, mode === "preview" ? "bg-marker-yellow" : "bg-paper")}
                                    onClick={() => setMode("preview")}
                                >
                                    <Eye className="size-3"/>
                                    预览
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={saving}
                                    className={cn(modeButtonClass, mode === "split" ? "bg-marker-yellow" : "bg-paper")}
                                    onClick={() => setMode("split")}
                                >
                                    <Columns2 className="size-3"/>
                                    分屏
                                </Button>
                            </div>
                        ) : mode !== "edit" ? (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={saving}
                                className={cn(modeButtonClass, "bg-paper")}
                                onClick={() => setMode("edit")}
                            >
                                <Pencil className="size-3"/>
                                {changed ? "继续编辑" : "编辑"}
                            </Button>
                        ) : null}
                    </div>

                    {citation && (
                        <div className="flex flex-wrap items-center gap-2 border-b border-ink bg-marker-yellow/20 px-3 py-2 text-xs">
                            <Link2 className="size-3.5 shrink-0"/>
                            <span className="raw-sticker bg-marker-yellow px-1.5 py-0.5 font-mono text-[9px] font-black">
                                {citation.citationId}
                            </span>
                            <span className="min-w-0 flex-1 font-semibold">
                                {citationRange
                                    ? "已定位到引用原文"
                                    : "当前版本未找到完整引用片段，已打开对应文档"}
                                {changed && "；引用来自上次嵌入的版本"}
                            </span>
                            {mode !== "source" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-7 rounded-none border border-ink bg-paper px-2 text-[10px] font-black"
                                    onClick={() => setMode("source")}
                                >
                                    查看原文
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="关闭引用定位"
                                className="size-7 rounded-none"
                                onClick={clearCitation}
                            >
                                <X className="size-3.5"/>
                            </Button>
                        </div>
                    )}

                    {mode === "split" && editableDocument.documentType === "MARKDOWN" ? (
                        <div className="@container">
                            <div className="grid divide-y divide-ink/35 @2xl:grid-cols-2 @2xl:divide-x @2xl:divide-y-0">
                                <div className="min-w-0">
                                    <p className="border-b border-dashed border-ink/25 bg-marker-blue/5 px-4 py-2 font-mono text-[10px] font-black">SOURCE</p>
                                    {editor}
                                </div>
                                <div className="min-w-0">
                                    <p className="border-b border-dashed border-ink/25 bg-marker-yellow/15 px-4 py-2 font-mono text-[10px] font-black">PREVIEW</p>
                                    {preview}
                                </div>
                            </div>
                        </div>
                    ) : mode === "edit" ? (
                        editor
                    ) : mode === "preview" && editableDocument.documentType === "MARKDOWN" ? (
                        preview
                    ) : (
                        <pre className="min-h-72 overflow-x-auto whitespace-pre-wrap wrap-break-word p-4 font-mono text-sm leading-6 text-ink">
                            {citationRange ? (
                                <>
                                    {draft.slice(0, citationRange.start)}
                                    <mark
                                        ref={citationMarkRef}
                                        className="border-b-2 border-ink bg-marker-yellow px-0.5 text-ink shadow-[2px_0_0_var(--marker-yellow),-2px_0_0_var(--marker-yellow)]"
                                    >
                                        {draft.slice(citationRange.start, citationRange.end)}
                                    </mark>
                                    {draft.slice(citationRange.end)}
                                </>
                            ) : draft}
                        </pre>
                    )}

                    {(mode === "edit" || mode === "split") && (
                        <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t border-dashed border-ink/35 bg-paper px-3 py-3 shadow-[0_-3px_0_var(--kraft)]">
                            <p className={cn(
                                "mr-auto text-xs font-semibold text-ink/60",
                                saveError && "font-bold text-marker-red"
                            )}>
                                {saveError
                                    ? saveError
                                    : saving
                                        ? "正在写入文档并使旧索引失效..."
                                        : changed
                                            ? "当前修改只保存在页面中，尚未写入文档文件。"
                                            : "尚未修改正文。"}
                            </p>
                            {changed && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={saving}
                                    className="h-8 rounded-none border-2 border-ink bg-paper px-3 text-xs font-black"
                                    onClick={() => {
                                        setDraft(editableDocument.content)
                                        setSaveError(null)
                                    }}
                                >
                                    <RotateCcw className="size-3.5"/>
                                    重置
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                disabled={saving}
                                className="h-8 rounded-none border-2 border-ink bg-marker-red/10 px-3 text-xs font-black"
                                onClick={() => {
                                    setDraft(editableDocument.content)
                                    setSaveError(null)
                                    setMode(editableDocument.documentType === "MARKDOWN" ? "preview" : "source")
                                }}
                            >
                                <X className="size-3.5"/>
                                取消
                            </Button>
                            <Button
                                type="button"
                                disabled={!changed || saving}
                                className="h-8 rounded-none border-2 border-ink bg-marker-yellow px-3 text-xs font-black text-ink shadow-[2px_2px_0_var(--ink)] transition-none hover:bg-marker-yellow/80 active:translate-y-px active:shadow-none"
                                onClick={async () => {
                                    setSaving(true)
                                    setSaveError(null)

                                    try {
                                        const result = await updateEditableDocumentContent(
                                            collectionId,
                                            documentId,
                                            {
                                                expectedContentHash: editableDocument.contentHash,
                                                content: draft
                                            }
                                        )

                                        setEditableDocument(result)
                                        setDraft(result.content)
                                        setMode(result.documentType === "MARKDOWN" ? "preview" : "source")
                                        await Promise.all([
                                            refreshDocuments(),
                                            loadDocument(documentId, false),
                                        ])
                                    } catch (error) {
                                        setSaveError(error instanceof Error ? error.message : "正文保存失败")
                                    } finally {
                                        setSaving(false)
                                    }
                                }}
                            >
                                {saving ? (
                                    <RefreshCw className="size-3.5 animate-spin"/>
                                ) : (
                                    <Check className="size-3.5"/>
                                )}
                                {saving ? "保存中" : "保存"}
                            </Button>
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    )
}


/**
 * 在原始文档内容中查找引用快照对应的高亮范围。
 *
 * quote 来自嵌入后的 Chunk，可能已经丢失 Markdown 标记或发生空白变化，因此依次尝试：
 * 1. 原文精确匹配；
 * 2. 合并连续空白后匹配；
 * 3. 忽略标点、Markdown 格式符号和英文大小写后匹配。
 *
 * 后两种匹配会同时记录归一化字符在原文中的位置，确保最终返回的 start、end 仍然可以直接用于截取和高亮原始文档内容。
 */
function findCitationRange(content: string, quote: string) {
    const exactStart = content.indexOf(quote)
    if (exactStart >= 0) return {start: exactStart, end: exactStart + quote.length}

    const candidates = [
        quote,
        ...quote.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length >= 12)
            .sort((left, right) => right.length - left.length),
    ]

    for (const candidate of candidates) {
        let normalizedContent = ""
        const contentIndexes: number[] = []

        for (let index = 0; index < content.length; index++) {
            const character = content[index]

            if (/\s/.test(character)) {
                if (normalizedContent.endsWith(" ")) continue
                normalizedContent += " "
            } else {
                normalizedContent += character
            }
            contentIndexes.push(index)
        }

        const normalizedCandidate = candidate.replace(/\s+/g, " ").trim()
        const normalizedStart = normalizedContent.indexOf(normalizedCandidate)

        if (normalizedStart >= 0) {
            return {
                start: contentIndexes[normalizedStart],
                end: contentIndexes[normalizedStart + normalizedCandidate.length - 1] + 1,
            }
        }

        let plainContent = ""
        const plainContentIndexes: number[] = []

        for (let index = 0; index < content.length; index++) {
            if (!/[\p{L}\p{N}]/u.test(content[index])) continue

            plainContent += content[index].toLocaleLowerCase()
            plainContentIndexes.push(index)
        }

        const plainCandidate = [...candidate]
            .filter(character => /[\p{L}\p{N}]/u.test(character))
            .join("")
            .toLocaleLowerCase()
        const plainStart = plainContent.indexOf(plainCandidate)

        if (plainStart >= 0) {
            return {
                start: plainContentIndexes[plainStart],
                end: plainContentIndexes[plainStart + plainCandidate.length - 1] + 1,
            }
        }
    }

    return null
}
