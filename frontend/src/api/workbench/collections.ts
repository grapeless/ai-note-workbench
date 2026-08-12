import {get, post, put, remove} from '@/api'
import type {
    CreateCollectionRequest,
    EmbeddingModelProvider,
    KnowledgeCollection,
    UpdateCollectionRequest,
} from '@/api/workbench/types'

export const listCollections = () =>
    get<KnowledgeCollection[]>('/collections/list')

export const listEmbeddingModels = () =>
    get<EmbeddingModelProvider[]>('/collections/embedding-models')

export const createCollection = (request: CreateCollectionRequest) =>
    post<KnowledgeCollection>('/collections', request)

export const updateCollection = (id: number, request: UpdateCollectionRequest) =>
    put<KnowledgeCollection>(`/collections/${id}`, request)

export const deleteCollection = (id: number) =>
    remove<void>(`/collections/${id}`)
