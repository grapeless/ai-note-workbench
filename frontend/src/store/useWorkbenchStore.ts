import type {ChatCitation, KnowledgeCollection, KnowledgeDocument} from "@/api/workbench/types.ts";
import {create} from "zustand/react";
import {listCollections} from "@/api/workbench/collections.ts";
import {
    deleteDocument as deleteDocumentRequest,
    getDocument,
    listDocuments,
    updateDocumentTitle as updateDocumentTitleRequest
} from "@/api/workbench/documents.ts";

export type WorkbenchView = "documents" | "details" | "ai"

type PendingWorkbenchSelection =
    | { type: "collection"; id: number | null }
    | { type: "document"; id: number | null }
    | { type: "citation"; citation: ChatCitation }

type ChatMessage = {
    id: number
    role: "user" | "assistant"
    content: string
}

//todo 重构一下store，拆分一下
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
    dirtyDocumentId: number | null
    pendingSelection: PendingWorkbenchSelection | null
    activeCitation: ChatCitation | null

    //页面其他数据
    searchQuery: string
    messages: ChatMessage[]

    //===============action==============
    //
    setActiveView: (view: WorkbenchView) => void
    setSearchQuery: (query: string) => void

    //集合相关
    loadCollections: () => Promise<void>
    selectCollection: (id: number | null) => Promise<void>

    //文档相关
    loadDocuments: (collectionId: number) => Promise<void>
    refreshDocuments: () => Promise<void>
    updateDocumentTitle: (id: number, title: string) => Promise<void>
    deleteDocument: (id: number) => Promise<void>

    //选中的文档相关
    selectDocument: (id: number | null) => Promise<void>
    loadDocument: (id: number, showLoading?: boolean) => Promise<void>
    openCitation: (citation: ChatCitation) => Promise<void>
    clearCitation: () => void
}

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "请求失败，请重试"

let collectionRequestVersion = 0
let documentsRequestVersion = 0
let documentRequestVersion = 0

export const useWorkbenchStore = create<WorkBenchState>()((set, get) => ({
    activeView: "documents",

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
    dirtyDocumentId: null,
    pendingSelection: null,
    activeCitation: null,

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
                    dirtyDocumentId: null,
                    pendingSelection: null,
                    activeCitation: null,
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
        if (get().dirtyDocumentId !== null) {
            set({pendingSelection: {type: "collection", id: selectedCollectionId}})
            return
        }

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
            pendingSelection: null,
            activeCitation: null,
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
                        activeCitation: null,
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
    updateDocumentTitle: async (id, title) => {
        const updatedDocument = await updateDocumentTitleRequest(id, {title})

        set(state => ({
            documents: state.documents.map(document =>
                document.id === id ? updatedDocument : document
            ),
            ...(state.document?.id === id ? {document: updatedDocument} : {}),
        }))
    },
    deleteDocument: async (id) => {
        await deleteDocumentRequest(id)

        documentsRequestVersion++

        if (id === get().selectedDocumentId) {
            documentRequestVersion++
        }

        set(state => ({
            documents: state.documents.filter(document => document.id !== id),
            documentsLoading: false,
            documentsError: null,
            ...(state.selectedDocumentId === id ? {
                activeView: "documents" as const,
                selectedDocumentId: null,
                document: null,
                documentLoading: false,
                documentError: null,
                dirtyDocumentId: null,
                pendingSelection: null,
                activeCitation: null,
            } : {}),
        }))
    },
    selectDocument: async (selectedDocumentId) => {
        if (selectedDocumentId === get().selectedDocumentId) {
            set({activeCitation: null})
            if (selectedDocumentId !== null && (get().document === null || get().documentError !== null)) {
                await get().loadDocument(selectedDocumentId,)
            }
            return
        }
        if (get().dirtyDocumentId !== null) {
            set({pendingSelection: {type: "document", id: selectedDocumentId}})
            return
        }
        documentRequestVersion++
        set({
            selectedDocumentId,
            document: null,
            documentLoading: false,
            documentError: null,
            pendingSelection: null,
            activeCitation: null,

            ...(selectedDocumentId === null ? {} : {activeView: "details" as const,}),
        })

        if (selectedDocumentId !== null) {
            await get().loadDocument(selectedDocumentId,)
        }
    },
    loadDocument: async (id, showLoading = true) => {
        if (id !== get().selectedDocumentId) return

        const requestVersion = ++documentRequestVersion

        set({
            ...(showLoading ? {documentLoading: true} : {}),
            documentError: null,
        })

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
    openCitation: async (citation) => {
        if (!citation.available) return

        if (get().dirtyDocumentId !== null && citation.documentId !== get().selectedDocumentId) {
            set({pendingSelection: {type: "citation", citation}})
            return
        }

        if (citation.documentId === get().selectedDocumentId) {
            set({activeCitation: citation, activeView: "details"})

            if (get().document === null || get().documentError !== null) {
                await get().loadDocument(citation.documentId)
            }
            return
        }

        documentRequestVersion++
        set({
            selectedDocumentId: citation.documentId,
            document: null,
            documentLoading: false,
            documentError: null,
            pendingSelection: null,
            activeCitation: citation,
            activeView: "details",
        })
        await get().loadDocument(citation.documentId)
    },
    clearCitation: () => set({activeCitation: null}),
}))
