import {get, post, put, remove, upload} from '@/api'
import type {
    EditableDocument,
    KnowledgeDocument,
    UpdateEditableDocumentRequest,
    UpdateKnowledgeDocumentRequest
} from '@/api/workbench/types'

export const listDocuments = (collectionId: number) =>
    get<KnowledgeDocument[]>('/documents/list', {collectionId})

export function uploadDocument(collectionId: number, file: File) {
    const formData = new FormData()

    formData.append('collectionId', String(collectionId))
    formData.append('file', file)

    return upload<KnowledgeDocument>(
        '/documents/upload',
        formData
    )
}

export const getDocument = (id: number) =>
    get<KnowledgeDocument>(`/documents/${id}`)

export const updateDocumentTitle = (id: number, request: UpdateKnowledgeDocumentRequest) =>
    put<KnowledgeDocument>(`/documents/${id}`, request)

export const processDocument = (id: number) =>
    post<KnowledgeDocument>(`/documents/${id}/process`)

export const deleteDocument = (id: number) =>
    remove<void>(`/documents/${id}`)

export const getEditableDocumentContent = (collectionId: number, id: number) =>
    get<EditableDocument>(`/documents/${id}/content`, {collectionId})

export const updateEditableDocumentContent = (
    collectionId: number,
    id: number,
    request: UpdateEditableDocumentRequest
) => put<EditableDocument>(`/documents/${id}/content?collectionId=${collectionId}`, request)
