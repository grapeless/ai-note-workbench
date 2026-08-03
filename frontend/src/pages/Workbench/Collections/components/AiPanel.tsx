import {type SubmitEvent, useEffect, useState} from "react"
import {
    Brain,
    Check,
    ChevronDown,
    History,
    LoaderCircle,
    MessageSquare,
    MessageSquarePlus,
    Send,
    Sparkles,
    Trash2,
} from "lucide-react"
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

interface ChatConversation {
    id: string
    title: string
    updatedAt: string
    messages: ChatMessage[]
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

const getConversationTime = () => new Date().toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
})

function AiPanel() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [modelProviders, setModelProviders] = useState<ModelProvider[]>([])
    const [selectedModel, setSelectedModel] = useState<SelectedChatModel | null>(null)
    const [chatMode, setChatMode] = useState<ChatMode>("RAG")
    const [draft, setDraft] = useState("")
    const [modelLoading, setModelLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
    const [conversations, setConversations] = useState<ChatConversation[]>([])
    const selectedCollectionId = useWorkbenchStore(state => state.selectedCollectionId)

    //页面加载时加载可用模型列表
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

    //切换知识库时开始新会话
    useEffect(() => {
        setConversationId(crypto.randomUUID())
        setMessages([])
        setConversations([])
        setError(null)
    }, [selectedCollectionId]);

    //发送消息
    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const content = draft.trim()
        if (!content || sending) return

        //改为禁用按钮而不是抛出异常
        if (!selectedModel || selectedCollectionId === null) return

        const nextMessages: ChatMessage[] = [
            ...messages, {id: crypto.randomUUID(), role: 'user', content}
        ]

        setMessages(nextMessages)
        setConversations(conversations => [{
            id: conversationId,
            title: messages.find(message => message.role === "user")?.content ?? content,
            updatedAt: getConversationTime(),
            messages: nextMessages,
        }, ...conversations.filter(conversation => conversation.id !== conversationId)])

        setDraft('')
        setSending(true)
        setError(null)

        sendChatMessage({
            collectionId: selectedCollectionId,
            providerCode: selectedModel.providerCode,
            modelCode: selectedModel.modelCode,
            message: content,
            mode: chatMode,
            conversationId
        })
            .then(response => {
                setMessages(chatMessages => {
                    const nextMessages: ChatMessage[] = [...chatMessages, {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: response.content
                    }]

                    setConversations(conversations => conversations.map(conversation =>
                        conversation.id === conversationId
                            ? {...conversation, updatedAt: getConversationTime(), messages: nextMessages}
                            : conversation
                    ))

                    return nextMessages
                })
            })
            .catch(e => setError(getErrorMessage(e)))
            .finally(() => setSending(false))
    }

    return (
        <aside className="flex h-full min-h-0 flex-col overflow-hidden bg-paper px-4 pb-5"
               aria-labelledby="ai-title">
            <div className="flex shrink-0 items-center border-b-2 border-ink pt-5 pb-3">
                <div>
                    <h2 id="ai-title" className="font-display text-2xl font-black">ASK / AI</h2>
                    <p className="mt-1 text-[11px] font-semibold">基于当前资料库回答</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={sending}
                        onClick={() => {
                            setConversationId(crypto.randomUUID())
                            setMessages([])
                            setDraft('')
                            setError(null)
                        }}
                        className="h-9 rotate-[0.4deg] rounded-none border-2 border-ink bg-paper px-4 font-black shadow-[2px_2px_0_var(--kraft)] transition-none hover:bg-marker-yellow/35"
                    >
                        <MessageSquarePlus className="size-4.5"/>
                        新对话
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            type="button"
                            disabled={sending}
                            title="历史对话"
                            className="flex size-9 rotate-[-0.4deg] items-center justify-center border-2 border-ink bg-paper shadow-[2px_2px_0_var(--kraft)] outline-none transition-none hover:bg-marker-yellow/35 disabled:opacity-50 data-popup-open:bg-marker-yellow/35"
                        >
                            <History className="size-4.5"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="w-80 max-w-[calc(100vw-2rem)] rounded-none border-2 border-ink bg-paper p-2 text-ink shadow-[4px_4px_0_var(--ink)] duration-0 data-open:animate-none data-closed:animate-none"
                        >
                            <DropdownMenuGroup>
                                <DropdownMenuLabel
                                    className="flex items-center justify-between px-2 py-2 font-black text-ink">
                                    <span>历史对话</span>
                                    <span className="font-mono text-[10px] text-ink/55">{conversations.length}</span>
                                </DropdownMenuLabel>

                                {conversations.length === 0 && (
                                    <DropdownMenuItem disabled
                                                      className="rounded-none px-2 py-5 text-center text-xs text-ink/45">
                                        暂无历史对话
                                    </DropdownMenuItem>
                                )}

                                {conversations.map(conversation => (
                                    <DropdownMenuItem
                                        key={conversation.id}
                                        title={conversation.title}
                                        onClick={() => {
                                            setConversationId(conversation.id)
                                            setMessages(conversation.messages)
                                            setDraft('')
                                            setError(null)
                                        }}
                                        className={cn(
                                            "grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 rounded-none border-b border-ink/15 px-2 py-2.5 data-highlighted:bg-marker-yellow/45",
                                            conversation.id === conversationId && "bg-marker-yellow/65",
                                        )}
                                    >
                                        <span className="flex size-7 items-center justify-center border border-ink/30 bg-paper">
                                            <MessageSquare className="size-3.5"/>
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-xs font-black">{conversation.title}</span>
                                            <span className="mt-0.5 block font-mono text-[10px] text-ink/50">
                                                {conversation.updatedAt}
                                            </span>
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="mx-0 my-1 bg-ink/25"/>
                            <DropdownMenuItem
                                onClick={() => {
                                    setConversations([])
                                    setConversationId(crypto.randomUUID())
                                    setMessages([])
                                    setDraft('')
                                    setError(null)
                                }}
                                className="rounded-none px-2 py-2 font-black data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                            >
                                <Trash2/>
                                清空历史记录
                            </DropdownMenuItem>
                        </DropdownMenuContent>

                    </DropdownMenu>
                </div>
            </div>

            <div className="panel-scroll -mr-4 min-h-0 flex-1 overflow-y-auto pr-4 pt-4">
                <div className="flex flex-col gap-4" aria-live="polite">
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
            </div>

            <form onSubmit={submit}
                  className="relative mt-4 flex min-h-24 shrink-0 flex-col border-2 border-ink bg-paper shadow-[4px_4px_0_var(--kraft)] focus-within:outline-3 focus-within:outline-marker-blue">
                <label htmlFor="ai-follow-up" className="sr-only">继续追问</label>
                <span className="raw-sticker absolute -top-2 left-3 bg-marker-yellow px-1.5 py-0.5 text-[9px] font-black" aria-hidden="true">
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
                        <DropdownMenuContent align="end" sideOffset={8} className={cn(modelMenuPopupClass, "w-max max-w-[calc(100vw-2rem)]")}>
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

                    <Select items={chatModeItems} value={chatMode} onValueChange={(value) => value && setChatMode(value)}>
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
