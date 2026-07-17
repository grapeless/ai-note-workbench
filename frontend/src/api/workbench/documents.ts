import {get, upload} from '@/api'
import type {KnowledgeDocument} from '@/api/workbench/types'

export const listDocuments = (collectionId: number) =>
    get<KnowledgeDocument[]>('/documents/list', {collectionId})

export function uploadDocument(collectionId: number, file: File){
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
