import {get} from '@/api'
import type {KnowledgeCollection} from '@/api/workbench/types'

export const listCollections = () =>
    get<KnowledgeCollection[]>('/collections/list')
