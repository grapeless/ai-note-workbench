import type {KnowledgeCollection, KnowledgeDocument} from "@/api/workbench/types.ts";
import {create} from "zustand/react";
import {listCollections} from "@/api/workbench/collections.ts";
import {getDocument, listDocuments} from "@/api/workbench/documents.ts";

export type WorkbenchView = "collections" | "documents" | "details" | "ai"

type ChatMessage = {
    id: number
    role: "user" | "assistant"
    content: string
}

type WorkBenchState = {
    //===============data==============
    //当前页面
    activeView: WorkbenchView

    //集合相关
    collections: KnowledgeCollection[]
    selectedCollectionId: number | null
    collectionsLoading: boolean
    collectionsError: string | null

    //文档相关
    documents: KnowledgeDocument[]
    selectedDocumentId: number | null
    documentsLoading: boolean
    documentsError: string | null

    //选中的文档相关
    document: KnowledgeDocument | null
    documentLoading: boolean
    documentError: string | null

    //页面其他数据
    searchQuery: string
    messages: ChatMessage[]

    //===============action==============
    //
    setActiveView: (view: WorkbenchView) => void
    setSearchQuery: (query: string) => void
    sendMessage: (content: string) => void

    //集合相关
    loadCollections: () => Promise<void>
    selectCollection: (id: number | null) => Promise<void>

    //文档相关
    loadDocuments: (collectionId: number) => Promise<void>
    refreshDocuments: () => Promise<void>

    //选中的文档相关
    selectDocument: (id: number | null) => Promise<void>
    loadDocument: (id: number) => Promise<void>
}

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "请求失败，请重试"

let collectionRequestVersion = 0
let documentsRequestVersion = 0
let documentRequestVersion = 0

export const useWorkbenchStore = create<WorkBenchState>()((set, get) => ({
    activeView: "collections",

    collections: [],
    selectedCollectionId: null,
    collectionsLoading: false,
    collectionsError: null,

    documents: [],
    selectedDocumentId: null,
    documentsLoading: false,
    documentsError: null,

    document: null,
    documentLoading: false,
    documentError: null,

    searchQuery: "",
    messages: [
        {
            id: 1,
            role: "user",
            content: "这个 MVP 最应该先验证什么？",
        },
        {
            id: 2,
            role: "assistant",
            content:
                "先验证“用户能否快速得到可信答案”。建议把成功标准压缩为三件事：导入后 1 分钟内可搜索、回答命中真正相关片段、每条结论都能打开原始来源。",
        },
    ],

    setActiveView: (activeView) => set({activeView}),
    setSearchQuery: (searchQuery) => set({searchQuery}),

    sendMessage: (content) => set(state => ({
        messages: [
            ...state.messages,
            {
                id: Date.now(),
                role: "user",
                content,
            },
            {
                id: Date.now() + 1,
                role: "assistant",
                content:
                    "这是页面初版的本地演示回复。接入检索接口后，这里会根据当前文档与相关资料生成带引用的答案。",
            },
        ]
    })),

    loadCollections: async () => {
        const requestVersion = ++collectionRequestVersion

        set({collectionsLoading: true, collectionsError: null})

        try {
            const collections = (await listCollections() ?? [])
            if (requestVersion !== collectionRequestVersion) return

            const currentCollectionId = get().selectedCollectionId
            const selectedCollectionId = collections
                .some(({id}) => id === currentCollectionId)
                ? currentCollectionId : collections[0]?.id ?? null

            const selectionChanged = selectedCollectionId !== currentCollectionId

            if (selectionChanged || selectedCollectionId === null) {
                documentRequestVersion++
                documentsRequestVersion++
            }

            set({
                collections,
                selectedCollectionId,
                collectionsLoading: false,
                collectionsError: null,
                ...((selectionChanged || selectedCollectionId === null) ? {
                    documents: [],
                    selectedDocumentId: null,
                    documentsLoading: false,
                    documentsError: null,
                    document: null,
                    documentLoading: false,
                    documentError: null,
                    searchQuery: "",
                } : {})
            })

            if (selectedCollectionId !== null) {
                await get().loadDocuments(selectedCollectionId)
            }
        } catch (e) {
            if (requestVersion !== collectionRequestVersion) return
            set({
                collectionsLoading: false,
                collectionsError: getErrorMessage(e)
            })
        }
    },
    selectCollection: async (selectedCollectionId) => {
        if (selectedCollectionId === get().selectedCollectionId) return

        documentRequestVersion++
        documentsRequestVersion++

        set({
            selectedCollectionId,
            documents: [],
            selectedDocumentId: null,
            documentsLoading: false,
            documentsError: null,

            document: null,
            documentLoading: false,
            documentError: null,
            searchQuery: "",
            ...(selectedCollectionId === null ? {} : {activeView: "documents" as const})
        })

        if (selectedCollectionId !== null) {
            await get().loadDocuments(selectedCollectionId)
        }
    },
    loadDocuments: async (collectionId) => {
        if (collectionId !== get().selectedCollectionId) return

        const requestVersion = ++documentsRequestVersion

        set({documentsLoading: true, documentsError: null,})

        try {
            const documents = (await listDocuments(collectionId)) ?? []

            if (requestVersion !== documentsRequestVersion || collectionId !== get().selectedCollectionId) return

            const currentDocumentId = get().selectedDocumentId
            const selectedDocumentStillExists =
                documents.some(({id}) => id === currentDocumentId)

            if (currentDocumentId !== null && !selectedDocumentStillExists) documentRequestVersion++

            set({
                documents,
                documentsLoading: false,
                documentsError: null,

                ...((currentDocumentId !== null && !selectedDocumentStillExists)
                    ? {
                        selectedDocumentId: null,
                        document: null,
                        documentLoading: false,
                        documentError: null,
                    }
                    : {}),
            })
        } catch (error) {
            if (requestVersion !== documentsRequestVersion || collectionId !== get().selectedCollectionId) return

            set({
                documentsLoading: false,
                documentsError: getErrorMessage(error),
            })
        }
    },
    refreshDocuments: async () => {
        const collectionId = get().selectedCollectionId

        if (collectionId !== null) {
            await get().loadDocuments(collectionId,)
        }
    },
    selectDocument: async (selectedDocumentId) => {
        if (selectedDocumentId === get().selectedDocumentId) {
            if (selectedDocumentId !== null && (get().document === null || get().documentError !== null)) {
                await get().loadDocument(selectedDocumentId,)
            }
            return
        }
        documentRequestVersion++
        set({
            selectedDocumentId,
            document: null,
            documentLoading: false,
            documentError: null,

            ...(selectedDocumentId === null ? {} : {activeView: "details" as const,}),
        })

        if (selectedDocumentId !== null) {
            await get().loadDocument(selectedDocumentId,)
        }
    },
    loadDocument: async (id) => {
        if (id !== get().selectedDocumentId) return

        const requestVersion = ++documentRequestVersion

        set({documentLoading: true, documentError: null,})

        try {
            const document = await getDocument(id)

            if (requestVersion !== documentRequestVersion || id !== get().selectedDocumentId) return

            if (document === null) throw new Error("文档详情为空")

            set({
                document,
                documentLoading: false,
                documentError: null,
            })
        } catch (error) {
            if (requestVersion !== documentRequestVersion || id !== get().selectedDocumentId) return

            set({
                document: null,
                documentLoading: false,
                documentError: getErrorMessage(error),
            })
        }
    },
}))
