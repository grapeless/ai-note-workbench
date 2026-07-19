import {AlertCircle, FileSearch, FileText, LoaderCircle, RefreshCw} from "lucide-react"

import type {KnowledgeDocument} from "@/api/workbench/types"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

const detailDateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
})

export function DocumentDetailsPanel() {
    const collections = useWorkbenchStore((state) => state.collections)
    const selectedDocumentId = useWorkbenchStore((state) => state.selectedDocumentId)
    const document = useWorkbenchStore((state) => state.document)
    const documentLoading = useWorkbenchStore((state) => state.documentLoading)
    const documentError = useWorkbenchStore((state) => state.documentError)
    const loadDocument = useWorkbenchStore((state) => state.loadDocument)

    const collectionName = document
        ? collections.find(({id}) => id === document.collectionId)?.name ?? `集合 #${document.collectionId}`
        : null

    return (
        <main
            id="main-content"
            className="panel-scroll h-full overflow-y-auto bg-paper px-5 py-6 sm:px-8"
            tabIndex={-1}
            aria-busy={documentLoading}
        >
            <article className="mx-auto max-w-3xl" aria-live="polite">
                {selectedDocumentId === null ? (
                    <DocumentDetailEmpty/>
                ) : documentLoading ? (
                    <DocumentDetailLoading/>
                ) : documentError ? (
                    <DocumentDetailError
                        message={documentError}
                        loading={documentLoading}
                        onRetry={() => void loadDocument(selectedDocumentId)}
                    />
                ) : document ? (
                    <DocumentMetadata document={document} collectionName={collectionName ?? "未知集合"}/>
                ) : (
                    <DocumentDetailError
                        message="未获取到文档详情"
                        loading={documentLoading}
                        onRetry={() => void loadDocument(selectedDocumentId)}
                    />
                )}
            </article>
        </main>
    )
}

function DocumentMetadata({
    document,
    collectionName,
}: {
    document: KnowledgeDocument
    collectionName: string
}) {
    const fileType = getFileTypeLabel(document)
    const status = getStatusMeta(document.status)

    return (
        <>
            <div className="tape-strip mx-auto mb-1 h-5 w-24" aria-hidden="true"/>
            <p className="section-index">DOCUMENT / 文档详情</p>
            <h1 className="mt-3 break-words font-display text-2xl leading-tight font-black tracking-tight sm:text-3xl">
                {document.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-3 border-b-2 border-ink pb-5">
                <span className="file-chip">{fileType}</span>
                <span className={cn("raw-sticker px-2 py-1 text-[10px] font-black", status.className)}>
                    {status.label}
                </span>
                <span className="raw-sticker bg-white/35 px-2 py-1 text-[10px] font-black">
                    ID #{document.id}
                </span>
            </div>

            <section className="py-7" aria-labelledby="metadata-title">
                <h2 id="metadata-title" className="section-index">01 / METADATA</h2>
                <dl className="mt-4 grid border-l border-t border-ink/40 sm:grid-cols-2">
                    <MetadataItem label="所属集合" value={collectionName}/>
                    <MetadataItem label="文件类型" value={fileType}/>
                    <MetadataItem label="Content-Type" value={document.contentType}/>
                    <MetadataItem label="处理状态" value={`${status.label} / ${document.status}`}/>
                    <MetadataItem label="上传时间" value={formatDetailDate(document.createTime)}/>
                    <MetadataItem label="更新时间" value={formatDetailDate(document.updateTime)}/>
                </dl>
            </section>

            <section className="pb-7" aria-labelledby="document-error-title">
                <h2 id="document-error-title" className="section-index">02 / ERROR MESSAGE</h2>
                {document.errorMessage ? (
                    <div className="mt-4 border-2 border-ink bg-marker-red/10 p-4" role="alert">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true"/>
                            <p className="wrap-break-word text-sm leading-6">{document.errorMessage}</p>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 border-2 border-ink/45 bg-white/25 p-4 text-sm font-semibold">
                        当前没有错误信息。
                    </p>
                )}
            </section>

            <aside className="relative mb-5 border-2 border-ink bg-marker-yellow/25 p-4 pt-5 text-sm leading-6">
                <div className="tape-strip absolute -right-2 -top-2 h-6 w-16 rotate-3" aria-hidden="true"/>
                <p className="text-xs font-black">当前范围 /</p>
                <p className="mt-2 font-reading text-base">
                    此处仅展示数据库中的文档元数据，暂不读取本地文件，也不渲染正文内容。
                </p>
            </aside>
        </>
    )
}

function MetadataItem({label, value}: { label: string; value: string }) {
    return (
        <div className="min-w-0 border-b border-r border-ink/40 p-4">
            <dt className="text-[10px] font-black uppercase tracking-wide text-ink/65">{label}</dt>
            <dd className="mt-2 wrap-break-word text-sm font-semibold leading-5">{value || "—"}</dd>
        </div>
    )
}

function DocumentDetailEmpty() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <FileSearch className="size-12" strokeWidth={1.4} aria-hidden="true"/>
            <h1 className="mt-5 font-display text-2xl font-black">选择一个文档</h1>
            <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-ink/70">
                从文档列表中选择一项，这里会显示该文档的真实元数据和处理状态。
            </p>
        </div>
    )
}

function DocumentDetailLoading() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center" role="status">
            <LoaderCircle className="size-8 animate-spin motion-reduce:animate-none" aria-hidden="true"/>
            <p className="mt-4 text-sm font-black">正在加载文档详情…</p>
        </div>
    )
}

function DocumentDetailError({
    message,
    loading,
    onRetry,
}: {
    message: string
    loading: boolean
    onRetry: () => void
}) {
    return (
        <div className="mx-auto mt-12 max-w-lg border-2 border-ink bg-marker-red/10 p-5" role="alert">
            <FileText className="size-8" aria-hidden="true"/>
            <h1 className="mt-4 font-display text-xl font-black">文档详情加载失败</h1>
            <p className="mt-2 wrap-break-word text-sm leading-6 text-ink/75">{message}</p>
            <Button
                type="button"
                variant="outline"
                className="mt-5 h-10 rounded-none border-2 border-ink bg-paper font-black"
                disabled={loading}
                onClick={onRetry}
            >
                <RefreshCw className={cn("size-4", loading && "animate-spin motion-reduce:animate-none")} aria-hidden="true"/>
                重新加载
            </Button>
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

function formatDetailDate(value: string) {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? value : detailDateFormatter.format(date)
}
