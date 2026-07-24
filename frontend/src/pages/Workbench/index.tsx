import {AiPanel} from "./components/AiPanel"
import {CollectionsPanel} from "./components/CollectionsPanel"
import {DocumentDetailsPanel} from "./components/DocumentDetailsPanel"
import {DocumentsPanel} from "./components/DocumentsPanel"
import {WorkbenchViewNav} from "./components/WorkbenchViewNav"

import {cn} from "@/lib/utils"
import {useWorkbenchStore} from "@/store/useWorkbenchStore"
import {useMediaQuery} from "@/hooks/useMediaQuery";
import WorkbenchDesktopLayout from "@/pages/Workbench/components/WorkbenchDesktopLayout.tsx";

export function Workbench() {
    const activeView = useWorkbenchStore((state) => state.activeView)
    const isDesktop = useMediaQuery("(min-width: 80rem)")

    return (
        <div className="paper-noise flex h-dvh min-h-dvh flex-col overflow-hidden bg-paper text-ink">
            <a href="#main-content"
               className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-marker-yellow focus:p-3 focus:font-bold">
                跳到文档详情
            </a>
            <WorkbenchViewNav/>
            <div className="min-h-0 flex-1 overflow-hidden">
                {isDesktop ? (<WorkbenchDesktopLayout/>) : (
                    <>
                        <div
                            className={cn("h-full min-h-0", activeView !== "collections" && "hidden")}>
                            <CollectionsPanel/>
                        </div>

                        <div
                            className={cn("h-full min-h-0", activeView !== "documents" && "hidden")}>
                            <DocumentsPanel/>
                        </div>

                        <div
                            className={cn("h-full min-h-0", activeView !== "details" && "hidden")}>
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
