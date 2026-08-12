import {type Dispatch, type SetStateAction, useState} from "react"
import {Check, LoaderCircle, Plus, Trash2} from "lucide-react"

import type {EmbeddingModelProvider, KnowledgeCollection, KnowledgeDocument} from "@/api/workbench/types"
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
import {Input} from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

export interface CollectionFormState {
    mode: "create" | "edit"
    id: number | null
    name: string
    description: string
    embeddingProvider: string
    embeddingModel: string
}

export function CollectionFormDialog({
    form,
    setForm,
    embeddingModelProviders,
    embeddingModelsLoading,
    embeddingModelsError,
    onCreated,
}: {
    form: CollectionFormState
    setForm: Dispatch<SetStateAction<CollectionFormState | null>>
    embeddingModelProviders: EmbeddingModelProvider[]
    embeddingModelsLoading: boolean
    embeddingModelsError: string | null
    onCreated: (id: number) => void
}) {
    const createCollection = useWorkbenchStore((state) => state.createCollection)
    const updateCollection = useWorkbenchStore((state) => state.updateCollection)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    return (
        <AlertDialog
            open
            onOpenChange={(open) => {
                if (!open && !saving) setForm(null)
            }}
        >
            <AlertDialogContent className="gap-0 rounded-none border-2 border-t-4 border-ink border-t-marker-blue bg-paper p-0 text-ink ring-0 shadow-[5px_5px_0_var(--kraft)] sm:max-w-lg!">
                <form
                    onSubmit={async event => {
                        event.preventDefault()
                        setSaving(true)
                        setError(null)

                        try {
                            if (form.mode === "create") {
                                const collection = await createCollection({
                                    name: form.name,
                                    description: form.description,
                                    embeddingProvider: form.embeddingProvider,
                                    embeddingModel: form.embeddingModel,
                                })

                                onCreated(collection.id)
                            } else {
                                await updateCollection(form.id!, {
                                    name: form.name,
                                    description: form.description,
                                })
                            }

                            setForm(null)
                        } catch (error) {
                            setError(error instanceof Error ? error.message : "保存集合失败")
                        } finally {
                            setSaving(false)
                        }
                    }}
                >
                    <AlertDialogHeader className="gap-1 border-b border-dashed border-ink/35 p-5 text-left">
                        <AlertDialogTitle className="font-display text-xl font-black">
                            {form.mode === "create" ? "新建集合" : "编辑集合"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-semibold leading-6 text-ink/70">
                            {form.mode === "create"
                                ? "创建一个独立的文档与检索空间。"
                                : "修改集合名称和描述，嵌入模型保持不变。"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 p-5">
                        <label className="block space-y-1.5 text-xs font-black tracking-[0.06em]">
                            集合名称
                            <Input
                                autoFocus
                                required
                                maxLength={100}
                                value={form.name}
                                disabled={saving}
                                onChange={event => setForm({...form, name: event.target.value})}
                                className="h-10 rounded-none border-2 border-ink bg-paper text-sm font-semibold tracking-normal focus-visible:ring-marker-blue/35"
                            />
                        </label>

                        <label className="block space-y-1.5 text-xs font-black tracking-[0.06em]">
                            集合描述
                            <Textarea
                                maxLength={1000}
                                value={form.description}
                                disabled={saving}
                                onChange={event => setForm({...form, description: event.target.value})}
                                className="min-h-24 resize-none rounded-none border-2 border-ink bg-paper text-sm font-medium tracking-normal focus-visible:ring-marker-blue/35"
                                placeholder="说明这个集合保存什么内容…"
                            />
                        </label>

                        <div className="space-y-1.5">
                            <p className="text-xs font-black tracking-[0.06em]">嵌入模型</p>
                            <Select
                                value={`${form.embeddingProvider}::${form.embeddingModel}`}
                                disabled={form.mode === "edit" || embeddingModelsLoading || saving}
                                onValueChange={value => {
                                    const [embeddingProvider, embeddingModel] = (value as string).split("::")
                                    setForm({...form, embeddingProvider, embeddingModel})
                                }}
                            >
                                <SelectTrigger className="h-10 w-full rounded-none border-2 border-ink bg-paper px-3 font-mono text-xs disabled:opacity-55">
                                    <SelectValue>
                                        {() => form.embeddingProvider && form.embeddingModel
                                            ? `${form.embeddingProvider} / ${form.embeddingModel}`
                                            : embeddingModelsLoading ? "正在加载嵌入模型…" : "暂无可用嵌入模型"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent
                                    align="start"
                                    className="rounded-none border-2 border-ink bg-paper p-0 text-ink shadow-[3px_3px_0_var(--kraft)] duration-0 data-open:animate-none data-closed:animate-none"
                                >
                                    {embeddingModelProviders.map(provider => (
                                        <SelectGroup key={provider.providerCode}>
                                            <SelectLabel className="font-black uppercase tracking-widest text-pencil">
                                                {provider.providerCode}
                                            </SelectLabel>
                                            {provider.models.map(model => (
                                                <SelectItem
                                                    key={`${provider.providerCode}:${model}`}
                                                    value={`${provider.providerCode}::${model}`}
                                                    className="rounded-none font-mono text-xs data-highlighted:bg-marker-yellow/45"
                                                >
                                                    {model}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="font-reading text-xs italic leading-5 text-pencil">
                                {form.mode === "edit"
                                    ? "集合创建后暂不支持更换嵌入模型。"
                                    : "导入文档后将使用这个模型生成检索向量。"}
                            </p>
                        </div>

                        {(error || (form.mode === "create" && embeddingModelsError)) && (
                            <p className="border-l-4 border-destructive bg-destructive/8 px-3 py-2 text-sm font-semibold text-destructive">
                                {error || embeddingModelsError}
                            </p>
                        )}
                    </div>

                    <AlertDialogFooter className="m-0 rounded-none border-t border-dashed border-ink/35 bg-kraft/10 p-4">
                        <AlertDialogCancel
                            type="button"
                            disabled={saving}
                            className="h-9 rounded-none border-2 border-ink bg-paper px-4 font-black"
                        >
                            取消
                        </AlertDialogCancel>
                        <AlertDialogAction
                            type="submit"
                            disabled={saving || (
                                form.mode === "create" && (
                                    embeddingModelsLoading || !form.embeddingProvider || !form.embeddingModel
                                )
                            )}
                            className="h-9 rounded-none border-2 border-ink bg-marker-yellow px-4 font-black text-ink shadow-[2px_2px_0_var(--ink)] transition-none hover:bg-marker-yellow/80 active:translate-y-px active:shadow-none"
                        >
                            {saving ? (
                                <>
                                    <LoaderCircle className="animate-spin motion-reduce:animate-none"/>
                                    正在保存
                                </>
                            ) : form.mode === "create" ? (
                                <>
                                    <Plus/>
                                    创建集合
                                </>
                            ) : (
                                <>
                                    <Check/>
                                    保存修改
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function DeleteCollectionDialog({
    collection,
    selectedCollectionId,
    onClose,
}: {
    collection: KnowledgeCollection
    selectedCollectionId: number | null
    onClose: () => void
}) {
    const deleteCollection = useWorkbenchStore((state) => state.deleteCollection)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    return (
        <AlertDialog open onOpenChange={(open) => !open && !deleting && onClose()}>
            <AlertDialogContent className="gap-0 rounded-none border-2 border-t-4 border-ink border-t-marker-red bg-paper p-0 text-ink ring-0 shadow-[5px_5px_0_var(--kraft)]">
                <AlertDialogHeader className="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] place-items-start gap-x-3 gap-y-1 border-b border-dashed border-ink/35 p-5 text-left">
                    <AlertDialogMedia className="row-span-2 mb-0 rounded-none border-2 border-ink bg-marker-red/15">
                        <Trash2 className="size-5 text-destructive"/>
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-display text-xl font-black">删除这个集合？</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-semibold leading-6 text-ink/70">
                        集合中的文档、本地文件、检索片段、向量数据和 AI 对话都会被删除，此操作无法撤销。
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="p-5">
                    <p className="wrap-break-word border-l-4 border-marker-red bg-marker-red/8 px-3 py-2 font-mono text-sm font-black">
                        {collection.name}
                    </p>
                    {collection.id === selectedCollectionId && (
                        <p className="mt-3 text-xs font-semibold leading-5 text-pencil">
                            当前正在查看这个集合；未保存的正文修改也会被放弃。
                        </p>
                    )}
                    {error && (
                        <p className="mt-4 border-l-4 border-destructive bg-destructive/8 px-3 py-2 text-sm font-semibold text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <AlertDialogFooter className="m-0 rounded-none border-t border-dashed border-ink/35 bg-kraft/10 p-4">
                    <AlertDialogCancel disabled={deleting} className="h-9 rounded-none border-2 border-ink bg-paper px-4 font-black">
                        取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        variant="destructive"
                        disabled={deleting}
                        onClick={() => {
                            setDeleting(true)
                            setError(null)
                            deleteCollection(collection.id)
                                .then(onClose)
                                .catch(error => setError(error instanceof Error ? error.message : "删除集合失败"))
                                .finally(() => setDeleting(false))
                        }}
                        className="h-9 rounded-none border-2 border-ink bg-marker-red px-4 font-black text-ink shadow-[2px_2px_0_var(--ink)] transition-none hover:bg-marker-red/80 active:translate-y-px active:shadow-none"
                    >
                        {deleting ? (
                            <><LoaderCircle className="animate-spin motion-reduce:animate-none"/>正在删除</>
                        ) : (
                            <><Trash2/>确认删除</>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function DeleteDocumentDialog({document, onClose}: { document: KnowledgeDocument; onClose: () => void }) {
    const deleteDocument = useWorkbenchStore((state) => state.deleteDocument)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    return (
        <AlertDialog open onOpenChange={(open) => !open && !deleting && onClose()}>
            <AlertDialogContent className="gap-0 rounded-none border-2 border-t-4 border-ink border-t-marker-red bg-paper p-0 text-ink ring-0 shadow-[5px_5px_0_var(--kraft)]">
                <AlertDialogHeader className="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] place-items-start gap-x-3 gap-y-1 border-b border-dashed border-ink/35 p-5 text-left">
                    <AlertDialogMedia className="row-span-2 mb-0 rounded-none border-2 border-ink bg-marker-red/15">
                        <Trash2 className="size-5 text-destructive"/>
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-display text-xl font-black">删除这份文档？</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-semibold leading-6 text-ink/70">
                        文档文件、检索片段和向量数据都将被删除，此操作无法撤销。
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="p-5">
                    <p className="wrap-break-word border-l-4 border-marker-red bg-marker-red/8 px-3 py-2 font-mono text-sm font-black">
                        {document.title}
                    </p>
                    {error && (
                        <p className="mt-4 border-l-4 border-destructive bg-destructive/8 px-3 py-2 text-sm font-semibold text-destructive">
                            {error}
                        </p>
                    )}
                </div>

                <AlertDialogFooter className="m-0 rounded-none border-t border-dashed border-ink/35 bg-kraft/10 p-4">
                    <AlertDialogCancel disabled={deleting} className="h-9 rounded-none border-2 border-ink bg-paper px-4 font-black">
                        取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                        type="button"
                        variant="destructive"
                        disabled={deleting}
                        onClick={() => {
                            setDeleting(true)
                            setError(null)
                            deleteDocument(document.id)
                                .then(onClose)
                                .catch(error => setError(error instanceof Error ? error.message : "删除文档失败"))
                                .finally(() => setDeleting(false))
                        }}
                        className="h-9 rounded-none border-2 border-ink bg-marker-red px-4 font-black text-ink shadow-[2px_2px_0_var(--ink)] transition-none hover:bg-marker-red/80 active:translate-y-px active:shadow-none"
                    >
                        {deleting ? (
                            <><LoaderCircle className="animate-spin motion-reduce:animate-none"/>正在删除</>
                        ) : (
                            <><Trash2/>确认删除</>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
