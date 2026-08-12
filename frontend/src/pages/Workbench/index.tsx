import {type CSSProperties, useEffect, useState} from "react"
import {
    AlertCircle,
    Box,
    Boxes,
    Brain,
    Check,
    ChevronRight,
    Ellipsis,
    LoaderCircle,
    Pencil,
    RefreshCw,
    Settings2,
    Trash2,
    TriangleAlert,
    X,
} from "lucide-react"
import {NavLink, Outlet, useBlocker, useLocation, useNavigate} from "react-router"

import type {KnowledgeCollection, KnowledgeDocument} from "@/api/workbench/types"
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
} from "@/components/ui/alert-dialog"
import {Button} from "@/components/ui/button"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {TooltipProvider} from "@/components/ui/tooltip"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

const topLevelMenuClassName =
    "group/section h-16 cursor-pointer rounded-none border-2 border-workbench-primary bg-workbench-primary-soft px-4 text-left text-ink shadow-[3px_3px_0_var(--workbench-primary)] transition-[background-color,color,box-shadow] duration-150 ease-out hover:bg-kraft/45 data-open:bg-workbench-primary-soft data-open:text-ink data-open:hover:bg-kraft/45 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar active:brightness-95 motion-reduce:transition-none"

const nestedMenuClassName =
    "mx-0 mt-2 translate-x-0 gap-2 border-y border-l-0 border-ink/15 bg-paper/85 px-3 py-3"

const nestedMenuStateClassName =
    "group/nested relative w-full translate-x-0 cursor-pointer justify-start rounded-none border border-ink/25 bg-paper px-4 text-left text-sm font-medium shadow-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-transparent hover:border-ink hover:bg-paper hover:shadow-[2px_2px_0_var(--kraft)] focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar data-active:border-ink data-active:bg-sidebar-accent data-active:font-bold data-active:text-sidebar-accent-foreground data-active:shadow-[3px_3px_0_var(--workbench-primary)] data-active:before:bg-marker-blue data-active:hover:bg-sidebar-accent data-active:hover:shadow-[3px_3px_0_var(--workbench-primary)] motion-reduce:transition-none"

export function Workbench() {
    const location = useLocation()
    const navigate = useNavigate()
    const collections = useWorkbenchStore((state) => state.collections)
    const selectedCollectionId = useWorkbenchStore((state) => state.selectedCollectionId)
    const collectionsLoading = useWorkbenchStore((state) => state.collectionsLoading)
    const collectionsError = useWorkbenchStore((state) => state.collectionsError)
    const loadCollections = useWorkbenchStore((state) => state.loadCollections)
    const selectCollection = useWorkbenchStore((state) => state.selectCollection)
    const selectDocument = useWorkbenchStore((state) => state.selectDocument)
    const openCitation = useWorkbenchStore((state) => state.openCitation)
    const dirtyDocumentId = useWorkbenchStore((state) => state.dirtyDocumentId)
    const pendingSelection = useWorkbenchStore((state) => state.pendingSelection)
    const blocker = useBlocker(dirtyDocumentId !== null)

    const collectionsActive = location.pathname.startsWith("/workbench/collections")
    const settingsActive = location.pathname.startsWith("/workbench/settings")
    const [collectionsOpen, setCollectionsOpen] = useState(!settingsActive)
    const [settingsOpen, setSettingsOpen] = useState(settingsActive)

    useEffect(() => {
        void loadCollections()
    }, [loadCollections])

    return (
        <TooltipProvider>
            <SidebarProvider
                defaultOpen
                className="h-dvh min-h-0 overflow-hidden bg-paper text-ink"
                style={{"--sidebar-width": "20.5rem"} as CSSProperties}
            >
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-marker-yellow focus:p-3 focus:font-bold"
                >
                    跳到主要内容
                </a>

                <Sidebar collapsible="offcanvas" className="border-r-2 border-ink">
                    <SidebarHeader
                        className="relative overflow-hidden border-b-2 border-ink bg-paper-warm px-6 py-5 text-ink">
                        <p className="flex items-center gap-2 text-[10px] font-black tracking-[0.18em] text-pencil">
                            <span className="block h-2 w-6 bg-marker-blue" aria-hidden="true"/>
                            LOCAL-FIRST KNOWLEDGE SYSTEM
                        </p>
                        <h1 className="mt-2 font-display text-[1.7rem] leading-[0.95] font-black tracking-[-0.04em]">
                            AI NOTE
                            <br/>
                            <span
                                className="mt-1 inline-block bg-workbench-primary px-2 py-1 text-workbench-primary-foreground shadow-[3px_3px_0_var(--kraft)]">
                                WORKBENCH
                            </span>
                        </h1>
                        <div className="mt-4 border-t border-ink/20 pt-3">
                            <p className="font-reading text-xs leading-4 italic text-pencil">
                                本地优先 · 可检索 · 有引用
                            </p>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="panel-scroll workbench-sidebar-surface">
                        <SidebarGroup className="p-0">
                            <div
                                className="flex items-center gap-3 px-5 pb-2 pt-4 text-[10px] font-black tracking-[0.16em] text-pencil">
                                <span>WORKSPACE INDEX</span>
                                <span className="h-px flex-1 bg-ink/25" aria-hidden="true"/>
                            </div>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-4 px-3 pb-5">
                                    <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen}
                                                 render={<SidebarMenuItem/>}>
                                        <CollapsibleTrigger
                                            render={
                                                <SidebarMenuButton
                                                    type="button"
                                                    size="lg"
                                                    className={topLevelMenuClassName}/>}>
                                            <Boxes strokeWidth={1.75} className="size-5! text-workbench-primary"
                                                   aria-hidden="true"/>
                                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                <span className="text-[13px] font-black tracking-[0.13em]">
                                                    COLLECTIONS
                                                </span>
                                                <span
                                                    className="font-reading text-xs font-normal italic tracking-normal text-workbench-primary">
                                                    集合 · <span className={'text-base leading-none'}>{collections.length}</span> ITEMS
                                                </span>
                                            </span>
                                            <span
                                                className={cn(
                                                    "ml-auto grid size-8 shrink-0 place-items-center border border-workbench-primary/35 text-workbench-primary",
                                                    collectionsOpen && "bg-workbench-primary text-workbench-primary-foreground",
                                                )}
                                                aria-hidden="true"
                                            >
                                                <ChevronRight
                                                    className={cn(
                                                        "transition-transform duration-150 motion-reduce:transition-none",
                                                        collectionsOpen && "rotate-90",
                                                    )}
                                                />
                                            </span>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <SidebarMenuSub className={nestedMenuClassName}>
                                                <CollectionItems
                                                    collections={collections}
                                                    selectedCollectionId={selectedCollectionId}
                                                    active={collectionsActive}
                                                    loading={collectionsLoading}
                                                    error={collectionsError}
                                                    onRetry={() => void loadCollections()}
                                                    onSelect={(id) => {
                                                        void selectCollection(id)
                                                        navigate("/workbench/collections")
                                                    }}
                                                />
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>

                                    <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}
                                                 render={<SidebarMenuItem/>}>
                                        <CollapsibleTrigger render={
                                            <SidebarMenuButton
                                                type="button"
                                                size="lg"
                                                className={topLevelMenuClassName}/>}>

                                            <Settings2 strokeWidth={1.75} className="size-5! text-workbench-primary"
                                                       aria-hidden="true"/>
                                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                <span className="text-[13px] font-black tracking-[0.13em]">
                                                    SETTINGS
                                                </span>
                                                <span
                                                    className="font-reading text-xs font-normal italic tracking-normal text-workbench-primary">
                                                    设置 · SYSTEM
                                                </span>
                                            </span>
                                            <span
                                                className={cn(
                                                    "ml-auto grid size-8 shrink-0 place-items-center border border-workbench-primary/35 text-workbench-primary",
                                                    settingsOpen && "bg-workbench-primary text-workbench-primary-foreground",
                                                )}
                                                aria-hidden="true"
                                            >
                                                <ChevronRight
                                                    className={cn(
                                                        "transition-transform duration-150 motion-reduce:transition-none",
                                                        settingsOpen && "rotate-90",
                                                    )}
                                                />
                                            </span>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <SidebarMenuSub className={nestedMenuClassName}>
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        render={<NavLink to="/workbench/settings/integrations"/>}
                                                        isActive={location.pathname === "/workbench/settings/integrations"}
                                                        className={cn(
                                                            "min-h-14 py-2.5",
                                                            nestedMenuStateClassName,
                                                        )}
                                                    >
                                                        <span
                                                            className="grid size-8 shrink-0 place-items-center border border-ink/40 bg-paper-warm">
                                                            <Brain strokeWidth={1.75} className="size-4!" aria-hidden="true"/>
                                                        </span>
                                                        <span className="min-w-0 flex-1 text-left">
                                                            <span className="block truncate text-[13px] font-bold leading-5">
                                                                Integrations
                                                            </span>
                                                            <span
                                                                className="block text-xs font-normal leading-4 text-pencil">
                                                                模型与外部服务
                                                            </span>
                                                        </span>
                                                        <ChevronRight
                                                            className="ml-auto size-4! shrink-0 text-pencil"
                                                            aria-hidden="true"
                                                        />
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <SidebarInset
                    id="main-content"
                    className="paper-noise h-dvh min-h-0 overflow-hidden bg-paper"
                >
                    <div className="flex min-h-12 shrink-0 items-center border-b border-ink px-3 md:hidden">
                        <SidebarTrigger aria-label="打开工作台导航"/>
                        <span className="ml-3 text-xs font-black tracking-[0.06em]">AI NOTE WORKBENCH</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-hidden">
                        <Outlet/>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            <AlertDialog
                open={pendingSelection !== null || blocker.state === "blocked"}
                onOpenChange={(open) => {
                    if (open) return

                    useWorkbenchStore.setState({pendingSelection: null})
                    if (blocker.state === "blocked") blocker.reset()
                }}
            >
                <AlertDialogContent className="rotate-[-0.15deg] gap-0 rounded-none border-2 border-t-4 border-ink border-t-marker-yellow bg-paper p-0 text-ink ring-0 shadow-[5px_5px_0_var(--kraft)]">
                    <AlertDialogHeader className="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] place-items-start gap-x-3 gap-y-1 border-b border-dashed border-ink/35 p-5 text-left">
                        <AlertDialogMedia className="row-span-2 mb-0 rounded-none border-2 border-ink bg-marker-yellow/35">
                            <TriangleAlert className="size-5"/>
                        </AlertDialogMedia>
                        <AlertDialogTitle className="font-display text-xl font-black">
                            放弃尚未保存的修改？
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-semibold leading-6 text-ink/70">
                            当前正文仍有修改保存在页面中。继续切换后，这些修改将无法恢复。
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="m-0 rounded-none border-t border-dashed border-ink/35 bg-kraft/10 p-4">
                        <AlertDialogCancel className="h-9 rounded-none border-2 border-ink bg-paper px-4 font-black">
                            继续编辑
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="button"
                            className="h-9 rounded-none border-2 border-ink bg-marker-yellow px-4 font-black text-ink shadow-[2px_2px_0_var(--ink)] transition-none hover:bg-marker-yellow/80 active:translate-y-px active:shadow-none"
                            onClick={() => {
                                useWorkbenchStore.setState({dirtyDocumentId: null, pendingSelection: null})

                                if (pendingSelection?.type === "collection") {
                                    void selectCollection(pendingSelection.id)
                                } else if (pendingSelection?.type === "document") {
                                    void selectDocument(pendingSelection.id)
                                } else if (pendingSelection?.type === "citation") {
                                    void openCitation(pendingSelection.citation)
                                } else if (blocker.state === "blocked") {
                                    blocker.proceed()
                                }
                            }}
                        >
                            放弃并继续
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    )
}

function CollectionItems({
                             collections,
                             selectedCollectionId,
                             active,
                             loading,
                             error,
                             onRetry,
                             onSelect,
                         }: {
    collections: KnowledgeCollection[]
    selectedCollectionId: number | null
    active: boolean
    loading: boolean
    error: string | null
    onRetry: () => void
    onSelect: (id: number) => void
}) {
    const documents = useWorkbenchStore((state) => state.documents)
    const selectedDocumentId = useWorkbenchStore((state) => state.selectedDocumentId)
    const documentsLoading = useWorkbenchStore((state) => state.documentsLoading)
    const documentsError = useWorkbenchStore((state) => state.documentsError)
    const selectDocument = useWorkbenchStore((state) => state.selectDocument)
    const updateDocumentTitle = useWorkbenchStore((state) => state.updateDocumentTitle)
    const deleteDocument = useWorkbenchStore((state) => state.deleteDocument)
    const [expandedCollectionId, setExpandedCollectionId] = useState<number | null>(selectedCollectionId)
    const [renamingDocument, setRenamingDocument] = useState<{ id: number; title: string } | null>(null)
    const [renaming, setRenaming] = useState(false)
    const [renameError, setRenameError] = useState<string | null>(null)
    const [documentToDelete, setDocumentToDelete] = useState<KnowledgeDocument | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    useEffect(() => {
        if (active) setExpandedCollectionId(selectedCollectionId)
        setRenamingDocument(null)
        setRenameError(null)
    }, [active, selectedCollectionId])

    if (loading && collections.length === 0) {
        return (
            <>
                {[0, 1, 2].map((item) => (
                    <SidebarMenuSubItem key={item}>
                        <SidebarMenuSkeleton
                            showIcon
                            className="h-[4.5rem] rounded-none border border-ink/20 bg-paper px-4"
                        />
                    </SidebarMenuSubItem>
                ))}
            </>
        )
    }

    if (error) {
        return (
            <SidebarMenuSubItem>
                <div
                    className="border-2 border-ink bg-marker-red/10 p-4 shadow-[3px_3px_0_var(--marker-red)]"
                    role="alert"
                >
                    <AlertCircle className="size-5 text-marker-red" aria-hidden="true"/>
                    <p className="mt-2 text-sm font-black">集合加载失败</p>
                    <p className="mt-1 wrap-break-word text-xs leading-5 text-pencil">{error}</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-none border-ink bg-paper font-bold shadow-[2px_2px_0_var(--ink)]"
                        disabled={loading}
                        onClick={onRetry}
                    >
                        <RefreshCw
                            data-icon="inline-start"
                            className={cn(loading && "animate-spin motion-reduce:animate-none")}
                            aria-hidden="true"
                        />
                        重新加载
                    </Button>
                </div>
            </SidebarMenuSubItem>
        )
    }

    if (collections.length === 0) {
        return (
            <SidebarMenuSubItem>
                <p
                    className="border border-dashed border-ink/40 bg-paper/80 px-4 py-6 text-center font-reading text-xs italic text-pencil">
                    暂无集合
                </p>
            </SidebarMenuSubItem>
        )
    }

    return (
        <>
            {collections.map((collection) => {
                const selected = collection.id === selectedCollectionId
                const expanded = active && selected && expandedCollectionId === collection.id

                return <SidebarMenuSubItem key={collection.id}>
                <SidebarMenuSubButton
                    render={
                        <button
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                                if (active && selected) {
                                    setExpandedCollectionId(expanded ? null : collection.id)
                                    return
                                }

                                setExpandedCollectionId(collection.id)
                                onSelect(collection.id)
                            }}
                        />
                    }
                    isActive={active && selected}
                    className={cn(
                        "h-auto min-h-[4.5rem] py-3",
                        nestedMenuStateClassName,
                    )}
                >
                    <span className="grid size-8 shrink-0 place-items-center border border-ink/40 bg-paper-warm">
                        <Box strokeWidth={1.75} className="size-4!" aria-hidden="true"/>
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-[13px] font-bold leading-5">{collection.name}</span>
                        {collection.description && (
                            <span className="mt-0.5 block line-clamp-2 text-xs font-normal leading-4 text-pencil">
                                {collection.description}
                            </span>
                        )}
                    </span>
                    <ChevronRight
                        className={cn(
                            "ml-auto size-4! shrink-0 text-pencil transition-transform duration-150 motion-reduce:transition-none",
                            expanded && "rotate-90",
                        )}
                        aria-hidden="true"
                    />
                </SidebarMenuSubButton>

                {expanded && (
                    <div className="mt-1 border-x border-b border-ink/25 bg-paper-warm/70 px-2 pb-2 pt-3">
                        <div className="flex items-center gap-2 px-1 pb-2 text-[9px] font-black tracking-[0.14em] text-pencil">
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
                            <ul className="panel-scroll max-h-56 overflow-y-auto border-y border-ink/20 bg-paper/75">
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
                                                        className="flex min-h-10 w-8 items-center justify-center text-pencil opacity-60 outline-none hover:bg-kraft/30 hover:text-ink group-hover/document:opacity-100 data-popup-open:bg-kraft/30 data-popup-open:text-ink data-popup-open:opacity-100"
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
                                                            onClick={() => {
                                                                setDocumentToDelete(document)
                                                                setDeleteError(null)
                                                            }}
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
                )}
                </SidebarMenuSubItem>
            })}

            {documentToDelete && (
                <AlertDialog
                    open
                    onOpenChange={(open) => {
                        if (!open && !deleting) setDocumentToDelete(null)
                    }}
                >
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
                                {documentToDelete.title}
                            </p>
                            {deleteError && (
                                <p className="mt-4 border-l-4 border-destructive bg-destructive/8 px-3 py-2 text-sm font-semibold text-destructive">
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

                                    deleteDocument(documentToDelete.id)
                                        .then(() => setDocumentToDelete(null))
                                        .catch(error => setDeleteError(
                                            error instanceof Error ? error.message : "删除文档失败",
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
            )}
        </>
    )
}
