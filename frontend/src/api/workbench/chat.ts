import {get, post, postStream, remove} from "@/api";
import type {
    ChatConversation,
    ChatRequest,
    ChatResponse,
    HistoryChatMessage,
    KnowledgeDocument,
    ModelProvider,
    Proposal
} from "@/api/workbench/types.ts";

export const listChatModels = () =>
    get<ModelProvider[]>("/chat/models")

export const sendChatMessage =
    (chatRequest: ChatRequest, onMessage: (chatResponse: ChatResponse) => void, signal: AbortSignal) =>
        postStream<ChatResponse>("/chat/doChat", chatRequest, onMessage, {signal})

export const cancelChatMessage = (assistantMessageId: string) =>
    post<void>(`/chat/messages/${assistantMessageId}/cancel`)

export const listChatConversations = (collectionId: number) =>
    get<ChatConversation[]>("/chat/conversations", {collectionId})

export const listChatMessages = (conversationId: string) =>
    get<HistoryChatMessage[]>(`/chat/conversations/${conversationId}/messages`)

export const deleteChatConversation = (conversationId: string) =>
    remove<void>(`/chat/conversations/${conversationId}`)

export const clearChatConversations = (collectionId: number) =>
    remove<void>('/chat/conversations', {collectionId})

export const listProposals = (conversationId: string) =>
    get<Proposal[]>("/chat/proposal", {conversationId})

export const applyProposal = (proposalId: string, conversationId: string) =>
    post<KnowledgeDocument>(`/chat/proposal/${proposalId}/apply?conversationId=${encodeURIComponent(conversationId)}`)
