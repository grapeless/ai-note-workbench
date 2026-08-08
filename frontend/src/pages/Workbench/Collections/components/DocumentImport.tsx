import {useEffect, useRef, useState} from "react"
import {CheckCircle2, Clock3, Import, LoaderCircle, RotateCcw, XCircle,} from "lucide-react"

import {processDocument, uploadDocument} from "@/api/workbench/documents"
import type {KnowledgeCollection} from "@/api/workbench/types"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

type UploadItemStatus = "queued" | "uploading" | "embedding" | "success" | "error"

interface UploadItem {
    id: string
    file: File
    collectionId: number
    collectionName: string
    documentId: number | null
    status: UploadItemStatus
    errorMessage: string | null
}

let uploadItemSequence = 0

export function DocumentImport() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadingRef = useRef(false)
    const [importStatus, setImportStatus] = useState("")
    const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
    const [uploading, setUploading] = useState(false)
    const collections = useWorkbenchStore((state) => state.collections)
    const selectedCollectionId = useWorkbenchStore((state) => state.selectedCollectionId)
    const refreshDocuments = useWorkbenchStore((state) => state.refreshDocuments)

    const selectedCollection = collections.find(({id}) => id === selectedCollectionId) ?? null
    const uploadDisabled = selectedCollection === null || uploading

    useEffect(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }, [selectedCollectionId])

    const updateUploadItem = (
        id: string,
        updates: Partial<Pick<UploadItem, "documentId" | "status" | "errorMessage">>,
    ) => {
        setUploadItems((items) => items.map((item) => item.id === id ? {...item, ...updates} : item))
    }

    const importOne = async (item: UploadItem) => {
        let documentId = item.documentId

        try {
            if (documentId === null) {
                updateUploadItem(item.id, {status: "uploading", errorMessage: null})
                documentId = (await uploadDocument(item.collectionId, item.file)).id
                updateUploadItem(item.id, {documentId, status: "embedding", errorMessage: null})
            } else {
                updateUploadItem(item.id, {status: "embedding", errorMessage: null})
            }

            await processDocument(documentId)
            updateUploadItem(item.id, {status: "success", errorMessage: null})
            return true
        } catch (error) {
            updateUploadItem(item.id, {
                status: "error",
                errorMessage: getUploadErrorMessage(error),
            })
            return false
        } finally {
            if (documentId !== null && useWorkbenchStore.getState().selectedCollectionId === item.collectionId) {
                await refreshDocuments()
            }
        }
    }

    const uploadFiles = async (files: File[], collection: KnowledgeCollection) => {
        if (uploadingRef.current) return

        const items = files.map<UploadItem>((file) => ({
            id: `${Date.now()}-${++uploadItemSequence}`,
            file,
            collectionId: collection.id,
            collectionName: collection.name,
            documentId: null,
            status: "queued",
            errorMessage: null,
        }))

        setUploadItems((currentItems) => [...currentItems, ...items])
        uploadingRef.current = true
        setUploading(true)
        setImportStatus(`开始向「${collection.name}」导入并嵌入 ${items.length} 个文件。`)

        let successCount = 0

        for (const item of items) {
            if (await importOne(item)) successCount += 1
        }

        uploadingRef.current = false
        setUploading(false)
        setImportStatus(
            successCount === items.length
                ? `${items.length} 个文件已全部导入并完成嵌入。`
                : `${successCount} 个文件嵌入成功，${items.length - successCount} 个文件处理失败。`,
        )
    }

    const retryImport = async (item: UploadItem) => {
        if (uploadingRef.current) return

        uploadingRef.current = true
        setUploading(true)
        setImportStatus(`正在重试${item.documentId === null ? "上传并嵌入" : "嵌入"}「${item.file.name}」。`)

        const succeeded = await importOne(item)

        uploadingRef.current = false
        setUploading(false)
        setImportStatus(succeeded ? `「${item.file.name}」重试成功。` : `「${item.file.name}」重试失败。`)
    }

    return (
        <section className="border-b border-ink/45 bg-paper-warm/45 p-3" aria-label="导入文档">
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.md,.markdown,.txt"
                multiple
                className="sr-only"
                disabled={uploadDisabled}
                aria-describedby="document-upload-hint"
                onChange={(event) => {
                    const files = Array.from(event.currentTarget.files ?? [])
                    event.currentTarget.value = ""

                    if (files.length > 0 && selectedCollection) {
                        void uploadFiles(files, selectedCollection)
                    }
                }}
            />

            <Button
                className="raw-primary-button h-11 w-full rounded-none border-2 border-ink bg-marker-yellow font-black text-ink hover:bg-marker-yellow/80"
                disabled={uploadDisabled}
                onClick={() => fileInputRef.current?.click()}
            >
                <Import data-icon="inline-start" aria-hidden="true"/>
                导入并嵌入
                <span className="ml-auto text-[10px] font-bold">PDF / MD / TXT</span>
            </Button>
            <p id="document-upload-hint" className="mt-2 text-[10px] font-semibold leading-4 text-ink/65">
                {uploading
                    ? "正在逐个上传并嵌入，请等待当前队列完成。"
                    : selectedCollection
                        ? `导入到「${selectedCollection.name}」并生成向量索引`
                        : "请先选择一个集合。"}
            </p>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
                {importStatus}
            </p>

            {uploadItems.length > 0 && (
                <UploadQueue
                    items={uploadItems}
                    uploading={uploading}
                    onRetry={(item) => void retryImport(item)}
                />
            )}
        </section>
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
            className="mt-3 border-2 border-ink bg-paper"
            aria-labelledby="upload-queue-title"
            aria-live="polite"
            aria-busy={uploading}
        >
            <div className="flex min-h-9 items-center border-b border-ink/55 px-3">
                <h2 id="upload-queue-title" className="text-[10px] font-black">IMPORT / 导入与嵌入</h2>
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
                    aria-label={`重试${item.documentId === null ? "上传并嵌入" : "嵌入"} ${item.file.name}`}
                    className="mt-2 rounded-none border-2 border-ink bg-paper font-black"
                >
                    <RotateCcw data-icon="inline-start" aria-hidden="true"/>
                    重试
                </Button>
            )}
        </div>
    )
}

function UploadStatusIcon({status}: { status: UploadItemStatus }) {
    if (status === "uploading" || status === "embedding") {
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
        case "embedding":
            return "嵌入中"
        case "success":
            return "成功"
        case "error":
            return "失败"
    }
}

function getUploadErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "导入失败，请重试"
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
