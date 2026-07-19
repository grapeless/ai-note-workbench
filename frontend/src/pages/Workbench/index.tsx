import {AiPanel} from "./components/AiPanel"
import {CollectionsPanel} from "./components/CollectionsPanel"
import {DocumentDetailsPanel} from "./components/DocumentDetailsPanel"
import {DocumentsPanel} from "./components/DocumentsPanel"
import {WorkbenchViewNav} from "./components/WorkbenchViewNav"

import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"

export function Workbench() {
    const activeView = useWorkbenchStore((state) => state.activeView)

    return (
        <div className="paper-noise flex h-dvh min-h-dvh flex-col overflow-hidden bg-paper text-ink">
            <a href="#main-content"
               className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-marker-yellow focus:p-3 focus:font-bold">
                跳到文档详情
            </a>
            <WorkbenchViewNav/>
            <div
                className="min-h-0 flex-1 overflow-hidden xl:grid xl:grid-cols-[280px_270px_minmax(430px,1fr)_330px] 2xl:grid-cols-[320px_300px_minmax(480px,1fr)_360px]">
                <div
                    className={cn("h-full min-h-0 border-r-2 border-ink xl:block", activeView !== "collections" && "hidden")}>
                    <CollectionsPanel/>
                </div>
                <div
                    className={cn("h-full min-h-0 border-r-2 border-ink xl:block", activeView !== "documents" && "hidden")}>
                    <DocumentsPanel/>
                </div>
                <div
                    className={cn("h-full min-h-0 border-r-2 border-ink xl:block", activeView !== "details" && "hidden")}>
                    <DocumentDetailsPanel/>
                </div>
                <div className={cn("h-full min-h-0 xl:block", activeView !== "ai" && "hidden")}>
                    <AiPanel/>
                </div>
            </div>
        </div>
    )
}
