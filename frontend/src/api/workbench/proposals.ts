import {get, post} from "@/api"
import type {KnowledgeDocument, Proposal} from "@/api/workbench/types"

export const listProposals = (conversationId: string) =>
    get<Proposal[]>("/chat/proposal", {conversationId})

export const applyProposal = (proposalId: string, conversationId: string) =>
    post<KnowledgeDocument>(`/chat/proposal/${proposalId}/apply?conversationId=${encodeURIComponent(conversationId)}`)
