import {create} from "zustand/react"

import {
    cancelChatMessage,
    clearChatConversations,
    deleteChatConversation,
    listChatConversations,
    listChatMessages,
    sendChatMessage,
} from "@/api/workbench/chat"
import type {ChatCitation, ChatConversation, ChatMessageStatus, ChatResponse,} from "@/api/workbench/types"

export interface UserChatMessage {
    id: string
    role: "user"
    content: string
}

export interface AssistantChatMessage {
    id: string
    role: "assistant"
    reasoningContent: string
    reasoningOpen: boolean
    streaming: boolean
    content: string
    citations: ChatCitation[]
    status: ChatMessageStatus
}

export type ChatMessage = UserChatMessage | AssistantChatMessage

interface ChatSessionState {
    collectionId: number
    conversationId: string
    messages: ChatMessage[]
    messagesLoading: boolean
    activeAssistantMessageId: string | null
    stopping: boolean
    generationVersion: number
    error: string | null
}

interface SendMessageInput {
    collectionId: number
    conversationId: string
    providerCode: string
    modelCode: string
    message: string
    selectedDocumentId: number | null
}

interface ChatState {
    activeConversationIdByCollection: Record<number, string>
    conversationsByCollection: Record<number, ChatConversation[]>
    collectionLoading: Record<number, boolean>
    runningConversationIds: Record<string, boolean>
    sessions: Record<string, ChatSessionState>
    loadCollection: (collectionId: number) => Promise<void>
    startConversation: (collectionId: number) => string
    openConversation: (collectionId: number, conversationId: string) => Promise<void>
    sendMessage: (input: SendMessageInput) => void
    stopGeneration: (conversationId: string) => void
    setReasoningOpen: (conversationId: string, assistantMessageId: string, reasoningOpen: boolean) => void
    clearError: (conversationId: string) => void
    deleteConversation: (collectionId: number, conversationId: string) => Promise<void>
    clearConversations: (collectionId: number) => Promise<void>
    discardCollection: (collectionId: number) => void
}

const abortControllers = new Map<string, AbortController>()
const collectionLoadVersions = new Map<number, number>()
const messageLoadVersions = new Map<string, number>()

export const useChatStore = create<ChatState>()((set, get) => ({
    activeConversationIdByCollection: {},
    conversationsByCollection: {},
    collectionLoading: {},
    runningConversationIds: {},
    sessions: {},

    loadCollection: async collectionId => {
        const requestVersion = (collectionLoadVersions.get(collectionId) ?? 0) + 1
        collectionLoadVersions.set(collectionId, requestVersion)
        set(state => ({
            collectionLoading: {...state.collectionLoading, [collectionId]: true},
        }))

        try {
            const conversations = await listChatConversations(collectionId)
            if (collectionLoadVersions.get(collectionId) !== requestVersion) return

            const currentConversationId = get().activeConversationIdByCollection[collectionId]
            const conversationId = currentConversationId ?? conversations[0]?.id ?? crypto.randomUUID()
            const session = get().sessions[conversationId]

            set(state => ({
                activeConversationIdByCollection: {
                    ...state.activeConversationIdByCollection,
                    [collectionId]: conversationId,
                },
                conversationsByCollection: {
                    ...state.conversationsByCollection,
                    [collectionId]: [
                        ...(state.conversationsByCollection[collectionId] ?? []).filter(conversation =>
                            state.runningConversationIds[conversation.id]
                            && !conversations.some(item => item.id === conversation.id)
                        ),
                        ...conversations,
                    ],
                },
                sessions: session ? state.sessions : {
                    ...state.sessions,
                    [conversationId]: {
                        collectionId,
                        conversationId,
                        messages: [],
                        messagesLoading: conversations.some(conversation => conversation.id === conversationId),
                        activeAssistantMessageId: null,
                        stopping: false,
                        generationVersion: 0,
                        error: null,
                    },
                },
            }))

            if (!session && conversations.some(conversation => conversation.id === conversationId)) {
                await get().openConversation(collectionId, conversationId)
            }
        } catch (error) {
            if (collectionLoadVersions.get(collectionId) !== requestVersion) return

            const conversationId = get().activeConversationIdByCollection[collectionId] ?? crypto.randomUUID()
            set(state => ({
                activeConversationIdByCollection: {
                    ...state.activeConversationIdByCollection,
                    [collectionId]: conversationId,
                },
                sessions: {
                    ...state.sessions,
                    [conversationId]: state.sessions[conversationId]
                        ? {
                            ...state.sessions[conversationId],
                            error: error instanceof Error ? error.message : "加载历史对话失败",
                        }
                        : {
                            collectionId,
                            conversationId,
                            messages: [],
                            messagesLoading: false,
                            activeAssistantMessageId: null,
                            stopping: false,
                            generationVersion: 0,
                            error: error instanceof Error ? error.message : "加载历史对话失败",
                        },
                },
            }))
        } finally {
            if (collectionLoadVersions.get(collectionId) === requestVersion) {
                set(state => ({
                    collectionLoading: {...state.collectionLoading, [collectionId]: false},
                }))
            }
        }
    },

    startConversation: collectionId => {
        const conversationId = crypto.randomUUID()
        set(state => ({
            activeConversationIdByCollection: {
                ...state.activeConversationIdByCollection,
                [collectionId]: conversationId,
            },
            sessions: {
                ...state.sessions,
                [conversationId]: {
                    collectionId,
                    conversationId,
                    messages: [],
                    messagesLoading: false,
                    activeAssistantMessageId: null,
                    stopping: false,
                    generationVersion: 0,
                    error: null,
                },
            },
        }))
        return conversationId
    },

    openConversation: async (collectionId, conversationId) => {
        const currentSession = get().sessions[conversationId]
        set(state => ({
            activeConversationIdByCollection: {
                ...state.activeConversationIdByCollection,
                [collectionId]: conversationId,
            },
            sessions: {
                ...state.sessions,
                [conversationId]: currentSession ?? {
                    collectionId,
                    conversationId,
                    messages: [],
                    messagesLoading: true,
                    activeAssistantMessageId: null,
                    stopping: false,
                    generationVersion: 0,
                    error: null,
                },
            },
        }))

        if (currentSession?.messages.length || currentSession?.activeAssistantMessageId) return

        const requestVersion = (messageLoadVersions.get(conversationId) ?? 0) + 1
        messageLoadVersions.set(conversationId, requestVersion)
        set(state => ({
            sessions: {
                ...state.sessions,
                [conversationId]: {...state.sessions[conversationId], messagesLoading: true, error: null},
            },
        }))

        try {
            const messages = await listChatMessages(conversationId)
            if (messageLoadVersions.get(conversationId) !== requestVersion) return

            set(state => ({
                sessions: {
                    ...state.sessions,
                    [conversationId]: {
                        ...state.sessions[conversationId],
                        messages: messages.map(message => message.role === "USER"
                            ? {
                                id: message.id,
                                role: "user" as const,
                                content: message.content,
                            }
                            : {
                                id: message.id,
                                role: "assistant" as const,
                                reasoningContent: message.reasoningContent ?? "",
                                reasoningOpen: false,
                                streaming: false,
                                content: message.content,
                                citations: message.citations ?? [],
                                status: message.status,
                            }),
                        messagesLoading: false,
                        error: null,
                    },
                },
            }))
        } catch (error) {
            if (messageLoadVersions.get(conversationId) !== requestVersion) return

            set(state => ({
                sessions: {
                    ...state.sessions,
                    [conversationId]: {
                        ...state.sessions[conversationId],
                        messagesLoading: false,
                        error: error instanceof Error ? error.message : "加载对话消息失败",
                    },
                },
            }))
        }
    },

    sendMessage: input => {
        const session = get().sessions[input.conversationId]
        if (!session || session.activeAssistantMessageId !== null) return

        const assistantMessageId = crypto.randomUUID()
        const controller = new AbortController()
        const now = new Date().toISOString()
        abortControllers.set(assistantMessageId, controller)

        set(state => ({
            conversationsByCollection: {
                ...state.conversationsByCollection,
                [input.collectionId]: state.conversationsByCollection[input.collectionId]?.some(
                    conversation => conversation.id === input.conversationId
                )
                    ? state.conversationsByCollection[input.collectionId]
                    : [{
                        id: input.conversationId,
                        collectionId: input.collectionId,
                        title: input.message,
                        createTime: now,
                        updateTime: now,
                    }, ...(state.conversationsByCollection[input.collectionId] ?? [])],
            },
            sessions: {
                ...state.sessions,
                [input.conversationId]: {
                    ...state.sessions[input.conversationId],
                    messages: [
                        ...state.sessions[input.conversationId].messages,
                        {id: crypto.randomUUID(), role: "user", content: input.message},
                        {
                            id: assistantMessageId,
                            role: "assistant",
                            reasoningContent: "",
                            reasoningOpen: true,
                            streaming: true,
                            content: "",
                            citations: [],
                            status: "GENERATING",
                        },
                    ],
                    activeAssistantMessageId: assistantMessageId,
                    stopping: false,
                    error: null,
                },
            },
            runningConversationIds: {
                ...state.runningConversationIds,
                [input.conversationId]: true,
            },
        }))

        void sendChatMessage({
            collectionId: input.collectionId,
            providerCode: input.providerCode,
            modelCode: input.modelCode,
            message: input.message,
            conversationId: input.conversationId,
            assistantMessageId,
            selectedDocumentId: input.selectedDocumentId,
        }, (chatResponse: ChatResponse) => {
            set(state => {
                const currentSession = state.sessions[input.conversationId]
                if (currentSession.activeAssistantMessageId !== assistantMessageId || currentSession.stopping) return state

                return {
                    sessions: {
                        ...state.sessions,
                        [input.conversationId]: {
                            ...currentSession,
                            messages: currentSession.messages.map(message => {
                                if (message.role !== "assistant" || message.id !== assistantMessageId) return message

                                if (chatResponse.type === "REASONING_DELTA") {
                                    return {
                                        ...message,
                                        reasoningContent: message.reasoningContent + chatResponse.content,
                                        reasoningOpen: message.reasoningContent.length === 0 ? true : message.reasoningOpen,
                                    }
                                }

                                return {
                                    ...message,
                                    reasoningOpen: message.content.length === 0 ? false : message.reasoningOpen,
                                    content: message.content + chatResponse.content,
                                }
                            }),
                        },
                    },
                }
            })
        }, controller.signal)
            .then(() => {
                set(state => ({
                    sessions: {
                        ...state.sessions,
                        [input.conversationId]: {
                            ...state.sessions[input.conversationId],
                            messages: state.sessions[input.conversationId].messages.map(message =>
                                message.role === "assistant" && message.id === assistantMessageId
                                    ? {
                                        ...message,
                                        streaming: false,
                                        status: state.sessions[input.conversationId].stopping ? "CANCELLED" : "COMPLETED",
                                    }
                                    : message
                            ),
                        },
                    },
                }))
            })
            .catch(error => {
                if (error instanceof DOMException && error.name === "AbortError") return

                set(state => ({
                    sessions: {
                        ...state.sessions,
                        [input.conversationId]: {
                            ...state.sessions[input.conversationId],
                            messages: state.sessions[input.conversationId].messages.map(message =>
                                message.role === "assistant" && message.id === assistantMessageId
                                    ? {...message, streaming: false, status: "FAILED"}
                                    : message
                            ),
                            error: error instanceof Error ? error.message : "AI 对话失败",
                        },
                    },
                }))
            })
            .finally(() => {
                abortControllers.delete(assistantMessageId)
                set(state => {
                    const runningConversationIds = {...state.runningConversationIds}
                    delete runningConversationIds[input.conversationId]

                    return {
                        runningConversationIds,
                        collectionLoading: {
                            ...state.collectionLoading,
                            [input.collectionId]: false,
                        },
                        sessions: {
                            ...state.sessions,
                            [input.conversationId]: {
                                ...state.sessions[input.conversationId],
                                messages: state.sessions[input.conversationId].messages.map(message =>
                                    message.role === "assistant" && message.id === assistantMessageId
                                        ? {...message, streaming: false}
                                        : message
                                ),
                                activeAssistantMessageId: null,
                                stopping: false,
                                generationVersion: state.sessions[input.conversationId].generationVersion + 1,
                            },
                        },
                    }
                })

                const messageSyncVersion = (messageLoadVersions.get(input.conversationId) ?? 0) + 1
                const conversationSyncVersion = (collectionLoadVersions.get(input.collectionId) ?? 0) + 1
                messageLoadVersions.set(input.conversationId, messageSyncVersion)
                collectionLoadVersions.set(input.collectionId, conversationSyncVersion)

                void listChatMessages(input.conversationId)
                    .then(messages => {
                        if (messageLoadVersions.get(input.conversationId) !== messageSyncVersion) return

                        set(state => state.sessions[input.conversationId] ? {
                            sessions: {
                                ...state.sessions,
                                [input.conversationId]: {
                                    ...state.sessions[input.conversationId],
                                    messages: messages.map(message => message.role === "USER"
                                        ? {
                                            id: message.id,
                                            role: "user" as const,
                                            content: message.content,
                                        }
                                        : {
                                            id: message.id,
                                            role: "assistant" as const,
                                            reasoningContent: message.reasoningContent ?? "",
                                            reasoningOpen: false,
                                            streaming: false,
                                            content: message.content,
                                            citations: message.citations ?? [],
                                            status: message.status,
                                        }),
                                },
                            },
                        } : state)
                    })
                    .catch(error => {
                        if (messageLoadVersions.get(input.conversationId) !== messageSyncVersion) return

                        set(state => state.sessions[input.conversationId] ? {
                            sessions: {
                                ...state.sessions,
                                [input.conversationId]: {
                                    ...state.sessions[input.conversationId],
                                    error: error instanceof Error ? error.message : "同步对话消息失败",
                                },
                            },
                        } : state)
                    })

                void listChatConversations(input.collectionId)
                    .then(conversations => {
                        if (collectionLoadVersions.get(input.collectionId) !== conversationSyncVersion) return

                        set(state => ({
                            conversationsByCollection: {
                                ...state.conversationsByCollection,
                                [input.collectionId]: [
                                    ...(state.conversationsByCollection[input.collectionId] ?? []).filter(conversation =>
                                        state.runningConversationIds[conversation.id]
                                        && !conversations.some(item => item.id === conversation.id)
                                    ),
                                    ...conversations,
                                ],
                            },
                        }))
                    })
                    .catch(error => {
                        if (collectionLoadVersions.get(input.collectionId) !== conversationSyncVersion) return

                        set(state => state.sessions[input.conversationId] ? {
                            sessions: {
                                ...state.sessions,
                                [input.conversationId]: {
                                    ...state.sessions[input.conversationId],
                                    error: error instanceof Error ? error.message : "同步历史对话失败",
                                },
                            },
                        } : state)
                    })
            })
    },

    stopGeneration: conversationId => {
        const session = get().sessions[conversationId]
        const assistantMessageId = session?.activeAssistantMessageId
        if (!assistantMessageId || session.stopping) return

        set(state => ({
            sessions: {
                ...state.sessions,
                [conversationId]: {
                    ...state.sessions[conversationId],
                    stopping: true,
                    messages: state.sessions[conversationId].messages.map(message =>
                        message.role === "assistant" && message.id === assistantMessageId
                            ? {...message, streaming: false, status: "CANCELLED"}
                            : message
                    ),
                },
            },
        }))

        void cancelChatMessage(assistantMessageId)
            .catch(error => set(state => ({
                sessions: {
                    ...state.sessions,
                    [conversationId]: {
                        ...state.sessions[conversationId],
                        error: error instanceof Error ? error.message : "停止生成失败",
                    },
                },
            })))
            .finally(() => abortControllers.get(assistantMessageId)?.abort())
    },

    setReasoningOpen: (conversationId, assistantMessageId, reasoningOpen) => set(state => ({
        sessions: {
            ...state.sessions,
            [conversationId]: {
                ...state.sessions[conversationId],
                messages: state.sessions[conversationId].messages.map(message =>
                    message.role === "assistant" && message.id === assistantMessageId
                        ? {...message, reasoningOpen}
                        : message
                ),
            },
        },
    })),

    clearError: conversationId => set(state => ({
        sessions: {
            ...state.sessions,
            [conversationId]: {...state.sessions[conversationId], error: null},
        },
    })),

    deleteConversation: async (collectionId, conversationId) => {
        messageLoadVersions.set(conversationId, (messageLoadVersions.get(conversationId) ?? 0) + 1)
        collectionLoadVersions.set(collectionId, (collectionLoadVersions.get(collectionId) ?? 0) + 1)
        await deleteChatConversation(conversationId)
        const activeConversationId = get().activeConversationIdByCollection[collectionId]
        const nextConversationId = activeConversationId === conversationId ? crypto.randomUUID() : activeConversationId

        set(state => {
            const sessions = {...state.sessions}
            const runningConversationIds = {...state.runningConversationIds}
            delete sessions[conversationId]
            delete runningConversationIds[conversationId]

            return {
                runningConversationIds,
                collectionLoading: {
                    ...state.collectionLoading,
                    [collectionId]: false,
                },
                activeConversationIdByCollection: {
                    ...state.activeConversationIdByCollection,
                    [collectionId]: nextConversationId,
                },
                conversationsByCollection: {
                    ...state.conversationsByCollection,
                    [collectionId]: (state.conversationsByCollection[collectionId] ?? [])
                        .filter(conversation => conversation.id !== conversationId),
                },
                sessions: nextConversationId && !sessions[nextConversationId]
                    ? {
                        ...sessions,
                        [nextConversationId]: {
                            collectionId,
                            conversationId: nextConversationId,
                            messages: [],
                            messagesLoading: false,
                            activeAssistantMessageId: null,
                            stopping: false,
                            generationVersion: 0,
                            error: null,
                        },
                    }
                    : sessions,
            }
        })
    },

    clearConversations: async collectionId => {
        collectionLoadVersions.set(collectionId, (collectionLoadVersions.get(collectionId) ?? 0) + 1)
        Object.values(get().sessions)
            .filter(session => session.collectionId === collectionId)
            .forEach(session => messageLoadVersions.set(
                session.conversationId,
                (messageLoadVersions.get(session.conversationId) ?? 0) + 1
            ))
        await clearChatConversations(collectionId)
        const conversationId = crypto.randomUUID()

        set(state => {
            const sessions = Object.fromEntries(
                Object.entries(state.sessions).filter(([, session]) => session.collectionId !== collectionId)
            )

            return {
                collectionLoading: {
                    ...state.collectionLoading,
                    [collectionId]: false,
                },
                activeConversationIdByCollection: {
                    ...state.activeConversationIdByCollection,
                    [collectionId]: conversationId,
                },
                conversationsByCollection: {
                    ...state.conversationsByCollection,
                    [collectionId]: [],
                },
                runningConversationIds: Object.fromEntries(
                    Object.entries(state.runningConversationIds)
                        .filter(([conversationId]) => state.sessions[conversationId]?.collectionId !== collectionId)
                ),
                sessions: {
                    ...sessions,
                    [conversationId]: {
                        collectionId,
                        conversationId,
                        messages: [],
                        messagesLoading: false,
                        activeAssistantMessageId: null,
                        stopping: false,
                        generationVersion: 0,
                        error: null,
                    },
                },
            }
        })
    },

    discardCollection: collectionId => set(state => {
        collectionLoadVersions.set(collectionId, (collectionLoadVersions.get(collectionId) ?? 0) + 1)
        Object.values(state.sessions)
            .filter(session => session.collectionId === collectionId)
            .forEach(session => messageLoadVersions.set(
                session.conversationId,
                (messageLoadVersions.get(session.conversationId) ?? 0) + 1
            ))
        const activeConversationIdByCollection = {...state.activeConversationIdByCollection}
        const conversationsByCollection = {...state.conversationsByCollection}
        const collectionLoading = {...state.collectionLoading}
        delete activeConversationIdByCollection[collectionId]
        delete conversationsByCollection[collectionId]
        delete collectionLoading[collectionId]

        return {
            activeConversationIdByCollection,
            conversationsByCollection,
            collectionLoading,
            runningConversationIds: Object.fromEntries(
                Object.entries(state.runningConversationIds)
                    .filter(([conversationId]) => state.sessions[conversationId]?.collectionId !== collectionId)
            ),
            sessions: Object.fromEntries(
                Object.entries(state.sessions).filter(([, session]) => session.collectionId !== collectionId)
            ),
        }
    }),
}))
