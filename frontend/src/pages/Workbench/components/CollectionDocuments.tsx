import {useState} from "react"
import {Check, Ellipsis, LoaderCircle, Pencil, RefreshCw, Trash2, X} from "lucide-react"

import type {KnowledgeDocument} from "@/api/workbench/types"
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {cn} from "@/lib/utils"
import {DeleteDocumentDialog} from "@/pages/Workbench/components/CollectionSidebarDialogs"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

export function CollectionDocuments() {
    const documents = useWorkbenchStore((state) => state.documents)
    const selectedDocumentId = useWorkbenchStore((state) => state.selectedDocumentId)
    const documentsLoading = useWorkbenchStore((state) => state.documentsLoading)
    const documentsError = useWorkbenchStore((state) => state.documentsError)
    const selectDocument = useWorkbenchStore((state) => state.selectDocument)
    const updateDocumentTitle = useWorkbenchStore((state) => state.updateDocumentTitle)
    const [renamingDocument, setRenamingDocument] = useState<{ id: number; title: string } | null>(null)
    const [renaming, setRenaming] = useState(false)
    const [renameError, setRenameError] = useState<string | null>(null)
    const [documentToDelete, setDocumentToDelete] = useState<KnowledgeDocument | null>(null)

    return (
        <>
            <div className="ml-3 border-l border-ink/25 bg-paper-warm/45 pb-2 pl-3 pr-1 pt-2">
                <div className="flex items-center gap-2 px-1 pb-1.5 text-[9px] font-black tracking-[0.14em] text-pencil">
                    <span>DOCUMENTS</span>
                    <span className="h-px flex-1 bg-ink/20" aria-hidden="true"/>
                    <span className="tabular-nums">{documents.length}</span>
                </div>

                {documentsLoading && documents.length === 0 ? (
                    <p className="flex items-center gap-2 px-2 py-3 text-xs font-semibold text-pencil">
                        <RefreshCw className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true"/>
                        正在加载文档…
                    </p>
                ) : documentsError ? (
                    <p className="px-2 py-3 text-xs font-semibold text-marker-red">文档列表加载失败</p>
                ) : documents.length === 0 ? (
                    <p className="px-2 py-3 font-reading text-xs italic text-pencil">暂无文档</p>
                ) : (
                    <ul className="panel-scroll max-h-56 overflow-y-auto border-t border-ink/20 bg-paper/70">
                        {documents.map((document) => (
                            <li
                                key={document.id}
                                className={cn(
                                    "group/document grid grid-cols-[minmax(0,1fr)_2rem] border-b border-ink/15 last:border-b-0",
                                    document.id === selectedDocumentId && "bg-marker-yellow/35 font-black shadow-[inset_3px_0_0_var(--marker-blue)]",
                                )}
                            >
                                {renamingDocument?.id === document.id ? (
                                    <form
                                        className="col-span-2 grid min-h-10 grid-cols-[2rem_minmax(0,1fr)_1.75rem_1.75rem] items-center gap-1 px-2 py-1.5"
                                        onSubmit={(event) => {
                                            event.preventDefault()

                                            if (renaming || renamingDocument.title === document.title) {
                                                setRenamingDocument(null)
                                                return
                                            }

                                            setRenaming(true)
                                            setRenameError(null)

                                            updateDocumentTitle(document.id, renamingDocument.title)
                                                .then(() => setRenamingDocument(null))
                                                .catch(error => setRenameError(
                                                    error instanceof Error ? error.message : "修改文档标题失败",
                                                ))
                                                .finally(() => setRenaming(false))
                                        }}
                                    >
                                        <span className="border border-ink/35 bg-paper px-1 py-0.5 text-center font-mono text-[9px] font-black">
                                            {document.documentType === "MARKDOWN"
                                                ? "MD"
                                                : document.documentType === "PLAIN_TEXT" ? "TXT" : "PDF"}
                                        </span>
                                        <Input
                                            autoFocus
                                            value={renamingDocument.title}
                                            disabled={renaming}
                                            onChange={(event) => setRenamingDocument({
                                                id: document.id,
                                                title: event.target.value,
                                            })}
                                            className="h-7 rounded-none border-ink bg-paper px-2 text-xs font-semibold focus-visible:ring-marker-blue/35"
                                        />
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            size="icon-sm"
                                            disabled={renaming}
                                            title="保存标题"
                                            className="rounded-none border-ink bg-marker-yellow text-ink"
                                        >
                                            {renaming
                                                ? <LoaderCircle className="animate-spin motion-reduce:animate-none"/>
                                                : <Check/>}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            disabled={renaming}
                                            title="取消重命名"
                                            className="rounded-none border-ink bg-paper"
                                            onClick={() => setRenamingDocument(null)}
                                        >
                                            <X/>
                                        </Button>
                                        {renameError && (
                                            <p className="col-span-4 wrap-break-word border-l-2 border-destructive px-2 py-1 text-[10px] font-semibold text-destructive">
                                                {renameError}
                                            </p>
                                        )}
                                    </form>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => void selectDocument(document.id)}
                                            className={cn(
                                                "flex min-h-10 min-w-0 cursor-pointer items-center gap-2 px-2 py-2 text-left text-xs hover:bg-kraft/20",
                                                document.id === selectedDocumentId && "hover:bg-marker-yellow/45",
                                            )}
                                        >
                                            <span className="min-w-8 shrink-0 border border-ink/35 bg-paper px-1 py-0.5 text-center font-mono text-[9px] font-black">
                                                {document.documentType === "MARKDOWN"
                                                    ? "MD"
                                                    : document.documentType === "PLAIN_TEXT" ? "TXT" : "PDF"}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate">{document.title}</span>
                                        </button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                type="button"
                                                title="文档操作"
                                                className="flex min-h-10 w-8 items-center justify-center text-pencil opacity-70 outline-none transition-opacity duration-150 hover:bg-kraft/30 hover:text-ink data-popup-open:bg-kraft/30 data-popup-open:text-ink data-popup-open:opacity-100 motion-reduce:transition-none md:opacity-0 md:group-hover/document:opacity-100 md:group-focus-within/document:opacity-100 md:data-popup-open:opacity-100"
                                            >
                                                <Ellipsis className="size-4"/>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                sideOffset={4}
                                                className="w-36 rounded-none border-2 border-ink bg-paper p-1 text-ink shadow-[3px_3px_0_var(--kraft)] duration-0 data-open:animate-none data-closed:animate-none"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setRenamingDocument({id: document.id, title: document.title})
                                                        setRenameError(null)
                                                    }}
                                                    className="rounded-none px-2 py-2 text-xs font-bold data-highlighted:bg-marker-yellow/45"
                                                >
                                                    <Pencil/>
                                                    重命名
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="mx-0 bg-ink/20"/>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => setDocumentToDelete(document)}
                                                    className="rounded-none px-2 py-2 text-xs font-bold"
                                                >
                                                    <Trash2/>
                                                    删除文档
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {documentToDelete && (
                <DeleteDocumentDialog
                    document={documentToDelete}
                    onClose={() => setDocumentToDelete(null)}
                />
            )}
        </>
    )
}
