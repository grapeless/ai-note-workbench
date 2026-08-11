import {useState} from "react"
import {AlertCircle, ExternalLink, FileSearch, FileText, LoaderCircle, RefreshCw, Trash2} from "lucide-react"

import {BASE_URL} from "@/api"
import type {KnowledgeDocument} from "@/api/workbench/types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

import {DOCUMENT_TYPE_LABEL} from "../types.ts"
import {EditableDocumentContent} from "./EditableDocumentContent"

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
        <section
            id="document-content"
            className="panel-scroll h-full min-h-0 overflow-y-auto bg-paper px-5 py-6 sm:px-8"
            tabIndex={-1}
            aria-busy={documentLoading}
        >
            <article className="mx-auto max-w-3xl" aria-live="polite">
                {selectedDocumentId === null ? (<DocumentDetailEmpty/>)
                    : documentLoading
                    ? (<DocumentDetailLoading/>)
                    : documentError
                        ? (<DocumentDetailError
                            message={documentError}
                            loading={documentLoading}
                            onRetry={() => void loadDocument(selectedDocumentId)}/>)
                        : document
                            ? (<DocumentMetadata document={document} collectionName={collectionName ?? "未知集合"}/>)
                            : (<DocumentDetailError
                                    message="未获取到文档详情"
                                    loading={documentLoading}
                                    onRetry={() => void loadDocument(selectedDocumentId)}/>)}
            </article>
        </section>
    )
}

function DocumentMetadata({
                              document,
                              collectionName,
                          }: {
    document: KnowledgeDocument
    collectionName: string
}) {
    const fileType = DOCUMENT_TYPE_LABEL[document.documentType]
    const status = getStatusMeta(document.status)
    const deleteDocument = useWorkbenchStore((state) => state.deleteDocument)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    return (
        <>
            <div className="tape-strip mx-auto mb-1 h-5 w-24" aria-hidden="true"/>
            <p className="section-index">DOCUMENT / 文档详情</p>
            <h1 className="mt-3 wrap-break-word font-display text-2xl leading-tight font-black tracking-tight sm:text-3xl">
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
                <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={(open) => {
                        setDeleteDialogOpen(open)
                        if (open) setDeleteError(null)
                    }}
                >
                    <AlertDialogTrigger
                        render={
                            <Button
                                type="button"
                                variant="outline"
                                className="ml-auto h-8 rounded-none border-2 border-ink bg-marker-red/10 px-3 font-black text-ink shadow-[2px_2px_0_var(--kraft)] transition-none hover:bg-marker-red/20 active:translate-y-px active:shadow-none"
                            />
                        }
                    >
                        <Trash2 className="size-3.5"/>
                        删除文档
                    </AlertDialogTrigger>

                    <AlertDialogContent className="rotate-[-0.15deg] gap-0 rounded-none border-2 border-t-4 border-ink border-t-marker-red bg-paper p-0 text-ink ring-0 shadow-[5px_5px_0_var(--kraft)]">
                        <AlertDialogHeader className="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] place-items-start gap-x-3 gap-y-1 border-b border-dashed border-ink/35 p-5 text-left">
                            <AlertDialogMedia className="row-span-2 mb-0 rounded-none border-2 border-ink bg-marker-red/15">
                                <Trash2 className="size-5 text-destructive"/>
                            </AlertDialogMedia>
                            <AlertDialogTitle className="font-display text-xl font-black">
                                删除这份文档？
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-semibold leading-6 text-ink/70">
                                文档文件、检索片段和向量数据都将被删除，此操作无法撤销。
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="p-5">
                            <p className="wrap-break-word border-l-4 border-marker-red bg-marker-red/8 px-3 py-2 font-mono text-sm font-black">
                                {document.title}
                            </p>

                            {deleteError && (
                                <p className="mt-4 border-l-4 border-destructive bg-destructive/8 px-3 py-2 text-sm font-semibold text-destructive" role="alert">
                                    {deleteError}
                                </p>
                            )}
                        </div>

                        <AlertDialogFooter className="m-0 rounded-none border-t border-dashed border-ink/35 bg-kraft/10 p-4">
                            <AlertDialogCancel
                                disabled={deleting}
                                className="h-9 rounded-none border-2 border-ink bg-paper px-4 font-black"
                            >
                                取消
                            </AlertDialogCancel>
                            <AlertDialogAction
                                type="button"
                                variant="destructive"
                                disabled={deleting}
                                onClick={() => {
                                    setDeleting(true)
                                    setDeleteError(null)

                                    deleteDocument(document.id)
                                        .then(() => setDeleteDialogOpen(false))
                                        .catch(error => setDeleteError(
                                            error instanceof Error ? error.message : "删除文档失败，请重试",
                                        ))
                                        .finally(() => setDeleting(false))
                                }}
                                className="h-9 rounded-none border-2 border-ink bg-marker-red px-4 font-black text-ink shadow-[2px_2px_0_var(--ink)] transition-none hover:bg-marker-red/80 active:translate-y-px active:shadow-none"
                            >
                                {deleting ? (
                                    <>
                                        <LoaderCircle className="animate-spin motion-reduce:animate-none"/>
                                        正在删除
                                    </>
                                ) : (
                                    <>
                                        <Trash2/>
                                        确认删除
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {document.documentType === "PDF" ? (
                <section className="border-b-2 border-ink py-7">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="section-index">CONTENT / PDF PREVIEW</h2>
                            <p className="mt-2 text-xs font-semibold text-ink/60">浏览器原生阅读器 / INLINE</p>
                        </div>
                        <a
                            href={`${BASE_URL}/documents/${document.id}/pdf?collectionId=${document.collectionId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-2 border-2 border-ink bg-paper px-3 text-xs font-black text-ink shadow-[2px_2px_0_var(--kraft)] transition-none hover:bg-marker-yellow/30 active:translate-y-px active:shadow-none"
                        >
                            <ExternalLink className="size-3.5"/>
                            新窗口打开
                        </a>
                    </div>

                    <div className="mt-4 overflow-hidden border-2 border-ink bg-white shadow-[4px_4px_0_var(--kraft)]">
                        <iframe
                            key={`${document.collectionId}:${document.id}`}
                            src={`${BASE_URL}/documents/${document.id}/pdf?collectionId=${document.collectionId}`}
                            title={`${document.title} PDF 预览`}
                            className="h-[72vh] min-h-[32rem] w-full bg-white"
                        />
                    </div>
                </section>
            ) : (
                <EditableDocumentContent
                    key={`${document.collectionId}:${document.id}`}
                    collectionId={document.collectionId}
                    documentId={document.id}
                />
            )}

            <section className="py-7" aria-labelledby="metadata-title">
                <h2 id="metadata-title" className="section-index">01 / METADATA</h2>
                <dl className="mt-4 grid border-l border-t border-ink/40 sm:grid-cols-2">
                    <MetadataItem label="所属集合" value={collectionName}/>
                    <MetadataItem label="文件类型" value={fileType}/>
                    <MetadataItem label="Document-Type" value={document.documentType}/>
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
                    Markdown 与 TXT 支持原文编辑和实时预览；PDF 使用浏览器原生阅读器展示本地源文件。
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
        <div className="py-2" role="status" aria-label="正在加载文档详情">
            <span className="sr-only">正在加载文档详情…</span>
            <Skeleton className="h-3 w-28 rounded-none"/>
            <Skeleton className="mt-4 h-8 w-3/4 rounded-none"/>
            <div className="mt-5 flex gap-3 border-b-2 border-ink pb-5">
                <Skeleton className="h-7 w-12 rounded-none"/>
                <Skeleton className="h-7 w-20 rounded-none"/>
                <Skeleton className="h-7 w-16 rounded-none"/>
            </div>
            <div className="py-7">
                <Skeleton className="h-3 w-24 rounded-none"/>
                <div className="mt-4 grid border-l border-t border-ink/25 sm:grid-cols-2">
                    {[0, 1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="flex min-h-20 flex-col gap-3 border-b border-r border-ink/25 p-4">
                            <Skeleton className="h-3 w-16 rounded-none"/>
                            <Skeleton className="h-4 w-4/5 rounded-none"/>
                        </div>
                    ))}
                </div>
            </div>
            <Skeleton className="h-24 w-full rounded-none"/>
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
                <RefreshCw className={cn("size-4", loading && "animate-spin motion-reduce:animate-none")}
                           aria-hidden="true"/>
                重新加载
            </Button>
        </div>
    )
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
