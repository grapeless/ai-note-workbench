import {type SubmitEvent, useEffect, useState} from "react"
import {Brain, Check, ChevronDown, LoaderCircle, Send, Sparkles} from "lucide-react"
import {cn} from "@/lib/utils"
import {listChatModels, sendChatMessage} from "@/api/workbench/chat"
import type {ChatMode, ModelProvider} from "@/api/workbench/types"
import {useWorkbenchStore} from "@/store/useWorkbenchStore.ts";
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
}

type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

interface SelectedChatModel {
    providerCode: string
    modelCode: string
    reasoningEffort: ReasoningEffort
}

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "请求失败，请稍后重试"

const chatModeItems: { label: string; value: ChatMode }[] = [
    {label: "知识库", value: "RAG"},
    {label: "自动", value: "AUTO"},
    {label: "通用", value: "PLAIN"},
]

const reasoningEffortLabels: Record<ReasoningEffort, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    xhigh: "Extra",
    max: "Max",
}

const reasoningEfforts: ReasoningEffort[] = ["low", "medium", "high", "xhigh", "max"]

const modelMenuPopupClass =
    "z-50 max-h-(--available-height) min-w-52 overflow-y-auto border-2 border-ink bg-paper py-1 text-ink shadow-[4px_4px_0_var(--ink)] outline-none"

const modelMenuItemClass =
    "flex min-w-0 cursor-default items-center gap-2 px-3 py-2 text-sm font-bold outline-none select-none data-highlighted:bg-marker-yellow/60"

function AiPanel() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [modelProviders, setModelProviders] = useState<ModelProvider[]>([])
    const [selectedModel, setSelectedModel] = useState<SelectedChatModel | null>(null)
    const [chatMode, setChatMode] = useState<ChatMode>("RAG")
    const [draft, setDraft] = useState("")
    const [modelLoading, setModelLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const selectedCollectionId = useWorkbenchStore(state => state.selectedCollectionId)

    useEffect(() => {
        setModelLoading(true)
        setError(null)

        listChatModels()
            .then(providers => {
                const provider = providers[0]
                const modelCode = provider?.defaultModel

                if (!provider || !modelCode) {
                    throw new Error("当前没有可用的 AI 模型")
                }

                if (!provider.models.some(model => model.code === modelCode)) {
                    throw new Error("默认 AI 模型不可用")
                }

                setModelProviders(providers)
                setSelectedModel({
                    providerCode: provider.providerCode,
                    modelCode,
                    reasoningEffort: "medium",
                })
            })
            .catch(e => setError(getErrorMessage(e)))
            .finally(() => setModelLoading(false))
    }, [])

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const content = draft.trim()
        if (!content || sending) return

        //改为禁用按钮而不是抛出异常
        if (!selectedModel || selectedCollectionId === null) return

        setMessages(chatMessages => [
            ...chatMessages, {id: crypto.randomUUID(), role: 'user', content}
        ])

        setDraft('')
        setSending(true)
        setError(null)

        sendChatMessage({
            providerCode: selectedModel.providerCode,
            modelCode: selectedModel.modelCode,
            message: content,
            collectionId: selectedCollectionId,
            mode: chatMode
        })
            .then(response => {
                setMessages(chatMessage => [...chatMessage, {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.content
                }])
            })
            .catch(e => setError(getErrorMessage(e)))
            .finally(() => setSending(false))
    }

    return (
        <aside className="panel-scroll flex h-full flex-col overflow-y-auto bg-paper px-4 py-5"
               aria-labelledby="ai-title">
            <div className="flex items-start border-b-2 border-ink pb-3">
                <div>
                    <h2 id="ai-title" className="font-display text-2xl font-black">ASK / AI</h2>
                    <p className="mt-1 text-[11px] font-semibold">基于当前资料库回答</p>
                </div>
                <Sparkles className="ml-auto size-6" strokeWidth={1.5} aria-hidden="true"/>
            </div>

            <div className="flex flex-1 flex-col gap-4" aria-live="polite">
                {messages.map((message) => (
                    <div key={message.id}>
                        <p className="mb-1.5 text-[10px] font-black uppercase">
                            {message.role === "user" ? "YOU /" : "WORKBENCH /"}
                        </p>
                        <div className={cn(
                            "border-2 border-ink p-3 text-sm leading-6",
                            message.role === "assistant" ? "bg-white/30" : "bg-paper",
                        )}>
                            {message.content}
                        </div>
                    </div>
                ))}
                {sending && (
                    <p className={'text-sm font-semibold'} role={"status"}>
                        <span className={'shimmer'}>正在思考...</span>
                    </p>
                )}
                {error && (
                    <p className={'text-sm font-semibold text-destructive'} role={"alert"}>{error}</p>
                )}
            </div>

            <form onSubmit={submit}
                  className="relative mt-4 flex min-h-24 flex-col border-2 border-ink bg-paper shadow-[4px_4px_0_var(--kraft)] focus-within:outline-3 focus-within:outline-marker-blue">
                <label htmlFor="ai-follow-up" className="sr-only">继续追问</label>
                <span className="raw-sticker absolute -top-2 left-3 bg-marker-yellow px-1.5 py-0.5 text-[9px] font-black"
                      aria-hidden="true">
                    PROMPT /
                </span>
                <Textarea
                    id="ai-follow-up"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault()
                            event.currentTarget.form?.requestSubmit()
                        }
                    }}
                    placeholder="继续追问…"
                    className="min-h-12 flex-1 resize-none rounded-none border-0 bg-transparent px-4 pt-4 pb-2 text-sm font-semibold leading-6 shadow-none placeholder:text-ink/45 focus-visible:ring-0"
                />

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-ink/35 px-3 py-2.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            type="button"
                            disabled={modelLoading || !modelProviders.some(provider => provider.models.length > 0)}
                            aria-label="选择 AI 模型和思考等级"
                            title={selectedModel
                                ? `${selectedModel.modelCode} ${reasoningEffortLabels[selectedModel.reasoningEffort]}`
                                : undefined}
                            className="flex h-9 max-w-72 min-w-0 rotate-[-0.4deg] items-center gap-1.5 border-2 border-ink bg-paper px-3 font-mono text-sm font-bold shadow-[2px_2px_0_var(--kraft)] outline-none transition-none hover:bg-marker-yellow/35 focus-visible:ring-3 focus-visible:ring-marker-blue/35 disabled:cursor-not-allowed disabled:opacity-50 data-popup-open:bg-marker-yellow/35"
                        >
                            <Sparkles className="size-4 shrink-0 text-marker-blue" aria-hidden="true"/>
                            <span className="min-w-0 truncate">{selectedModel?.modelCode ?? "选择模型"}</span>
                            {selectedModel && (
                                <span className="shrink-0 font-sans text-xs font-semibold text-ink/55">
                                    {reasoningEffortLabels[selectedModel.reasoningEffort]}
                                </span>
                            )}
                            <ChevronDown className="size-4 shrink-0 text-ink/65" aria-hidden="true"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}
                                             className={cn(modelMenuPopupClass, "w-max max-w-[calc(100vw-2rem)]")}>
                            {modelProviders.map(provider => (
                                <DropdownMenuGroup key={provider.providerCode}>
                                    <DropdownMenuLabel
                                        className="px-3 py-1 text-[10px] font-black tracking-wide text-ink/60">
                                        {provider.providerCode}
                                    </DropdownMenuLabel>
                                    {provider.models.map(model => {
                                        const selected = selectedModel?.providerCode === provider.providerCode
                                            && selectedModel.modelCode === model.code

                                        return (
                                            <DropdownMenuItem
                                                key={model.code}
                                                title={model.code}
                                                onClick={() => setSelectedModel({
                                                    providerCode: provider.providerCode,
                                                    modelCode: model.code,
                                                    reasoningEffort: selectedModel?.reasoningEffort ?? "medium",
                                                })}
                                                className={modelMenuItemClass}
                                            >
                                                <span className="min-w-0 max-w-64 flex-1 truncate">{model.code}</span>
                                                <Check className={cn(
                                                    "ml-auto size-4 shrink-0",
                                                    selected ? "opacity-100" : "opacity-0",
                                                )} aria-hidden="true"/>
                                            </DropdownMenuItem>
                                        )
                                    })}
                                </DropdownMenuGroup>
                            ))}

                            <DropdownMenuSeparator className="mx-2 my-1 h-px bg-ink/30"/>

                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger
                                    openOnHover
                                    className={cn(modelMenuItemClass, "justify-between data-popup-open:bg-marker-yellow/60")}
                                >
                                    <span>思考等级</span>
                                    <span className="ml-5 text-ink/60">
                                        {selectedModel && reasoningEffortLabels[selectedModel.reasoningEffort]}
                                    </span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent sideOffset={6}
                                                        className={cn(modelMenuPopupClass, "min-w-40")}>
                                    <DropdownMenuRadioGroup
                                        value={selectedModel?.reasoningEffort}
                                        onValueChange={(value: ReasoningEffort) => setSelectedModel(model =>
                                            model ? {...model, reasoningEffort: value} : model
                                        )}
                                    >
                                        <DropdownMenuLabel
                                            className="px-3 py-1 text-[10px] font-black tracking-wide text-ink/60">
                                            THINKING /
                                        </DropdownMenuLabel>
                                        {reasoningEfforts.map(effort => (
                                            <DropdownMenuRadioItem
                                                key={effort}
                                                value={effort}
                                                closeOnClick
                                                className={cn(modelMenuItemClass, "pr-8")}
                                            >
                                                {reasoningEffortLabels[effort]}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Select items={chatModeItems} value={chatMode}
                            onValueChange={(value) => value && setChatMode(value)}>
                        <SelectTrigger aria-label="选择对话模式"
                                       className="rotate-[0.35deg] rounded-none border-2 border-ink bg-paper px-3 font-black shadow-[2px_2px_0_var(--kraft)] transition-none data-[size=default]:h-9 data-[size=default]:rounded-none hover:bg-marker-yellow/35">
                            <Brain data-icon="inline-start" className="text-pencil" aria-hidden="true"/>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false} align="end"
                                       className="rounded-none border-2 border-ink bg-paper shadow-[4px_4px_0_var(--ink)] duration-0 data-open:animate-none data-closed:animate-none">
                            <SelectGroup>
                                {chatModeItems.map(item => (
                                    <SelectItem key={item.value} value={item.value}
                                                className="rounded-none py-2 font-bold focus:bg-marker-yellow/60">
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Button
                        type="submit"
                        size="icon-lg"
                        disabled={!draft.trim() || sending || modelLoading || !selectedModel || selectedCollectionId === null}
                        aria-label={sending ? "正在发送" : "发送消息"}
                        className="rounded-none border-2 border-ink bg-marker-yellow text-ink shadow-[2px_2px_0_var(--kraft)] transition-none hover:bg-marker-yellow/80 focus-visible:ring-marker-blue/35 active:translate-y-px active:shadow-none"
                    >
                        {sending
                            ? <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true"/>
                            : <Send aria-hidden="true"/>}
                    </Button>
                </div>
            </form>
        </aside>
    )
}

export default AiPanel
