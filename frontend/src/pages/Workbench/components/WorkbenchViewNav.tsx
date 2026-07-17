import {Archive, List, MessageSquareText, NotebookPen} from "lucide-react"

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

export function WorkbenchViewNav() {
    const activeView = useWorkbenchStore((state) => state.activeView)
    const setActiveView = useWorkbenchStore((state) => state.setActiveView)

    return (
        <nav
            className="grid shrink-0 grid-cols-4 border-b-2 border-ink bg-paper xl:hidden"
            aria-label="工作台视图导航"
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
