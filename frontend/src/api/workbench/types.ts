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

export interface ChatRequest {
    providerCode: string
    modelCode: string
    message: string
}

export interface ChatResponse {
    providerCode: string
    modelCode: string
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
