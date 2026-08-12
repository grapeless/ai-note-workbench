import {type SubmitEvent, useEffect, useState} from "react"
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
import {useShallow} from "zustand/react/shallow"
import {cn} from "@/lib/utils"
import {applyProposal, listChatModels, listProposals,} from "@/api/workbench/chat"
import type {ModelProvider, Proposal} from "@/api/workbench/types"
import {useChatStore} from "@/store/useChatStore"
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
import {Spinner} from "@/components/ui/spinner"
import {Textarea} from "@/components/ui/textarea"
import {CitationMarkdownContent} from "./CitationMarkdownContent"
import {MessageCitations} from "./MessageCitations"
import {ProposalCard} from "./ProposalCard"

interface SelectedChatModel {
    providerCode: string
    modelCode: string
}

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "请求失败，请稍后重试"

const modelMenuPopupClass = "z-50 max-h-(--available-height) min-w-52 overflow-y-auto border-2 border-ink bg-paper py-1 text-ink shadow-[4px_4px_0_var(--ink)] outline-none"

const modelMenuItemClass = "flex min-w-0 cursor-default items-center gap-2 px-3 py-2 text-sm font-bold outline-none select-none data-highlighted:bg-marker-yellow/60"

function AiPanel() {
    //用户输入
    const [draft, setDraft] = useState("")
    //可用模型列表
    const [modelProviders, setModelProviders] = useState<ModelProvider[]>([])
    //当前选择的模型
    const [selectedModel, setSelectedModel] = useState<SelectedChatModel | null>(null)
    //模型加载状态
    const [modelLoading, setModelLoading] = useState(true)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [proposalsLoading, setProposalsLoading] = useState(false)
    const [proposalReloadVersion, setProposalReloadVersion] = useState(0)
    const [applyingProposalId, setApplyingProposalId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    //来自工作台Store，代表当前选择的知识库
    const selectedCollectionId = useWorkbenchStore(state => state.selectedCollectionId)
    const selectedDocumentId = useWorkbenchStore(state => state.selectedDocumentId)
    const refreshDocuments = useWorkbenchStore(state => state.refreshDocuments)
    const loadDocument = useWorkbenchStore(state => state.loadDocument)
    const openCitation = useWorkbenchStore(state => state.openCitation)
    const {
        conversationId,
        chatMessages = [],
        chatHistoryList = [],
        messagesLoading,
        sending,
        stopping,
        generationVersion,
        sessionError,
        runningConversationIds,
        collectionHasRunningConversation,
    } = useChatStore(useShallow(state => {
        const conversationId = selectedCollectionId === null ? null : state.activeConversationIdByCollection[selectedCollectionId] ?? null
        const session = conversationId === null ? undefined : state.sessions[conversationId]
        return {
            conversationId,
            chatMessages: session?.messages,
            chatHistoryList: selectedCollectionId === null ? undefined : state.conversationsByCollection[selectedCollectionId],
            messagesLoading: selectedCollectionId !== null && (state.collectionLoading[selectedCollectionId] || session?.messagesLoading === true),
            sending: session?.activeAssistantMessageId != null,
            stopping: session?.stopping === true,
            generationVersion: session?.generationVersion ?? 0,
            sessionError: session?.error ?? null,
            runningConversationIds: state.runningConversationIds,
            collectionHasRunningConversation: selectedCollectionId !== null
                && Object.keys(state.runningConversationIds).some(
                    runningConversationId => state.sessions[runningConversationId]?.collectionId === selectedCollectionId
                ),
        }
    }))
    const {
        loadCollection,
        startConversation,
        openConversation,
        sendMessage,
        stopGeneration,
        setReasoningOpen,
        clearError: clearSessionError,
        deleteConversation,
        clearConversations,
    } = useChatStore(useShallow(state => ({
        loadCollection: state.loadCollection,
        startConversation: state.startConversation,
        openConversation: state.openConversation,
        sendMessage: state.sendMessage,
        stopGeneration: state.stopGeneration,
        setReasoningOpen: state.setReasoningOpen,
        clearError: state.clearError,
        deleteConversation: state.deleteConversation,
        clearConversations: state.clearConversations,
    })))

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

    //切换知识库时恢复该知识库上次打开的会话；流式任务由全局 Store 继续持有。
    useEffect(() => {
        setDraft("")
        setError(null)
        if (selectedCollectionId !== null) void loadCollection(selectedCollectionId)
    }, [selectedCollectionId, loadCollection]);

    //切换会话时先移除上一个会话的提案。
    useEffect(() => {
        setProposals([])
        setApplyingProposalId(null)
    }, [conversationId])

    //提案只属于当前会话；切换会话或完成一次变更后重新读取。
    useEffect(() => {
        if (conversationId === null) {
            setProposalsLoading(false)
            return
        }

        let cancelled = false

        setProposalsLoading(true)

        listProposals(conversationId)
            .then(result => {
                if (!cancelled) setProposals(result ?? [])
            })
            .catch(error => {
                if (!cancelled) setError(getErrorMessage(error))
            })
            .finally(() => {
                if (!cancelled) setProposalsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [conversationId, proposalReloadVersion, generationVersion])

    const applyDocumentProposal = (proposal: Proposal) => {
        if (proposal.status === "APPLIED" || applyingProposalId !== null || conversationId === null) return

        setApplyingProposalId(proposal.proposalId)
        setError(null)

        applyProposal(proposal.proposalId, conversationId)
            .then(async document => {
                setProposalReloadVersion(current => current + 1)
                await refreshDocuments()

                if (selectedDocumentId === document.id) {
                    await loadDocument(document.id)
                }
            })
            .catch(error => setError(getErrorMessage(error)))
            .finally(() => setApplyingProposalId(null))
    }

    //发送消息
    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        const content = draft.trim()
        if (!content || sending || messagesLoading) return

        //改为禁用按钮而不是抛出异常
        if (!selectedModel || selectedCollectionId === null || conversationId === null) return

        setDraft("")
        setError(null)
        clearSessionError(conversationId)
        sendMessage({
            collectionId: selectedCollectionId,
            conversationId,
            providerCode: selectedModel.providerCode,
            modelCode: selectedModel.modelCode,
            message: content,
            selectedDocumentId
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
                        disabled={messagesLoading || selectedCollectionId === null}
                        onClick={() => {
                            if (selectedCollectionId === null) return
                            startConversation(selectedCollectionId)
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
                            disabled={messagesLoading || selectedCollectionId === null}
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

                                {chatHistoryList.map(conversation => {
                                    const generating = runningConversationIds[conversation.id]

                                    return (
                                        <DropdownMenuItem
                                            key={conversation.id}
                                            title={conversation.title}
                                            onClick={() => {
                                                setDraft("")
                                                setError(null)
                                                void openConversation(conversation.collectionId, conversation.id)
                                            }}
                                            className={cn(
                                                "grid grid-cols-[1.75rem_minmax(0,1fr)_1.75rem] gap-2 rounded-none border-b border-ink/15 px-2 py-2.5 data-highlighted:bg-marker-yellow/45",
                                                conversation.id === conversationId && "bg-marker-yellow/65",
                                            )}
                                        >
                                            <span className="flex size-7 items-center justify-center border border-ink/30 bg-paper">
                                                {generating
                                                    ? <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none"/>
                                                    : <MessageCircle className="size-3.5"/>}
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
                                            <button type="button" title={generating ? "请先停止生成" : "删除会话"}
                                                    disabled={generating}
                                                    className="flex size-7 items-center justify-center text-ink/45 hover:bg-destructive/10 hover:text-destructive disabled:opacity-35"
                                                    onClick={event => {
                                                        event.stopPropagation()
                                                        if (generating) return
                                                        setError(null)

                                                        deleteConversation(conversation.collectionId, conversation.id)
                                                            .then(() => setDraft(""))
                                                            .catch(error => setError(getErrorMessage(error)))
                                                    }}
                                            >
                                                <Trash2 className="size-3.5"/>
                                            </button>
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="mx-0 my-1 bg-ink/25"/>
                            <DropdownMenuItem
                                disabled={collectionHasRunningConversation}
                                onClick={() => {
                                    if (selectedCollectionId === null) return
                                    setError(null)

                                    clearConversations(selectedCollectionId)
                                        .then(() => {
                                            setDraft("")
                                        })
                                        .catch(error => setError(getErrorMessage(error)))
                                }}
                                className="rounded-none px-2 py-2 font-black data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                            >
                                <Trash2/>
                                {collectionHasRunningConversation ? "请先停止正在生成的对话" : "清空历史记录"}
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
                                                onOpenChange={reasoningOpen => conversationId !== null
                                                    && setReasoningOpen(conversationId, message.id, reasoningOpen)}
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
                                            <>
                                                <CitationMarkdownContent
                                                    content={message.content}
                                                    citations={message.citations}
                                                    onCitationClick={citation => void openCitation(citation)}
                                                />
                                                <MessageCitations
                                                    content={message.content}
                                                    citations={message.citations}
                                                    onCitationClick={citation => void openCitation(citation)}
                                                />
                                            </>
                                        )}

                                        {message.streaming && !message.reasoningContent && !message.content && (
                                            <span className="shimmer font-semibold">正在思考...</span>
                                        )}
                                        {message.status === "CANCELLED" && (
                                            <p className="mt-2 font-mono text-[10px] font-bold text-ink/50">已停止生成</p>
                                        )}
                                    </>
                                )}
                            </div>

                            {message.role === "assistant" && proposals
                                .filter(proposal => proposal.assistantMessageId === message.id)
                                .map(proposal => (
                                    <div key={proposal.proposalId} className="mt-3">
                                        <ProposalCard
                                            proposal={proposal}
                                            applying={applyingProposalId === proposal.proposalId}
                                            disabled={applyingProposalId !== null}
                                            onApply={() => applyDocumentProposal(proposal)}
                                        />
                                    </div>
                                ))}
                        </div>
                    ))}
                    {proposalsLoading && (
                        <p className="font-mono text-[10px] font-bold text-ink/55">正在检查文档变更…</p>
                    )}
                    {(error ?? sessionError) && (
                        <p className={'text-sm font-semibold text-destructive'} role={"alert"}>{error ?? sessionError}</p>
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
                            className="flex h-9 max-w-72 min-w-0 self-center items-center gap-1.5 border-2 border-ink bg-paper px-3 font-mono text-sm font-bold shadow-[2px_2px_0_var(--kraft)] outline-none transition-none hover:bg-marker-yellow/35 focus-visible:ring-3 focus-visible:ring-marker-blue/35 disabled:cursor-not-allowed disabled:opacity-50 data-popup-open:bg-marker-yellow/35"
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
                        type={sending ? "button" : "submit"}
                        size="icon-lg"
                        disabled={sending
                            ? stopping
                            : !draft.trim() || messagesLoading || modelLoading || !selectedModel || selectedCollectionId === null || conversationId === null}
                        onClick={sending && conversationId !== null ? () => stopGeneration(conversationId) : undefined}
                        aria-label={sending ? (stopping ? "正在停止" : "停止生成") : "发送消息"}
                        title={sending ? (stopping ? "正在停止" : "停止生成") : "发送消息"}
                        className={cn(
                            "relative self-center rounded-none border-2 border-ink text-ink shadow-[2px_2px_0_var(--kraft)] transition-none focus-visible:ring-marker-blue/35 active:translate-y-px active:shadow-none",
                            sending ? "bg-marker-yellow/25 hover:bg-marker-yellow/45" : "bg-marker-yellow hover:bg-marker-yellow/80",
                        )}
                    >
                        {sending
                            ? <Spinner
                                className="size-5 text-ink animation-duration-[1.8s] motion-reduce:animate-none"
                                strokeWidth={2}
                                aria-hidden="true"
                            />
                            : <Send aria-hidden="true"/>}
                    </Button>
                </div>
            </form>
        </aside>
    )
}

export default AiPanel
