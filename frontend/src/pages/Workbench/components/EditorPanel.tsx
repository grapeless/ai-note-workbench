import {Check} from "lucide-react"

import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

export function EditorPanel() {
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
