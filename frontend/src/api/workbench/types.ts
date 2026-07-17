export interface KnowledgeCollection {
  id: number
  name: string
  description: string | null
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
