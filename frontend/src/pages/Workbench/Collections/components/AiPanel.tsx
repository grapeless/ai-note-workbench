import {type SubmitEvent, useEffect, useState} from "react"
import {LoaderCircle, Send, Sparkles} from "lucide-react"
import {cn} from "@/lib/utils"
import {listChatModels, sendChatMessage} from "@/api/workbench/chat"

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
}

interface SelectedChatModel {
    providerCode: string
    modelCode: string
}

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "请求失败，请稍后重试"

function AiPanel() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [selectedModel, setSelectedModel] = useState<SelectedChatModel | null>(null)
    const [draft, setDraft] = useState("")
    const [modelLoading, setModelLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setModelLoading(true)
        setError(null)

        listChatModels()
            .then(providers => {
                const provider = providers?.[0];
                const modelCode = provider?.defaultModel

                if (!provider || !modelCode) {
                    throw new Error("当前没有可用的 AI 模型")
                }

                setSelectedModel({
                    providerCode: provider.providerCode,
                    modelCode
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
        if (!selectedModel) return

        setMessages(chatMessages => [
            ...chatMessages, {id: crypto.randomUUID(), role: 'user', content}
        ])

        setDraft('')
        setSending(true)
        setError(null)

        sendChatMessage({...selectedModel, message: content})
            .then(response => {
                if (!response) {
                    throw new Error("AI 回复为空")
                }
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
                  className="mt-3 flex min-h-12 border-2 border-ink bg-paper focus-within:outline-3 focus-within:outline-marker-blue">
                <label htmlFor="ai-follow-up" className="sr-only">继续追问</label>
                <input
                    id="ai-follow-up"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="继续追问…"
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none placeholder:text-ink/55"
                />
                <button type="submit" disabled={!draft.trim() || sending || modelLoading || !selectedModel}
                        className="my-0.5 mr-0.5 flex min-w-20 cursor-pointer items-center justify-center gap-1 border-2 border-ink bg-marker-yellow px-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40">
                    {sending
                        ? <>WAIT<LoaderCircle className={'size-3.5 animate-spin motion-reduce:animate-none'} aria-hidden={true}/></>
                        : <>SEND <Send className="size-3.5" aria-hidden="true"/></>}
                </button>
            </form>
        </aside>
    )
}

export default AiPanel
