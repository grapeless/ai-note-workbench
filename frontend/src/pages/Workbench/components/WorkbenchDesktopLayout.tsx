import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable.tsx";
import {DocumentsPanel} from "@/pages/Workbench/components/DocumentsPanel.tsx";
import {DocumentDetailsPanel} from "@/pages/Workbench/components/DocumentDetailsPanel.tsx";
import {AiPanel} from "./AiPanel";
import {CollectionsPanel} from "./CollectionsPanel";
import {useDefaultLayout} from "react-resizable-panels";

const WORKBENCH_PANEL_IDS = [
    'collections',
    'documents',
    'details',
    'ai'
]
const WorkbenchDesktopLayout = () => {
    //让拖动后的布局在刷新页面后保留。使用库自带的useDefaultLayout，默认保存到 localStorage。
    //defaultLayout：读取之前保存的布局。
    //onLayoutChanged：拖动完成后保存新布局。
    const {defaultLayout, onLayoutChanged} = useDefaultLayout({
        id: "workbench-desktop-layout",  //这套布局在本地存储中的唯一名字。
        panelIds: WORKBENCH_PANEL_IDS,  //告诉 Hook 保存的是哪四个面板。
        onlySaveAfterUserInteractions: true //只保存鼠标或键盘造成的调整，不保存窗口变化产生的自动计算
    })
    return (
        <ResizablePanelGroup
            id={'workbench-desktop-layout'}
            orientation={"horizontal"}
            defaultLayout={defaultLayout}
            onLayoutChanged={onLayoutChanged}
        >
            <ResizablePanel id="collections"
                            defaultSize="20%"
                            minSize={250}
                            maxSize={360}
            >
                <CollectionsPanel/>
            </ResizablePanel>

            <ResizableHandle withHandle/>

            <ResizablePanel
                id="documents"
                defaultSize="19%"
                minSize={220}
                maxSize={380}
            >
                <DocumentsPanel/>
            </ResizablePanel>

            <ResizableHandle withHandle/>

            <ResizablePanel
                id="details"
                defaultSize="35%"
                minSize={430}
            >
                <DocumentDetailsPanel/>
            </ResizablePanel>

            <ResizableHandle withHandle/>

            <ResizablePanel
                id="ai"
                defaultSize="26%"
                minSize={280}
                maxSize={550}
            >
                <AiPanel/>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default WorkbenchDesktopLayout;