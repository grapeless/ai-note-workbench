import {useRef, useState} from "react"
import {Box, ChevronDown, ChevronRight, Folder, Import, MoreVertical, Plus, Search} from "lucide-react"

import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"

import {IconButton} from "./IconButton"

export function CollectionsPanel() {
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
                <div className="mt-2 h-0.75 w-44 bg-ink rough-line" aria-hidden="true"/>
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
                    <div className="ml-auto flex justify-end">
                        <IconButton label="搜索集合"><Search className="size-4"/></IconButton>
                        <IconButton label="新建集合"><Plus className="size-4"/></IconButton>
                        <IconButton label="更多集合操作"><MoreVertical className="size-4"/></IconButton>
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
                                <TreeFile active label="RAG 检索链路备忘.md"/>
                                <TreeFile label="向量检索召回率记录.md"/>
                                <TreeFile label="pgvector 索引实验.pdf"/>
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

function TreeFile({label, active = false}: { label: string; active?: boolean }) {
    return (
        <button
            type="button"
            className={cn(
                "flex min-h-11 w-full cursor-pointer items-center px-1 text-left text-sm font-semibold focus-visible:outline-3 focus-visible:outline-marker-blue",
                active && "bg-marker-yellow/35",
            )}
        >
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
