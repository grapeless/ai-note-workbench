import {useEffect, useRef, useState} from "react"
import {
    AlertCircle,
    Box,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Import,
    LoaderCircle,
    RefreshCw,
    RotateCcw,
    XCircle,
} from "lucide-react"

import {uploadDocument} from "@/api/workbench/documents"
import type {KnowledgeCollection} from "@/api/workbench/types"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

type UploadItemStatus = "queued" | "uploading" | "success" | "error"

interface UploadItem {
    id: string
    file: File
    collectionId: number
    collectionName: string
    status: UploadItemStatus
    errorMessage: string | null
}

let uploadItemSequence = 0

export function CollectionsPanel() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadingRef = useRef(false)
    const [importStatus, setImportStatus] = useState("")
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
    const [uploading, setUploading] = useState(false)
    const collections = useWorkbenchStore((state) => state.collections)
    const selectedCollectionId = useWorkbenchStore((state) => state.selectedCollectionId)
    const collectionsLoading = useWorkbenchStore((state) => state.collectionsLoading)
    const collectionsError = useWorkbenchStore((state) => state.collectionsError)
    const loadCollections = useWorkbenchStore((state) => state.loadCollections)
    const selectCollection = useWorkbenchStore((state) => state.selectCollection)
    const refreshDocuments = useWorkbenchStore((state) => state.refreshDocuments)

    const selectedCollection = collections.find(({id}) => id === selectedCollectionId) ?? null
    const uploadDisabled = selectedCollection === null || collectionsLoading || uploading

    useEffect(() => {
        void loadCollections()
    }, [loadCollections])

    useEffect(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }, [selectedCollectionId])

    const updateUploadItem = (id: string, updates: Partial<Pick<UploadItem, "status" | "errorMessage">>) => {
        setUploadItems((items) => items.map((item) => item.id === id ? {...item, ...updates} : item))
    }

    const uploadOne = async (item: UploadItem) => {
        updateUploadItem(item.id, {status: "uploading", errorMessage: null})

        try {
            await uploadDocument(item.collectionId, item.file)
            updateUploadItem(item.id, {status: "success", errorMessage: null})

            if (useWorkbenchStore.getState().selectedCollectionId === item.collectionId) {
                await refreshDocuments()
            }

            return true
        } catch (error) {
            updateUploadItem(item.id, {
                status: "error",
                errorMessage: getUploadErrorMessage(error),
            })
            return false
        }
    }

    const uploadFiles = async (files: File[], collection: KnowledgeCollection) => {
        if (uploadingRef.current) return

        const items = files.map<UploadItem>((file) => ({
            id: `${Date.now()}-${++uploadItemSequence}`,
            file,
            collectionId: collection.id,
            collectionName: collection.name,
            status: "queued",
            errorMessage: null,
        }))

        setUploadItems((currentItems) => [...currentItems, ...items])
        uploadingRef.current = true
        setUploading(true)
        setImportStatus(`开始向「${collection.name}」上传 ${items.length} 个文件。`)

        let successCount = 0

        for (const item of items) {
            if (await uploadOne(item)) successCount += 1
        }

        uploadingRef.current = false
        setUploading(false)
        setImportStatus(
            successCount === items.length
                ? `${items.length} 个文件已全部上传成功。`
                : `${successCount} 个文件上传成功，${items.length - successCount} 个文件上传失败。`,
        )
    }

    const retryUpload = async (item: UploadItem) => {
        if (uploadingRef.current) return

        uploadingRef.current = true
        setUploading(true)
        setImportStatus(`正在重试上传「${item.file.name}」。`)

        const succeeded = await uploadOne(item)

        uploadingRef.current = false
        setUploading(false)
        setImportStatus(succeeded ? `「${item.file.name}」重试成功。` : `「${item.file.name}」重试失败。`)
    }

    return (
        <aside className="panel-scroll flex h-full flex-col overflow-y-auto bg-paper-warm" aria-label="集合导航">
            <div className="px-6 pb-4 pt-6">
                <h1 className="font-display text-[1.72rem] leading-[0.96] font-black tracking-tight">
                    AI NOTE
                    <br/>
                    WORKBENCH
                </h1>
                <p className="mt-2 text-xs font-semibold">本地优先 · 可检索 · 有引用</p>
                <div className="mt-2 h-0.75 w-44 bg-ink rough-line" aria-hidden="true"/>
            </div>

            <div className="px-5 pb-5">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.md,.markdown,.txt"
                    multiple
                    className="sr-only"
                    disabled={uploadDisabled}
                    aria-describedby="collection-upload-hint"
                    onChange={(event) => {
                        const files = Array.from(event.currentTarget.files ?? [])
                        event.currentTarget.value = ""

                        if (files.length > 0 && selectedCollection) {
                            void uploadFiles(files, selectedCollection)
                        }
                    }}
                />
                <Button
                    className="raw-primary-button h-12 w-full rounded-none border-2 border-ink bg-marker-yellow text-base font-black text-ink hover:bg-marker-yellow/80"
                    disabled={uploadDisabled}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Import className="size-5" aria-hidden="true"/>
                    导入文件
                    <span className="ml-auto text-[11px] font-bold">PDF / MD / TXT</span>
                </Button>
                <p id="collection-upload-hint" className="mt-2 text-[11px] font-semibold leading-4 text-ink/70">
                    {uploading
                        ? "正在逐个上传，请等待当前队列完成。"
                        : selectedCollection
                        ? `将导入到「${selectedCollection.name}」`
                        : "请先选择一个集合后再导入文件。"}
                </p>
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                    {importStatus}
                </p>
                {uploadItems.length > 0 && (
                    <UploadQueue
                        items={uploadItems}
                        uploading={uploading}
                        onRetry={(item) => void retryUpload(item)}
                    />
                )}
            </div>

            <div className="border-y border-ink/55 px-4 py-1">
                <div className="flex min-h-12 items-center gap-2">
                    <Box className="size-5" strokeWidth={1.8} aria-hidden="true"/>
                    <h2 className="text-xs font-bold">COLLECTIONS / 集合</h2>
                    {!collectionsLoading && !collectionsError && (
                        <span className="raw-sticker ml-auto px-2 py-1 text-[10px] font-black tabular-nums">
                            {collections.length}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1" aria-live="polite" aria-busy={collectionsLoading}>
                {collectionsLoading && collections.length === 0 ? (
                    <CollectionsLoading/>
                ) : collectionsError ? (
                    <CollectionsError
                        message={collectionsError}
                        loading={collectionsLoading}
                        onRetry={() => void loadCollections()}
                    />
                ) : collections.length === 0 ? (
                    <CollectionsEmpty/>
                ) : (
                    <nav aria-label="集合列表">
                        <ul>
                            {collections.map((collection) => (
                                <li key={collection.id}>
                                    <CollectionRow
                                        collection={collection}
                                        selected={collection.id === selectedCollectionId}
                                        onSelect={() => void selectCollection(collection.id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        </aside>
    )
}

function UploadQueue({
    items,
    uploading,
    onRetry,
}: {
    items: UploadItem[]
    uploading: boolean
    onRetry: (item: UploadItem) => void
}) {
    const finishedCount = items.filter(({status}) => status === "success" || status === "error").length

    return (
        <section
            className="mt-4 border-2 border-ink bg-white/25"
            aria-labelledby="upload-queue-title"
            aria-live="polite"
            aria-busy={uploading}
        >
            <div className="flex min-h-10 items-center border-b border-ink/55 px-3">
                <h2 id="upload-queue-title" className="text-[10px] font-black">UPLOADS / 上传进度</h2>
                <span className="ml-auto text-[10px] font-black tabular-nums">{finishedCount}/{items.length}</span>
            </div>
            <ul>
                {items.map((item) => (
                    <li key={item.id} className="border-b border-ink/25 last:border-b-0">
                        <UploadQueueItem item={item} retryDisabled={uploading} onRetry={() => onRetry(item)}/>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function UploadQueueItem({
    item,
    retryDisabled,
    onRetry,
}: {
    item: UploadItem
    retryDisabled: boolean
    onRetry: () => void
}) {
    return (
        <div className={cn(
            "p-3",
            item.status === "success" && "bg-marker-green/10",
            item.status === "error" && "bg-marker-red/10",
        )}>
            <div className="flex items-start gap-2">
                <UploadStatusIcon status={item.status}/>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black" title={item.file.name}>{item.file.name}</p>
                    <p className="mt-1 truncate text-[10px] font-semibold text-ink/65" title={item.collectionName}>
                        {formatFileSize(item.file.size)} · {item.collectionName}
                    </p>
                </div>
                <span className="shrink-0 text-[10px] font-black">{getUploadStatusLabel(item.status)}</span>
            </div>

            {item.errorMessage && (
                <p className="mt-2 wrap-break-word text-[10px] leading-4 text-ink/75" role="alert">
                    {item.errorMessage}
                </p>
            )}

            {item.status === "error" && (
                <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={retryDisabled}
                    onClick={onRetry}
                    aria-label={`重试上传 ${item.file.name}`}
                    className="mt-2 rounded-none border-2 border-ink bg-paper font-black"
                >
                    <RotateCcw className="size-3" aria-hidden="true"/>
                    重试
                </Button>
            )}
        </div>
    )
}

function UploadStatusIcon({status}: { status: UploadItemStatus }) {
    if (status === "uploading") {
        return <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true"/>
    }
    if (status === "success") {
        return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-marker-green" aria-hidden="true"/>
    }
    if (status === "error") {
        return <XCircle className="mt-0.5 size-4 shrink-0 text-marker-red" aria-hidden="true"/>
    }
    return <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true"/>
}

function getUploadStatusLabel(status: UploadItemStatus) {
    switch (status) {
        case "queued":
            return "等待"
        case "uploading":
            return "上传中"
        case "success":
            return "成功"
        case "error":
            return "失败"
    }
}

function getUploadErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "上传失败，请重试"
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function CollectionRow({
    collection,
    selected,
    onSelect,
}: {
    collection: KnowledgeCollection
    selected: boolean
    onSelect: () => void
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={cn(
                "flex min-h-16 w-full cursor-pointer items-center gap-3 border-b border-ink/35 px-5 py-3 text-left hover:bg-kraft/15 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-marker-blue",
                selected && "bg-marker-yellow/35 shadow-[inset_6px_0_0_var(--marker-yellow)] hover:bg-marker-yellow/45",
            )}
        >
            <Box className="size-5 shrink-0" strokeWidth={1.8} aria-hidden="true"/>
            <span className="min-w-0 flex-1">
                <span className={cn("block truncate font-bold", selected && "marker-underline")}>{collection.name}</span>
                {collection.description && (
                    <span className="mt-1 block line-clamp-2 text-xs leading-4 text-ink/70">
                        {collection.description}
                    </span>
                )}
            </span>
            <ChevronRight className="size-4 shrink-0" aria-hidden="true"/>
        </button>
    )
}

function CollectionsLoading() {
    return (
        <div className="px-5 py-8 text-center" role="status">
            <LoaderCircle className="mx-auto size-6 animate-spin motion-reduce:animate-none" aria-hidden="true"/>
            <p className="mt-3 text-sm font-bold">正在加载集合…</p>
        </div>
    )
}

function CollectionsError({
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
            <p className="mt-3 text-sm font-black">集合加载失败</p>
            <p className="mt-1 wrap-break-word text-xs leading-5 text-ink/75">{message}</p>
            <Button
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

function CollectionsEmpty() {
    return (
        <div className="px-6 py-10 text-center">
            <Box className="mx-auto size-8" strokeWidth={1.5} aria-hidden="true"/>
            <p className="mt-3 text-sm font-black">暂无集合</p>
            <p className="mt-2 text-xs leading-5 text-ink/70">
                数据库中还没有可用集合，请先通过后端接口创建集合。
            </p>
        </div>
    )
}
