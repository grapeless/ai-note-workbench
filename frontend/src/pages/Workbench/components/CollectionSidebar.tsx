import {useEffect, useState} from "react"
import {AlertCircle, Box, Boxes, ChevronRight, Ellipsis, Pencil, Plus, RefreshCw, Trash2,} from "lucide-react"

import {listEmbeddingModels} from "@/api/workbench/collections"
import type {EmbeddingModelProvider, KnowledgeCollection} from "@/api/workbench/types"
import {Button} from "@/components/ui/button"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem,} from "@/components/ui/sidebar"
import {cn} from "@/lib/utils"
import {CollectionDocuments} from "@/pages/Workbench/components/CollectionDocuments"
import {
    CollectionFormDialog,
    type CollectionFormState,
    DeleteCollectionDialog,
} from "@/pages/Workbench/components/CollectionSidebarDialogs"

export function CollectionSidebar({
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
    const [collectionsOpen, setCollectionsOpen] = useState(active)
    const [expandedCollectionId, setExpandedCollectionId] = useState<number | null>(selectedCollectionId)
    const [collectionForm, setCollectionForm] = useState<CollectionFormState | null>(null)
    const [embeddingModelProviders, setEmbeddingModelProviders] = useState<EmbeddingModelProvider[]>([])
    const [embeddingModelsLoading, setEmbeddingModelsLoading] = useState(true)
    const [embeddingModelsError, setEmbeddingModelsError] = useState<string | null>(null)
    const [collectionToDelete, setCollectionToDelete] = useState<KnowledgeCollection | null>(null)

    useEffect(() => {
        listEmbeddingModels()
            .then(providers => {
                setEmbeddingModelProviders(providers)
                setEmbeddingModelsError(null)
                setCollectionForm(current => current?.mode === "create" ? {
                    ...current,
                    embeddingProvider: providers[0]?.providerCode ?? "",
                    embeddingModel: providers[0]?.models[0] ?? "",
                } : current)
            })
            .catch(error => setEmbeddingModelsError(
                error instanceof Error ? error.message : "嵌入模型加载失败",
            ))
            .finally(() => setEmbeddingModelsLoading(false))
    }, [])

    useEffect(() => {
        if (active) {
            setCollectionsOpen(true)
            setExpandedCollectionId(selectedCollectionId)
        }
    }, [active, selectedCollectionId])

    return (
        <>
            <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen} render={<SidebarMenuItem/>}>
                <div className={cn(
                    "group/section h-16 cursor-pointer rounded-none border-2 border-workbench-primary bg-workbench-primary-soft px-4 text-left text-ink shadow-[3px_3px_0_var(--workbench-primary)] transition-[background-color,color,box-shadow] duration-150 ease-out hover:bg-kraft/45 data-open:bg-workbench-primary-soft data-open:text-ink data-open:hover:bg-kraft/45 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar active:brightness-95 motion-reduce:transition-none",
                    "grid grid-cols-[minmax(0,1fr)_2.5rem_3.5rem] p-0",
                )}>
                    <CollapsibleTrigger
                        render={
                            <button
                                type="button"
                                className="flex min-w-0 items-center gap-3 px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring"
                            />
                        }
                    >
                        <Boxes strokeWidth={1.75} className="size-5! shrink-0 text-workbench-primary" aria-hidden="true"/>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="text-[13px] font-black tracking-[0.13em]">COLLECTIONS</span>
                            <span className="font-reading text-xs font-normal italic tracking-normal text-workbench-primary">
                                集合 · <span className="font-sans not-italic tabular-nums">{collections.length}</span> ITEMS
                            </span>
                        </span>
                    </CollapsibleTrigger>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="新建集合"
                        className="h-full w-10 rounded-none border-0 bg-transparent text-workbench-primary shadow-none hover:bg-marker-yellow hover:text-ink active:bg-marker-yellow/70"
                        onClick={() => {
                            setCollectionForm({
                                mode: "create",
                                id: null,
                                name: "",
                                description: "",
                                embeddingProvider: embeddingModelProviders[0]?.providerCode ?? "",
                                embeddingModel: embeddingModelProviders[0]?.models[0] ?? "",
                            })
                        }}
                    >
                        <Plus strokeWidth={1.75}/>
                    </Button>

                    <CollapsibleTrigger
                        render={
                            <button
                                type="button"
                                title={collectionsOpen ? "收起集合" : "展开集合"}
                                className="flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring"
                            />
                        }
                    >
                        <span
                            className={cn(
                                "grid size-8 place-items-center border border-workbench-primary/35 text-workbench-primary",
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
                </div>

                <CollapsibleContent>
                    <SidebarMenuSub className="mx-0 mt-2 translate-x-0 gap-1.5 border-y border-l-0 border-ink/15 bg-paper/85 px-2 py-2">

                        {loading && collections.length === 0 ? (
                            [0, 1, 2].map((item) => (
                                <SidebarMenuSubItem key={item}>
                                    <SidebarMenuSkeleton
                                        showIcon
                                        className="h-14 rounded-none border border-ink/20 bg-paper px-3"
                                    />
                                </SidebarMenuSubItem>
                            ))
                        ) : error ? (
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
                        ) : collections.length === 0 ? (
                            <SidebarMenuSubItem>
                                <p className="border border-dashed border-ink/40 bg-paper/80 px-4 py-6 text-center font-reading text-xs italic text-pencil">
                                    暂无集合
                                </p>
                            </SidebarMenuSubItem>
                        ) : collections.map((collection) => {
                            const selected = collection.id === selectedCollectionId
                            const expanded = active && selected && expandedCollectionId === collection.id

                            return (
                                <SidebarMenuSubItem key={collection.id}>
                                    <div
                                        data-active={active && selected ? "true" : undefined}
                                        className={cn(
                                            "group/nested relative w-full translate-x-0 cursor-pointer justify-start rounded-none border border-ink/25 bg-paper px-4 text-left text-sm font-medium shadow-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-transparent hover:border-ink hover:bg-paper hover:shadow-[2px_2px_0_var(--kraft)] focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar data-active:border-ink data-active:bg-sidebar-accent data-active:font-bold data-active:text-sidebar-accent-foreground data-active:shadow-[3px_3px_0_var(--workbench-primary)] data-active:before:bg-marker-blue data-active:hover:bg-sidebar-accent data-active:hover:shadow-[3px_3px_0_var(--workbench-primary)] motion-reduce:transition-none",
                                            "group/collection grid min-h-14 grid-cols-[minmax(0,1fr)_2.5rem] px-0 hover:shadow-none data-active:shadow-none data-active:hover:shadow-none",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            aria-pressed={selected}
                                            aria-expanded={expanded}
                                            className="flex min-w-0 items-center gap-2.5 px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                                            onClick={() => {
                                                if (active && selected) {
                                                    setExpandedCollectionId(expanded ? null : collection.id)
                                                    return
                                                }
    
                                                setExpandedCollectionId(collection.id)
                                                onSelect(collection.id)
                                            }}
                                        >
                                            <span className="grid size-8 shrink-0 place-items-center border border-ink/40 bg-paper-warm">
                                                <Box strokeWidth={1.75} className="size-4!" aria-hidden="true"/>
                                            </span>
                                            <span className="min-w-0 flex-1 text-left">
                                                <span className="block truncate text-[13px] font-bold leading-4">{collection.name}</span>
                                                {collection.description && (
                                                    <span className="mt-1 block truncate text-[11px] font-normal leading-4 text-pencil">
                                                        {collection.description}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
    
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                type="button"
                                                title="集合操作"
                                                className="flex min-h-14 items-center justify-center text-pencil opacity-70 outline-none transition-opacity duration-150 hover:bg-kraft/30 hover:text-ink data-popup-open:bg-kraft/30 data-popup-open:text-ink data-popup-open:opacity-100 motion-reduce:transition-none md:opacity-0 md:group-hover/collection:opacity-100 md:group-focus-within/collection:opacity-100 md:data-popup-open:opacity-100"
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
                                                        setCollectionForm({
                                                            mode: "edit",
                                                            id: collection.id,
                                                            name: collection.name,
                                                            description: collection.description ?? "",
                                                            embeddingProvider: collection.embeddingProvider ?? "",
                                                            embeddingModel: collection.embeddingModel ?? "",
                                                        })
                                                    }}
                                                    className="rounded-none px-2 py-2 text-xs font-bold data-highlighted:bg-marker-yellow/45"
                                                >
                                                    <Pencil/>
                                                    编辑集合
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="mx-0 bg-ink/20"/>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => setCollectionToDelete(collection)}
                                                    className="rounded-none px-2 py-2 text-xs font-bold"
                                                >
                                                    <Trash2/>
                                                    删除集合
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {expanded && <CollectionDocuments/>}
                                </SidebarMenuSubItem>
                            )
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>

            {collectionForm && (
                <CollectionFormDialog
                    form={collectionForm}
                    setForm={setCollectionForm}
                    embeddingModelProviders={embeddingModelProviders}
                    embeddingModelsLoading={embeddingModelsLoading}
                    embeddingModelsError={embeddingModelsError}
                    onCreated={(id) => {
                        setExpandedCollectionId(id)
                        onSelect(id)
                    }}
                />
            )}

            {collectionToDelete && (
                <DeleteCollectionDialog
                    collection={collectionToDelete}
                    selectedCollectionId={selectedCollectionId}
                    onClose={() => setCollectionToDelete(null)}
                />
            )}

        </>
    )
}
