import {type FormEvent, useState} from "react"
import {ExternalLink, Send, Sparkles} from "lucide-react"

import {sources} from "@/data/workbench-data"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

const answerCriteria = [
    {id: "01", label: "导入后 1 分钟内可搜索", color: "bg-marker-yellow"},
    {id: "02", label: "回答命中真正相关片段", color: "bg-marker-red"},
    {id: "03", label: "每条结论都能打开原始来源", color: "bg-marker-blue text-white"},
]

export function AiPanel() {
    const messages = useWorkbenchStore((state) => state.messages)
    const sendMessage = useWorkbenchStore((state) => state.sendMessage)
    const [draft, setDraft] = useState("")

    const submit = (event: FormEvent) => {
        event.preventDefault()
        const content = draft.trim()
        if (!content) return
        sendMessage(content)
        setDraft("")
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

            <div className="raw-sticker my-4 w-fit bg-kraft/55 px-2 py-1 text-[10px] font-black">
                CONTEXT: 当前文档 + 3 个相关文档
            </div>

            <div className="flex-1 space-y-4" aria-live="polite">
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
                        {message.role === "assistant" && message.id === 2 && <AnswerCriteria/>}
                    </div>
                ))}
            </div>

            <section className="mt-4" aria-labelledby="sources-title">
                <h3 id="sources-title" className="mb-2 text-[11px] font-black">SOURCES / 3</h3>
                <div className="space-y-2">
                    {sources.map((source) => (
                        <button key={source.id} type="button"
                                className="flex min-h-11 w-full cursor-pointer items-center border border-ink/70 px-3 py-1.5 text-left hover:bg-marker-yellow/20 focus-visible:outline-3 focus-visible:outline-marker-blue">
                            <span className="text-[11px] leading-4">
                                <strong>[{source.id}] {source.title}</strong><br/>{source.detail}
                            </span>
                            <ExternalLink className="ml-auto size-4 shrink-0" aria-hidden="true"/>
                        </button>
                    ))}
                </div>
            </section>

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
                <button type="submit" disabled={!draft.trim()}
                        className="my-0.5 mr-0.5 flex min-w-20 cursor-pointer items-center justify-center gap-1 border-2 border-ink bg-marker-yellow px-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40">
                    SEND <Send className="size-3.5" aria-hidden="true"/>
                </button>
            </form>
        </aside>
    )
}

function AnswerCriteria() {
    return (
        <ol className="-mt-px border-x-2 border-b-2 border-ink p-3">
            {answerCriteria.map((item) => (
                <li key={item.id} className="flex min-h-9 items-center gap-3 text-xs font-semibold">
                    <span className={cn("raw-sticker px-1.5 py-0.5 font-black", item.color)}>{item.id}</span>
                    {item.label}
                </li>
            ))}
        </ol>
    )
}
