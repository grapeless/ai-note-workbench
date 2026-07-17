import {useMemo} from "react"
import {Filter, Menu, Plus, Search, X} from "lucide-react"

import {Button} from "@/components/ui/button"
import {notes} from "@/data/workbench-data"
import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

import {IconButton} from "./IconButton"

export function NotesPanel() {
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
