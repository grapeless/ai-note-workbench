import {get, postStream} from "@/api";
import type {ChatRequest, ChatResponse, ModelProvider} from "@/api/workbench/types.ts";

export const listChatModels = () =>
    get<ModelProvider[]>("/chat/models")

export const sendChatMessage =
    (chatRequest: ChatRequest, onMessage: (chatResponse: ChatResponse) => void) =>
        postStream<ChatResponse>("/chat/doChat", chatRequest, onMessage)
