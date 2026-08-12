export interface KnowledgeCollection {
    id: number
    name: string
    description: string | null
    embeddingProvider: string | null
    embeddingModel: string | null
    createTime: string
    updateTime: string
}

export interface CreateCollectionRequest {
    name: string
    description: string
    embeddingProvider: string
    embeddingModel: string
}

export interface UpdateCollectionRequest {
    name: string
    description: string
}

export interface EmbeddingModelProvider {
    providerCode: string
    models: string[]
}

export type DocumentType = 'PDF' | 'PLAIN_TEXT' | 'MARKDOWN'

//todo 这两个类型真的好吗
export interface KnowledgeDocument {
    id: number
    collectionId: number
    title: string
    sourcePath: string
    documentType: DocumentType
    status: string
    errorMessage: string | null
    createTime: string
    updateTime: string
}

export interface UpdateKnowledgeDocumentRequest {
    title: string
}

export interface EditableDocument {
    documentId: number
    title: string
    documentType: Exclude<DocumentType, 'PDF'>
    content: string
    contentHash: string
}

export interface UpdateEditableDocumentRequest {
    expectedContentHash: string
    content: string
}

export interface ChatRequest {
    collectionId: number
    providerCode: string
    modelCode: string
    message: string
    conversationId: string
    assistantMessageId: string
    selectedDocumentId: number | null
}

export interface ChatResponse {
    type: 'REASONING_DELTA' | 'ANSWER_DELTA'
    content: string
}

export interface Proposal {
    proposalId: string
    assistantMessageId: string
    operation: 'CREATE' | 'UPDATE'
    knowledgeDocumentId: number | null
    title: string
    documentType: DocumentType
    diff: string
    status: 'PENDING' | 'APPLIED'
}

export interface ChatModel {
    code: string
}

export interface ModelProvider {
    providerCode: string
    defaultModel: string
    models: ChatModel[]
}

export interface ChatConversation {
    id: string
    collectionId: number
    title: string
    createTime: string
    updateTime: string
}

export type ChatMessageRole = 'USER' | 'ASSISTANT'

export type ChatMessageStatus = 'GENERATING' | 'COMPLETED' | 'CANCELLED' | 'FAILED'

export interface ChatCitation {
    citationId: string
    documentId: number
    documentTitle: string
    documentType: DocumentType
    sourceLocator: string | null
    pageNumber: number | null
    quote: string
    available: boolean
}

export interface HistoryChatMessage {
    id: string
    role: ChatMessageRole
    content: string
    reasoningContent: string | null
    citations: ChatCitation[]
    status: ChatMessageStatus
}
