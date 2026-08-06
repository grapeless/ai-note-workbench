import {get, postStream, remove} from "@/api";
import type {
    ChatConversation,
    ChatRequest,
    ChatResponse,
    HistoryChatMessage,
    ModelProvider
} from "@/api/workbench/types.ts";

export const listChatModels = () =>
    get<ModelProvider[]>("/chat/models")

export const sendChatMessage =
    (chatRequest: ChatRequest, onMessage: (chatResponse: ChatResponse) => void) =>
        postStream<ChatResponse>("/chat/doChat", chatRequest, onMessage)

export const listChatConversations = (collectionId: number) =>
    get<ChatConversation[]>("/chat/conversations", {collectionId})

export const listChatMessages = (conversationId: string) =>
    get<HistoryChatMessage[]>(`/chat/conversations/${conversationId}/messages`)

export const deleteChatConversation = (conversationId: string) =>
    remove<void>(`/chat/conversations/${conversationId}`)

export const clearChatConversations = (collectionId: number) =>
    remove<void>('/chat/conversations', {collectionId})
