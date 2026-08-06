export interface KnowledgeCollection {
    id: number
    name: string
    description: string | null
    embeddingProvider: string | null
    embeddingModel: string | null
    createTime: string
    updateTime: string
}

export interface KnowledgeDocument {
    id: number
    collectionId: number
    title: string
    sourcePath: string
    contentType: string
    status: string
    errorMessage: string | null
    createTime: string
    updateTime: string
}

export type ChatMode = 'PLAIN' | 'RAG' | 'AUTO'

export interface ChatRequest {
    collectionId: number
    providerCode: string
    modelCode: string
    message: string
    mode: ChatMode
    conversationId: string
}

export interface ChatResponse {
    type: 'REASONING_DELTA' | 'ANSWER_DELTA'
    content: string
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
    mode: ChatMode | null
    status: ChatMessageStatus
    createTime: string
    updateTime: string
}