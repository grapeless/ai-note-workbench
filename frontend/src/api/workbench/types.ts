export interface KnowledgeCollection {
    id: number
    name: string
    description: string | null
    embeddingProvider: string | null
    embeddingModel: string | null
    createTime: string
    updateTime: string
}

export type DocumentType = 'PDF' | 'PLAIN_TEXT' | 'MARKDOWN'

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

export interface ChatRequest {
    collectionId: number
    providerCode: string
    modelCode: string
    message: string
    conversationId: string
    assistantMessageId: string
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

export type ChatMessageStatus = 'GENERATING' | 'COMPLETED' | 'FAILED'

export interface HistoryChatMessage {
    id: string
    conversationId: string
    sequenceId: number
    role: ChatMessageRole
    content: string
    reasoningContent: string | null
    providerCode: string | null
    modelCode: string | null
    status: ChatMessageStatus
    createTime: string
    updateTime: string
}
