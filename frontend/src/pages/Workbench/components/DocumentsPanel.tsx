import {useMemo} from "react"
import {AlertCircle, FileText, LoaderCircle, RefreshCw, Search, X} from "lucide-react"

import type {KnowledgeDocument} from "@/api/workbench/types"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

const documentDateFormatter = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
})

export function DocumentsPanel() {
    const collections = useWorkbenchStore((state) => state.collections)
    const selectedCollectionId = useWorkbenchStore((state) => state.selectedCollectionId)
    const documents = useWorkbenchStore((state) => state.documents)
    const documentsLoading = useWorkbenchStore((state) => state.documentsLoading)
    const documentsError = useWorkbenchStore((state) => state.documentsError)
    const selectedDocumentId = useWorkbenchStore((state) => state.selectedDocumentId)
    const searchQuery = useWorkbenchStore((state) => state.searchQuery)
    const setSearchQuery = useWorkbenchStore((state) => state.setSearchQuery)
    const refreshDocuments = useWorkbenchStore((state) => state.refreshDocuments)
    const selectDocument = useWorkbenchStore((state) => state.selectDocument)

    const selectedCollection = collections.find(({id}) => id === selectedCollectionId) ?? null
    const filteredDocuments = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        if (!query) return documents

        return documents.filter((document) =>
            [document.title, document.contentType, document.status, getFileTypeLabel(document)]
                .some((value) => value.toLowerCase().includes(query)),
        )
    }, [documents, searchQuery])

    return (
        <section className="panel-scroll flex h-full flex-col overflow-y-auto bg-paper" aria-labelledby="documents-title">
            <div className="sticky top-0 z-10 border-b border-ink/55 bg-paper px-4 pb-3 pt-5">
                <div className="flex items-center gap-3">
                    <h2 id="documents-title" className="min-w-0 truncate font-display text-xl font-black">
                        {selectedCollection?.name ?? "文档"}
                    </h2>
                    {selectedCollection && (
                        <span className="raw-sticker ml-auto shrink-0 px-2 py-1 text-[10px] font-black tabular-nums">
                            {documents.length} ITEMS
                        </span>
                    )}
                </div>

                <label
                    className={cn(
                        "mt-4 flex h-11 items-center border-2 border-ink bg-white/35 px-3 focus-within:outline-3 focus-within:outline-marker-blue",
                        selectedCollectionId === null && "opacity-55",
                    )}
                >
                    <span className="sr-only">搜索文档</span>
                    <Search className="mr-2 size-4 shrink-0" aria-hidden="true"/>
                    <input
                        value={searchQuery}
                        disabled={selectedCollectionId === null}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="搜索标题、类型或状态…"
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ink/55 disabled:cursor-not-allowed"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            aria-label="清空文档搜索"
                            className="relative grid size-10 cursor-pointer place-items-center focus-visible:outline-3 focus-visible:outline-marker-blue before:absolute before:-inset-0.5 before:content-['']"
                        >
                            <X className="size-4" aria-hidden="true"/>
                        </button>
                    )}
                </label>

                <div className="mt-3 flex min-h-11 items-center text-xs font-semibold">
                    <span>按上传时间倒序</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="刷新文档列表"
                        title="刷新文档列表"
                        disabled={selectedCollectionId === null || documentsLoading}
                        onClick={() => void refreshDocuments()}
                        className="raw-icon-button ml-auto size-10 rounded-none"
                    >
                        <RefreshCw
                            className={cn("size-4", documentsLoading && "animate-spin motion-reduce:animate-none")}
                            aria-hidden="true"
                        />
                    </Button>
                </div>
            </div>

            <div className="flex-1" aria-live="polite" aria-busy={documentsLoading}>
                {selectedCollectionId === null ? (
                    <DocumentListEmpty
                        title="尚未选择集合"
                        description="请先从左侧选择一个集合，随后这里会显示该集合中的文档。"
                    />
                ) : documentsLoading && documents.length === 0 ? (
                    <DocumentsLoading/>
                ) : documentsError ? (
                    <DocumentsError
                        message={documentsError}
                        loading={documentsLoading}
                        onRetry={() => void refreshDocuments()}
                    />
                ) : documents.length === 0 ? (
                    <DocumentListEmpty
                        title="集合中暂无文档"
                        description="可以从左侧导入 PDF、Markdown 或 TXT 文件。"
                    />
                ) : filteredDocuments.length === 0 ? (
                    <DocumentListEmpty
                        title="没有匹配的文档"
                        description="换一个标题、文件类型或状态关键词试试。"
                    />
                ) : (
                    <ul aria-label={`${selectedCollection?.name ?? "当前集合"}的文档`}>
                        {filteredDocuments.map((document) => (
                            <li key={document.id}>
                                <DocumentRow
                                    document={document}
                                    selected={document.id === selectedDocumentId}
                                    onSelect={() => void selectDocument(document.id)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}

function DocumentRow({
    document,
    selected,
    onSelect,
}: {
    document: KnowledgeDocument
    selected: boolean
    onSelect: () => void
}) {
    const fileType = getFileTypeLabel(document)
    const status = getStatusMeta(document.status)

    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={cn(
                "relative flex w-full cursor-pointer items-start gap-3 border-b border-ink/35 px-4 py-4 text-left hover:bg-kraft/10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-marker-blue",
                selected && "my-3 border-y-2 border-ink bg-white/35 shadow-[inset_6px_0_0_var(--marker-yellow)] hover:bg-white/45",
            )}
        >
            <span className={cn("file-chip shrink-0", fileType === "PDF" && "file-chip-pdf")} aria-hidden="true">
                {fileType}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block wrap-break-word text-sm font-black leading-5">{document.title}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-ink/75">
                    <time dateTime={document.createTime}>{formatDocumentDate(document.createTime)}</time>
                    <span aria-hidden="true">·</span>
                    <span className={cn("raw-sticker px-1.5 py-0.5 text-[9px] font-black", status.className)}>
                        {status.label}
                    </span>
                </span>
            </span>
            {selected && (
                <span className="raw-sticker shrink-0 bg-marker-yellow px-1.5 py-0.5 text-[9px] font-black">
                    OPEN
                </span>
            )}
        </button>
    )
}

function DocumentsLoading() {
    return (
        <div className="px-5 py-10 text-center" role="status">
            <LoaderCircle className="mx-auto size-6 animate-spin motion-reduce:animate-none" aria-hidden="true"/>
            <p className="mt-3 text-sm font-bold">正在加载文档…</p>
        </div>
    )
}

function DocumentsError({
    message,
    loading,
    onRetry,
}: {
    message: string
    loading: boolean
    onRetry: () => void
}) {
    return (
        <div className="m-4 border-2 border-ink bg-marker-red/10 p-4" role="alert">
            <AlertCircle className="size-6" aria-hidden="true"/>
            <p className="mt-3 text-sm font-black">文档加载失败</p>
            <p className="mt-1 wrap-break-word text-xs leading-5 text-ink/75">{message}</p>
            <Button
                type="button"
                variant="outline"
                className="mt-4 h-10 rounded-none border-2 border-ink bg-paper font-black"
                disabled={loading}
                onClick={onRetry}
            >
                <RefreshCw className={cn("size-4", loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true"/>
                重新加载
            </Button>
        </div>
    )
}

function DocumentListEmpty({title, description}: { title: string; description: string }) {
    return (
        <div className="px-6 py-10 text-center">
            <FileText className="mx-auto size-8" strokeWidth={1.5} aria-hidden="true"/>
            <p className="mt-3 text-sm font-black">{title}</p>
            <p className="mt-2 text-xs leading-5 text-ink/70">{description}</p>
        </div>
    )
}

function getFileTypeLabel(document: KnowledgeDocument) {
    const contentType = document.contentType.toLowerCase()

    if (contentType.includes("pdf")) return "PDF"
    if (contentType.includes("markdown")) return "MD"
    if (contentType.includes("text/plain")) return "TXT"

    const extension = document.title.split(".").pop()
    return extension && extension !== document.title ? extension.slice(0, 4).toUpperCase() : "FILE"
}

function getStatusMeta(status: string) {
    switch (status.toUpperCase()) {
        case "UPLOADED":
            return {label: "已上传", className: "bg-marker-blue/10"}
        case "PENDING":
            return {label: "等待处理", className: "bg-kraft/35"}
        case "PROCESSING":
            return {label: "处理中", className: "bg-marker-yellow/65"}
        case "READY":
        case "COMPLETED":
            return {label: "可用", className: "bg-marker-green/20"}
        case "FAILED":
        case "ERROR":
            return {label: "失败", className: "bg-marker-red/15"}
        default:
            return {label: status || "未知", className: "bg-white/35"}
    }
}

function formatDocumentDate(value: string) {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? value : documentDateFormatter.format(date)
}
