import {get, post} from "@/api";
import type {ChatRequest, ChatResponse, ModelProvider} from "@/api/workbench/types.ts";

export const listChatModels = () =>
    get<ModelProvider[]>("/chat/models")

export const sendChatMessage = (chatRequest: ChatRequest) =>
    post<ChatResponse>("/chat/doChat",chatRequest)
