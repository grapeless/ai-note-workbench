import {FileSearch, List, MessageSquareText} from "lucide-react"
import {useDefaultLayout} from "react-resizable-panels"

import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable"
import {useMediaQuery} from "@/hooks/useMediaQuery"
import {cn} from "@/lib/utils"
import {useWorkbenchStore, type WorkbenchView} from "@/store/useWorkbenchStore"

import AiPanel from "./components/AiPanel"
import {DocumentDetailsPanel} from "./components/DocumentDetailsPanel"
import {DocumentsPanel} from "./components/DocumentsPanel"

const viewItems: Array<{
    id: WorkbenchView
    label: string
    icon: typeof List
}> = [
    {id: "documents", label: "文档", icon: List},
    {id: "details", label: "详情", icon: FileSearch},
    {id: "ai", label: "ASK / AI", icon: MessageSquareText},
]

const contentPanelIds = ["documents", "details", "ai"]

export function Collections() {
    const activeView = useWorkbenchStore((state) => state.activeView)
    const isDesktop = useMediaQuery("(min-width: 80rem)")

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <CollectionsViewNav/>
            <div className="min-h-0 flex-1 overflow-hidden">
                {isDesktop ? (
                    <CollectionsDesktopLayout/>
                ) : (
                    <>
                        <div className={cn("h-full min-h-0", activeView !== "documents" && "hidden")}>
                            <DocumentsPanel/>
                        </div>

                        <div className={cn("h-full min-h-0", activeView !== "details" && "hidden")}>
                            <DocumentDetailsPanel/>
                        </div>

                        <div className={cn("h-full min-h-0", activeView !== "ai" && "hidden")}>
                            <AiPanel/>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function CollectionsViewNav() {
    const activeView = useWorkbenchStore((state) => state.activeView)
    const setActiveView = useWorkbenchStore((state) => state.setActiveView)

    return (
        <nav
            className="grid shrink-0 grid-cols-3 border-b-2 border-ink bg-paper xl:hidden"
            aria-label="集合页面视图导航"
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

function CollectionsDesktopLayout() {
    const {defaultLayout, onLayoutChanged} = useDefaultLayout({
        id: "workbench-content-layout",
        panelIds: contentPanelIds,
        onlySaveAfterUserInteractions: true,
    })

    return (
        <ResizablePanelGroup
            id="workbench-content-layout"
            orientation="horizontal"
            defaultLayout={defaultLayout}
            onLayoutChanged={onLayoutChanged}
        >
            <ResizablePanel
                id="documents"
                defaultSize="24%"
                minSize={220}
                maxSize={380}
            >
                <DocumentsPanel/>
            </ResizablePanel>

            <ResizableHandle withHandle/>

            <ResizablePanel
                id="details"
                defaultSize="46%"
                minSize={430}
            >
                <DocumentDetailsPanel/>
            </ResizablePanel>

            <ResizableHandle withHandle/>

            <ResizablePanel
                id="ai"
                defaultSize="30%"
                minSize={280}
                maxSize={550}
            >
                <AiPanel/>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
