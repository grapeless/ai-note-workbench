import {type FormEvent, type ReactNode, useMemo, useRef, useState} from "react"
import {
    Archive,
    Box,
    Check,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Filter,
    Folder,
    Import,
    List,
    Menu,
    MessageSquareText,
    MoreVertical,
    NotebookPen,
    Plus,
    Search,
    Send,
    Sparkles,
    X,
} from "lucide-react"

import {Button} from "@/components/ui/button"
import {notes, sources} from "@/data/workbench-data"
import {cn} from "@/lib/utils"
import {useWorkbenchStore, type WorkbenchView} from "@/store/useWorkbenchStore"

const viewItems: Array<{
    id: WorkbenchView
    label: string
    icon: typeof Archive
}> = [
    {id: "collections", label: "集合", icon: Archive},
    {id: "notes", label: "笔记", icon: List},
    {id: "editor", label: "编辑", icon: NotebookPen},
    {id: "ai", label: "ASK / AI", icon: MessageSquareText},
]

function IconButton({
                        label,
                        children,
                        className,
                        onClick,
                    }: {
    label: string
    children: ReactNode
    className?: string
    onClick?: () => void
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={cn("raw-icon-button size-11 rounded-none", className)}
        >
            {children}
        </Button>
    )
}

function WorkbenchViewNav() {
    const activeView = useWorkbenchStore((state) => state.activeView)
    const setActiveView = useWorkbenchStore((state) => state.setActiveView)

    return (
        <nav
            className="grid shrink-0 grid-cols-4 border-b-2 border-ink bg-paper xl:hidden"
            aria-label="工作区导航"
        >
            {viewItems.map((item) => {
                const Icon = item.icon
                const active = activeView === item.id
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveView(item.id)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "flex min-h-12 cursor-pointer items-center justify-center gap-2 border-r border-ink/40 px-2 text-xs font-bold last:border-r-0 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-marker-blue",
                            active && "bg-marker-yellow",
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true"/>
                        <span>{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}

function CollectionsPanel() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [researchOpen, setResearchOpen] = useState(true)
    const [ragOpen, setRagOpen] = useState(true)
    const [importStatus, setImportStatus] = useState("")

    return (
        <aside className="panel-scroll flex h-full flex-col overflow-y-auto bg-paper-warm" aria-label="集合导航">
            <div className="px-6 pb-4 pt-6">
                <div>
                    {/* <div className="mb-2 flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full border-2 border-ink bg-marker-red" />
            <span className="size-2.5 rounded-full border-2 border-ink bg-marker-yellow" />
            <span className="size-2.5 rounded-full border-2 border-ink bg-marker-green" />
          </div> */}
                    <h1 className="font-display text-[1.72rem] leading-[0.96] font-black tracking-tight">
                        AI NOTE
                        <br/>
                        WORKBENCH
                    </h1>
                </div>
                <p className="mt-2 text-xs font-semibold">本地优先 · 可检索 · 有引用</p>
                <div className="mt-2 h-[3px] w-44 bg-ink rough-line" aria-hidden="true"/>
            </div>

            <div className="px-5 pb-5">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.md,.markdown,.txt"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                        const count = event.target.files?.length ?? 0
                        setImportStatus(count ? `已选择 ${count} 个文件，等待接入导入接口。` : "")
                    }}
                />
                <Button
                    className="raw-primary-button h-12 w-full rounded-none border-2 border-ink bg-marker-yellow text-base font-black text-ink hover:bg-marker-yellow/80"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Import className="size-5" aria-hidden="true"/>
                    导入文件
                    <span className="ml-auto text-[11px] font-bold">PDF / MD</span>
                </Button>
                <p className="sr-only" aria-live="polite">
                    {importStatus}
                </p>
            </div>

            <div className="border-y border-ink/55 px-3 py-1">
                <div className="flex min-h-12 items-center gap-2">
                    <Box className="size-5" strokeWidth={1.8} aria-hidden="true"/>
                    <h2 className="text-xs font-bold">COLLECTIONS / 集合</h2>
                    <div className="ml-auto flex">
                        <IconButton label="搜索集合"><Search className="size-5"/></IconButton>
                        <IconButton label="新建集合"><Plus className="size-5"/></IconButton>
                        <IconButton label="更多集合操作"><MoreVertical className="size-5"/></IconButton>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <button
                    type="button"
                    aria-expanded={researchOpen}
                    onClick={() => setResearchOpen((open) => !open)}
                    className="flex min-h-12 w-full cursor-pointer items-center gap-2 bg-marker-yellow/35 px-4 text-left hover:bg-marker-yellow/55 focus-visible:outline-3 focus-visible:outline-marker-blue"
                >
                    {researchOpen ? <ChevronDown className="size-4"/> : <ChevronRight className="size-4"/>}
                    <span className="marker-underline text-base font-black">技术研究</span>
                    <span className="ml-auto tabular-nums">21</span>
                    <MoreVertical className="size-4" aria-hidden="true"/>
                </button>

                {researchOpen && (
                    <div className="tree-line ml-6 border-l border-ink/55 pb-3 pl-3">
                        <button
                            type="button"
                            aria-expanded={ragOpen}
                            onClick={() => setRagOpen((open) => !open)}
                            className="flex min-h-11 w-full cursor-pointer items-center gap-2 pr-5 text-left focus-visible:outline-3 focus-visible:outline-marker-blue"
                        >
                            {ragOpen ? <ChevronDown className="size-4"/> : <ChevronRight className="size-4"/>}
                            <Folder className="size-5" aria-hidden="true"/>
                            <span className="font-bold">RAG 检索</span>
                            <span className="ml-auto tabular-nums">08</span>
                        </button>
                        {ragOpen && (
                            <div className="ml-5 space-y-1 border-l border-ink/35 py-1 pl-3">
                                <TreeFile active type="MD" label="RAG 检索链路备忘"/>
                                <TreeFile type="MD" label="向量检索召回率记录"/>
                                <TreeFile type="PDF" label="pgvector 索引实验"/>
                            </div>
                        )}
                        <TreeFolder label="后端实现" count="06"/>
                        <TreeFolder label="参考资料" count="07"/>
                    </div>
                )}

                <CollectionRow label="产品想法" count="18"/>
                <CollectionRow label="待读论文" count="09"/>
            </div>
        </aside>
    )
}

function TreeFile({label, type, active = false}: { label: string; type: string; active?: boolean }) {
    return (
        <button
            type="button"
            className={cn(
                "flex min-h-11 w-full cursor-pointer items-center gap-2 px-1 text-left text-sm font-semibold focus-visible:outline-3 focus-visible:outline-marker-blue",
                active && "bg-marker-yellow/35",
            )}
        >
            <span className={cn("file-chip", type === "PDF" && "file-chip-pdf")}>{type}</span>
            <span>{label}</span>
        </button>
    )
}

function TreeFolder({label, count}: { label: string; count: string }) {
    return (
        <button type="button"
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 pr-5 text-left focus-visible:outline-3 focus-visible:outline-marker-blue">
            <ChevronRight className="size-4" aria-hidden="true"/>
            <Folder className="size-5" aria-hidden="true"/>
            <span className="font-bold">{label}</span>
            <span className="ml-auto tabular-nums">{count}</span>
        </button>
    )
}

function CollectionRow({label, count}: { label: string; count: string }) {
    return (
        <button type="button"
                className="flex min-h-14 w-full cursor-pointer items-center gap-3 border-t border-ink/35 px-5 text-left hover:bg-kraft/15 focus-visible:outline-3 focus-visible:outline-marker-blue">
            <Box className="size-5" strokeWidth={1.8} aria-hidden="true"/>
            <span className="font-bold">{label}</span>
            <span className="ml-auto tabular-nums">{count}</span>
            <MoreVertical className="size-4" aria-hidden="true"/>
        </button>
    )
}

function NotesPanel() {
    const searchQuery = useWorkbenchStore((state) => state.searchQuery)
    const setSearchQuery = useWorkbenchStore((state) => state.setSearchQuery)
    const selectedNoteId = useWorkbenchStore((state) => state.selectedNoteId)
    const selectNote = useWorkbenchStore((state) => state.selectNote)

    const filteredNotes = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return notes
        return notes.filter((note) =>
            [note.title, note.excerpt, note.collection].some((value) => value.toLowerCase().includes(query)),
        )
    }, [searchQuery])

    return (
        <section className="panel-scroll flex h-full flex-col overflow-y-auto bg-paper" aria-labelledby="notes-title">
            <div className="sticky top-0 z-10 border-b border-ink/55 bg-paper px-4 pb-3 pt-5">
                <div className="flex items-center">
                    <h2 id="notes-title" className="font-display text-xl font-black">技术研究</h2>
                    <span className="raw-sticker ml-auto px-2 py-1 text-[10px] font-black">21 ITEMS</span>
                </div>
                <label
                    className="mt-4 flex h-11 items-center border-2 border-ink bg-white/35 px-3 focus-within:outline-3 focus-within:outline-marker-blue">
                    <span className="sr-only">搜索笔记</span>
                    <Search className="mr-2 size-4 shrink-0" aria-hidden="true"/>
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="搜索标题、正文或定义…"
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ink/55"
                    />
                    {searchQuery ? (
                        <button type="button" onClick={() => setSearchQuery("")} aria-label="清空搜索"
                                className="relative grid size-10 cursor-pointer place-items-center before:absolute before:-inset-0.5 before:content-['']">
                            <X className="size-4"/>
                        </button>
                    ) : (
                        <span className="raw-ai-chip bg-marker-red">AI</span>
                    )}
                </label>
                <div className="mt-3 flex items-center text-xs font-semibold">
                    <span>最近更新</span>
                    <button type="button"
                            className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 px-2 focus-visible:outline-3 focus-visible:outline-marker-blue">
                        筛选 <Filter className="size-3.5" aria-hidden="true"/>
                    </button>
                    <IconButton label="笔记列表菜单" className="size-9"><Menu className="size-4"/></IconButton>
                </div>
            </div>

            <div className="flex-1 px-3">
                {filteredNotes.length ? filteredNotes.map((note) => (
                    <button
                        key={note.id}
                        type="button"
                        onClick={() => selectNote(note.id)}
                        className={cn(
                            "relative w-full cursor-pointer border-b border-ink/35 px-3 py-4 text-left focus-visible:outline-3 focus-visible:outline-marker-blue",
                            selectedNoteId === note.id && "my-3 border-2 border-ink bg-white/35 shadow-[inset_6px_0_0_var(--marker-yellow)]",
                        )}
                    >
                        <div className="flex items-start gap-2">
                            <h3 className="text-base font-black leading-tight">{note.title}</h3>
                            {note.open && <span
                                className="raw-sticker ml-auto shrink-0 bg-marker-yellow px-1.5 py-0.5 text-[10px] font-black">OPEN</span>}
                        </div>
                        <p className="mt-2 text-[11px] font-bold">{note.collection} · {note.date}</p>
                        <p className="mt-2 text-xs leading-5 text-ink/85">{note.excerpt}</p>
                    </button>
                )) : (
                    <div className="px-3 py-10 text-center text-sm font-semibold">
                        没找到匹配笔记。换个关键词试试。
                    </div>
                )}
            </div>

            <div className="sticky bottom-0 bg-paper p-4">
                <Button variant="outline"
                        className="h-12 w-full rounded-none border-2 border-ink bg-paper text-sm font-black hover:bg-marker-yellow/30">
                    <Plus className="size-5" aria-hidden="true"/>新建空白笔记
                </Button>
            </div>
        </section>
    )
}

function EditorPanel() {
    const checklist = useWorkbenchStore((state) => state.checklist)
    const toggleChecklistItem = useWorkbenchStore((state) => state.toggleChecklistItem)

    return (
        <main id="main-content" className="panel-scroll h-full overflow-y-auto bg-paper px-5 py-6 sm:px-8"
              tabIndex={-1}>
            <article className="mx-auto max-w-3xl">
                <div className="tape-strip mx-auto mb-1 h-5 w-24" aria-hidden="true"/>
                <h2 className="font-display text-2xl leading-tight font-black tracking-tight sm:text-3xl">
                    把碎片变成可检索的知识
                </h2>
                <p className="mt-2 text-xs font-semibold">NOTE / 产品想法 / 自动保存于 14:32</p>
                <div className="mt-4 flex flex-wrap gap-3 border-b-2 border-ink pb-4">
                    <span className="raw-sticker bg-marker-yellow px-2 py-0.5 text-[10px] font-black">MVP</span>
                    <span className="raw-sticker px-2 py-0.5 text-[10px] font-black">LOCAL-FIRST</span>
                    <span
                        className="raw-sticker bg-marker-blue px-2 py-0.5 text-[10px] font-black text-white">RAG</span>
                </div>

                <section className="py-7" aria-labelledby="goal-title">
                    <p id="goal-title" className="section-index">01 / 核心目标</p>
                    <p className="mt-4 max-w-2xl font-reading text-xl leading-[1.85] sm:text-[1.4rem]">
                        让用户把散落在本地的笔记和文档，变成一个能搜索、能追问、能验证来源的知识工作台。
                    </p>
                    <aside className="marker-note mt-5 p-3 text-sm font-semibold leading-6">
                        MVP 不追求“全能第二大脑”，只验证一条最短闭环：导入 → 解析/切块 → 语义检索 → AI 回答 → 查看引用。
                    </aside>
                </section>

                <section className="pb-7" aria-labelledby="checklist-title">
                    <p id="checklist-title" className="section-index">02 / MVP CHECKLIST</p>
                    <div className="mt-4 space-y-1">
                        {checklist.map((item) => (
                            <div key={item.id} className="flex min-h-10 items-center gap-3">
                                <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={item.checked}
                                    onClick={() => toggleChecklistItem(item.id)}
                                    className={cn(
                                        "relative flex size-6 shrink-0 cursor-pointer items-center justify-center border-2 border-ink bg-paper before:absolute before:-inset-2.5 before:content-[''] focus-visible:outline-3 focus-visible:outline-marker-blue",
                                        item.checked && "bg-ink text-paper",
                                    )}
                                >
                                    {item.checked && <Check className="size-4" strokeWidth={2.5} aria-hidden="true"/>}
                                </button>
                                <span
                                    className={cn("text-sm font-semibold", item.later && "text-ink/65")}>{item.label}</span>
                                {item.later && <span
                                    className="raw-sticker ml-auto px-2 py-0.5 text-[10px] font-black">LATER</span>}
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="relative mb-5 border-2 border-ink bg-white/25 p-4 pt-5 text-sm leading-6">
                    <div className="tape-strip absolute -right-2 -top-2 h-6 w-16 rotate-3" aria-hidden="true"/>
                    <p className="text-xs font-black">设计备注 /</p>
                    <p className="mt-2 font-reading text-base">
                        先保证“答案可信”，再追求“界面聪明”。所有 AI 输出都要能回到原文片段。
                    </p>
                </aside>
            </article>
        </main>
    )
}

function AiPanel() {
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
                CONTEXT: 当前笔记 + 3 个相关文档
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
    const criteria = [
        {id: "01", label: "导入后 1 分钟内可搜索", color: "bg-marker-yellow"},
        {id: "02", label: "回答命中真正相关片段", color: "bg-marker-red"},
        {id: "03", label: "每条结论都能打开原始来源", color: "bg-marker-blue text-white"},
    ]
    return (
        <ol className="-mt-px border-x-2 border-b-2 border-ink p-3">
            {criteria.map((item) => (
                <li key={item.id} className="flex min-h-9 items-center gap-3 text-xs font-semibold">
                    <span className={cn("raw-sticker px-1.5 py-0.5 font-black", item.color)}>{item.id}</span>
                    {item.label}
                </li>
            ))}
        </ol>
    )
}

export function WorkbenchPage() {
    const activeView = useWorkbenchStore((state) => state.activeView)

    return (
        <div className="paper-noise flex h-dvh min-h-dvh flex-col overflow-hidden bg-paper text-ink">
            <a href="#main-content"
               className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-marker-yellow focus:p-3 focus:font-bold">
                跳到笔记正文
            </a>
            <WorkbenchViewNav/>
            <div
                className="min-h-0 flex-1 overflow-hidden xl:grid xl:grid-cols-[280px_270px_minmax(430px,1fr)_330px] 2xl:grid-cols-[320px_300px_minmax(480px,1fr)_360px]">
                <div
                    className={cn("h-full min-h-0 border-r-2 border-ink xl:block", activeView !== "collections" && "hidden")}>
                    <CollectionsPanel/>
                </div>
                <div
                    className={cn("h-full min-h-0 border-r-2 border-ink xl:block", activeView !== "notes" && "hidden")}>
                    <NotesPanel/>
                </div>
                <div
                    className={cn("h-full min-h-0 border-r-2 border-ink xl:block", activeView !== "editor" && "hidden")}>
                    <EditorPanel/>
                </div>
                <div className={cn("h-full min-h-0 xl:block", activeView !== "ai" && "hidden")}>
                    <AiPanel/>
                </div>
            </div>
        </div>
    )
}
