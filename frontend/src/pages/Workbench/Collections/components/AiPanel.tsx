import {memo, type SubmitEvent, useEffect, useState} from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
    Brain,
    Check,
    ChevronDown,
    History,
    LoaderCircle,
    MessageCircle,
    MessageSquarePlus,
    Send,
    Sparkles,
    Trash2,
} from "lucide-react"
import {cn} from "@/lib/utils"
import {
    clearChatConversations,
    deleteChatConversation,
    listChatConversations,
    listChatMessages,
    listChatModels,
    sendChatMessage,
} from "@/api/workbench/chat"
import type {ChatConversation, ChatResponse, HistoryChatMessage, ModelProvider} from "@/api/workbench/types"
import {useWorkbenchStore} from "@/store/useWorkbenchStore.ts";
import {Button} from "@/components/ui/button"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Textarea} from "@/components/ui/textarea"

interface UserChatMessage {
    /**
     * React 渲染和流式更新时用于定位消息
     */
    id: string
    role: 'user'
    /**
     * 用户消息内容
     */
    content: string
}

interface AssistantChatMessage {
    /**
     * React 渲染和流式更新时用于定位消息
     */
    id: string
    role: 'assistant'
    /**
     * 模型的思考内容
     */
    reasoningContent: string
    /**
     * 思考过程折叠区域是否展开。
     */
    reasoningOpen: boolean
    /**
     * 这条 AI 消息是否还在接收流式数据。
     */
    streaming: boolean
    /**
     * 最终回答。
     */
    content: string
}

/**
 * 一条对话消息
 */
type ChatMessage = UserChatMessage | AssistantChatMessage

interface SelectedChatModel {
    providerCode: string
    modelCode: string
}

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "请求失败，请稍后重试"

const modelMenuPopupClass = "z-50 max-h-(--available-height) min-w-52 overflow-y-auto border-2 border-ink bg-paper py-1 text-ink shadow-[4px_4px_0_var(--ink)] outline-none"

const modelMenuItemClass = "flex min-w-0 cursor-default items-center gap-2 px-3 py-2 text-sm font-bold outline-none select-none data-highlighted:bg-marker-yellow/60"

/**
 * 追加消息
 * @param chatMessages 当前消息数组
 * @param assistantMessageId 正在生成的AI回复的ID
 * @param chatResponse 后端刚推送的一小段内容
 */
const applyChatResponse = (chatMessages: ChatMessage[], assistantMessageId: string, chatResponse: ChatResponse) =>
    //使用map返回新对象
    chatMessages.map(chatMessage => {
        //只对现在正在生成的助手消息追加
        if (chatMessage.role !== "assistant" || chatMessage.id !== assistantMessageId) return chatMessage
        //追加到思考内容
        if (chatResponse.type === "REASONING_DELTA") {
            return {
                ...chatMessage,
                reasoningContent: chatMessage.reasoningContent + chatResponse.content,
                reasoningOpen: true
            }
        }
        //追加到回复
        return {
            ...chatMessage,
            // 表示收到第一段正式回答时，因为原来的 content 还是空字符串，所以自动收起思考过程；
            // 之后继续接收正文时，保持用户当前的展开/收起状态。
            reasoningOpen: chatMessage.content.length === 0 ? false : chatMessage.reasoningOpen,
            content: chatMessage.content + chatResponse.content
        }
    })

const toChatMessage = (historyChatMessage: HistoryChatMessage): ChatMessage => {
    if (historyChatMessage.role === "USER") {
        return {
            id: historyChatMessage.id,
            role: "user",
            content: historyChatMessage.content
        }
    }
    return {
        id: historyChatMessage.id,
        role: "assistant",
        reasoningContent: historyChatMessage.reasoningContent ?? "",
        reasoningOpen: false,
        streaming: false,
        content: historyChatMessage.content
    }
}

/**
 * 找到对应AI消息，将其streaming改为false。
 */
const finishChatMessage = (messages: ChatMessage[], assistantMessageId: string) =>
    messages.map(message =>
        message.role === "assistant" && message.id === assistantMessageId
            ? {...message, streaming: false}
            : message
    )

const MarkdownContent = memo(({content}: { content: string }) => (
    <div className="wrap-break-word space-y-3 overflow-x-auto [&_a]:font-bold [&_a]:text-marker-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-marker-blue [&_blockquote]:pl-3 [&_blockquote]:text-ink/70 [&_code]:bg-kraft/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h1]:font-display [&_h1]:text-xl [&_h1]:font-black [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-black [&_h3]:font-black [&_hr]:border-ink/35 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-ink/35 [&_pre]:bg-ink [&_pre]:p-3 [&_pre]:text-paper [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-paper [&_strong]:font-black [&_table]:min-w-full [&_table]:border-collapse [&_td]:border [&_td]:border-ink/35 [&_td]:p-2 [&_th]:border [&_th]:border-ink/35 [&_th]:bg-kraft/20 [&_th]:p-2 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5">
        <Markdown remarkPlugins={[remarkGfm]} skipHtml>
            {content}
        </Markdown>
    </div>
))


function AiPanel() {
    //当前界面展示的会话
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    //当前会话ID，后端使用其从Redis中找到之前的上下文
    const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
    //历史会话列表
    const [chatHistoryList, setChatHistoryList] = useState<ChatConversation[]>([])
    //用户输入
    const [draft, setDraft] = useState("")
    //可用模型列表
    const [modelProviders, setModelProviders] = useState<ModelProvider[]>([])
    //当前选择的模型
    const [selectedModel, setSelectedModel] = useState<SelectedChatModel | null>(null)
    //模型加载状态
    const [modelLoading, setModelLoading] = useState(true)
    //请求状态
    const [sending, setSending] = useState(false)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    //来自工作台Store，代表当前选择的知识库
    const selectedCollectionId = useWorkbenchStore(state => state.selectedCollectionId)

    //页面加载时加载可用模型列表
    useEffect(() => {
        setModelLoading(true)
        setError(null)

        listChatModels()
            .then(providers => {
                const provider = providers[0]
                const modelCode = provider.defaultModel

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
                })
            })
            .catch(e => setError(getErrorMessage(e)))
            .finally(() => setModelLoading(false))
    }, [])

    //切换知识库时开始新会话
    useEffect(() => {
        setConversationId(crypto.randomUUID())
        setChatMessages([])
        setChatHistoryList([])
        setError(null)
        if (selectedCollectionId === null) return

        listChatConversations(selectedCollectionId)
            .then(setChatHistoryList)
            .catch(error => setError(getErrorMessage(error)))
    }, [selectedCollectionId]);

    //发送消息
    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const content = draft.trim()
        if (!content || sending || messagesLoading) return

        //改为禁用按钮而不是抛出异常
        if (!selectedModel || selectedCollectionId === null) return

        const assistantMessageId = crypto.randomUUID()

        //生成新的消息数组：旧消息+ 本次用户消息+ 一条空的 AI 消息
        const nextMessages: ChatMessage[] = [
            ...chatMessages,
            {
                id: crypto.randomUUID(),
                role: "user",
                content
            },
            {
                id: assistantMessageId,
                role: "assistant",
                reasoningContent: "",
                reasoningOpen: true,
                streaming: true,
                content: ""
            }
        ]
        setChatMessages(nextMessages)

        setDraft("")
        setSending(true)
        setError(null)

        sendChatMessage({
            collectionId: selectedCollectionId,
            providerCode: selectedModel.providerCode,
            modelCode: selectedModel.modelCode,
            message: content,
            conversationId
        }, chatResponse => {
            //每收到一个流式事件就执行一次
            setChatMessages(current => applyChatResponse(current, assistantMessageId, chatResponse))
        })
            .catch(error => setError(getErrorMessage(error)))
            .finally(() => {
                setChatMessages(current => finishChatMessage(current, assistantMessageId))
                setSending(false)
                listChatConversations(selectedCollectionId)
                    .then(setChatHistoryList)
                    .catch(error => setError(getErrorMessage(error)))
            })
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
                        disabled={sending || messagesLoading}
                        onClick={() => {
                            setConversationId(crypto.randomUUID())
                            setChatMessages([])
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
                            disabled={sending || messagesLoading}
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
                                    <span className="font-mono text-[10px] text-ink/55">{chatHistoryList.length}</span>
                                </DropdownMenuLabel>

                                {chatHistoryList.length === 0 && (
                                    <DropdownMenuItem disabled
                                                      className="rounded-none px-2 py-5 text-center text-xs text-ink/45">
                                        暂无历史对话
                                    </DropdownMenuItem>
                                )}

                                {chatHistoryList.map(conversation => (
                                    <DropdownMenuItem
                                        key={conversation.id}
                                        title={conversation.title}
                                        onClick={() => {
                                            setConversationId(conversation.id)
                                            setChatMessages([])
                                            setDraft("")
                                            setError(null)
                                            setMessagesLoading(true)

                                            listChatMessages(conversation.id)
                                                .then(messages => setChatMessages(messages.map(toChatMessage)))
                                                .catch(error => setError(getErrorMessage(error)))
                                                .finally(() => setMessagesLoading(false))
                                        }}
                                        className={cn(
                                            "grid grid-cols-[1.75rem_minmax(0,1fr)_1.75rem] gap-2 rounded-none border-b border-ink/15 px-2 py-2.5 data-highlighted:bg-marker-yellow/45",
                                            conversation.id === conversationId && "bg-marker-yellow/65",
                                        )}
                                    >
                                        <span className="flex size-7 items-center justify-center border border-ink/30 bg-paper">
                                            <MessageCircle className="size-3.5"/>
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-xs font-black">{conversation.title}</span>
                                            <span className="mt-0.5 block font-mono text-[10px] text-ink/50">
                                                  {new Date(conversation.updateTime).toLocaleString("zh-CN", {
                                                      month: "2-digit",
                                                      day: "2-digit",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })}
                                            </span>
                                        </span>
                                        <button type="button" title="删除会话"
                                                className="flex size-7 items-center justify-center text-ink/45 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={event => {
                                                    event.stopPropagation()
                                                    setError(null)

                                                    deleteChatConversation(conversation.id)
                                                        .then(() => {
                                                            setChatHistoryList(current =>
                                                                current.filter(item => item.id !== conversation.id)
                                                            )

                                                            if (conversation.id === conversationId) {
                                                                setConversationId(crypto.randomUUID())
                                                                setChatMessages([])
                                                                setDraft("")
                                                            }
                                                        })
                                                        .catch(error => setError(getErrorMessage(error)))
                                                }}
                                        >
                                            <Trash2 className="size-3.5"/>
                                        </button>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="mx-0 my-1 bg-ink/25"/>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (selectedCollectionId === null) return
                                    setError(null)

                                    clearChatConversations(selectedCollectionId)
                                        .then(() => {
                                            setChatHistoryList([])
                                            setConversationId(crypto.randomUUID())
                                            setChatMessages([])
                                            setDraft("")
                                        })
                                        .catch(error => setError(getErrorMessage(error)))
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
                    {chatMessages.map((message) => (
                        <div key={message.id}>
                            <p className="mb-1.5 text-[10px] font-black uppercase">
                                {message.role === "user" ? "YOU /" : "WORKBENCH /"}
                            </p>
                            <div className={cn(
                                "border-2 border-ink p-3 text-sm leading-6",
                                message.role === "assistant" ? "bg-white/30" : "bg-paper",
                            )}>
                                {message.role === "user" && (
                                    <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
                                )}

                                {message.role === "assistant" && (
                                    <>
                                        {message.reasoningContent && (
                                            <Collapsible
                                                open={message.reasoningOpen}
                                                onOpenChange={reasoningOpen => setChatMessages(current =>
                                                    current.map(chatMessage =>
                                                        chatMessage.role === "assistant" && chatMessage.id === message.id
                                                            ? {...chatMessage, reasoningOpen}
                                                            : chatMessage
                                                    )
                                                )}
                                                className="mb-3 border border-ink/35 bg-marker-blue/8"
                                            >
                                                <CollapsibleTrigger
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-black hover:bg-marker-blue/10"
                                                >
                                                    <Brain className="size-3.5"/>
                                                    <span>{message.streaming && !message.content ? "正在思考" : "思考过程"}</span>
                                                    <ChevronDown className={cn(
                                                        "ml-auto size-3.5 transition-transform",
                                                        message.reasoningOpen && "rotate-180",
                                                    )}/>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <div className="whitespace-pre-wrap wrap-break-word border-t border-dashed border-ink/25 px-3 py-2 text-xs leading-5 text-ink/65">
                                                        {message.reasoningContent}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        )}

                                        {message.content && (
                                            <MarkdownContent content={message.content}/>
                                        )}

                                        {message.streaming && !message.reasoningContent && !message.content && (
                                            <span className="shimmer font-semibold">正在思考...</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
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
                            aria-label="选择 AI 模型"
                            title={selectedModel?.modelCode}
                            className="flex h-9 max-w-72 min-w-0 rotate-[-0.4deg] items-center gap-1.5 border-2 border-ink bg-paper px-3 font-mono text-sm font-bold shadow-[2px_2px_0_var(--kraft)] outline-none transition-none hover:bg-marker-yellow/35 focus-visible:ring-3 focus-visible:ring-marker-blue/35 disabled:cursor-not-allowed disabled:opacity-50 data-popup-open:bg-marker-yellow/35"
                        >
                            <Sparkles className="size-4 shrink-0 text-marker-blue" aria-hidden="true"/>
                            <span className="min-w-0 truncate">{selectedModel?.modelCode ?? "选择模型"}</span>
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

                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        type="submit"
                        size="icon-lg"
                        disabled={!draft.trim() || sending || messagesLoading || modelLoading || !selectedModel || selectedCollectionId === null}
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
