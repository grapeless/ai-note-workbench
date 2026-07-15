import {create} from "zustand"

export type WorkbenchView = "collections" | "notes" | "editor" | "ai"

type ChecklistItem = {
  id: number
  label: string
  checked: boolean
  later?: boolean
}

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
}

type WorkbenchState = {
  activeView: WorkbenchView
  selectedNoteId: number
  searchQuery: string
  checklist: ChecklistItem[]
  messages: ChatMessage[]
  setActiveView: (view: WorkbenchView) => void
  selectNote: (id: number) => void
  setSearchQuery: (query: string) => void
  toggleChecklistItem: (id: number) => void
  sendMessage: (content: string) => void
}

export const useWorkbenchStore = create<WorkbenchState>((set) => ({
  activeView: "editor",
  selectedNoteId: 1,
  searchQuery: "",
  checklist: [
    { id: 1, label: "导入本地 PDF / Markdown / TXT", checked: true },
    { id: 2, label: "查看解析与索引状态", checked: true },
    { id: 3, label: "关键词 + 向量语义搜索", checked: true },
    { id: 4, label: "基于选中文档向 AI 提问", checked: true },
    { id: 5, label: "回答必须附带可点击来源", checked: true },
    { id: 6, label: "复杂知识图谱与协作空间", checked: false, later: true },
  ],
  messages: [
    { id: 1, role: "user", content: "这个 MVP 最应该先验证什么？" },
    {
      id: 2,
      role: "assistant",
      content: "先验证“用户能否快速得到可信答案”。建议把成功标准压缩为三件事：导入后 1 分钟内可搜索、回答命中真正相关片段、每条结论都能打开原始来源。",
    },
  ],
  setActiveView: (activeView) => set({ activeView }),
  selectNote: (selectedNoteId) => set({ selectedNoteId, activeView: "editor" }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleChecklistItem: (id) =>
    set((state) => ({
      checklist: state.checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    })),
  sendMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: Date.now(), role: "user", content },
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "这是页面初版的本地演示回复。接入检索接口后，这里会根据当前笔记与相关文档生成带引用的答案。",
        },
      ],
    })),
}))
