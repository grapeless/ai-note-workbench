package com.lim.noteworkbench.controller;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.model.dto.ChatRequestDTO;
import com.lim.noteworkbench.model.entity.ChatConversation;
import com.lim.noteworkbench.model.entity.ChatMessage;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.model.vo.ChatResponseVO;
import com.lim.noteworkbench.model.vo.ModelProviderVO;
import com.lim.noteworkbench.model.vo.ProposalVO;
import com.lim.noteworkbench.service.ChatHistoryService;
import com.lim.noteworkbench.service.ChatService;
import com.lim.noteworkbench.service.ProposalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.UUID;

@Tag(name = "AI聊天")
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatHistoryService chatHistoryService;
    private final ProposalService proposalService;

    @Operation(summary = "AI聊天")
    @PostMapping(value = "/doChat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatResponseVO> chatWithAI(@Valid @RequestBody ChatRequestDTO chatRequestDTO) {
        return chatService.chat(chatRequestDTO);
    }

    @Operation(summary = "查询可用模型列表")
    @GetMapping("/models")
    public Result<List<ModelProviderVO>> getAvailableModelList() {
        List<ModelProviderVO> list = chatService.getAvailableModelList();
        return Result.success(list);
    }

    @Operation(summary = "查询指定知识库的全部历史会话")
    @GetMapping("/conversations")
    public Result<List<ChatConversation>> listConversations(Long collectionId) {
        return Result.success(chatHistoryService.listConversations(collectionId));
    }

    @Operation(summary = "查询指定会话的全部消息")
    @GetMapping("/conversations/{conversationId}/messages")
    public Result<List<ChatMessage>> listMessages(@PathVariable UUID conversationId) {
        return Result.success(chatHistoryService.listMessages(conversationId));
    }

    @Operation(summary = "删除指定历史会话")
    @DeleteMapping("/conversations/{conversationId}")
    public Result<Void> deleteConversation(@PathVariable UUID conversationId) {
        chatHistoryService.deleteConversation(conversationId);
        return Result.success();
    }

    @Operation(summary = "清空指定知识库的全部历史会话")
    @DeleteMapping("/conversations")
    public Result<Void> deleteByCollectionId(Long collectionId) {
        chatHistoryService.deleteByCollectionId(collectionId);
        return Result.success();
    }

    @Operation(summary = "查询会话中的文档变更提案")
    @GetMapping("/proposal")
    public Result<List<ProposalVO>> listProposals( UUID conversationId) {
        return Result.success(proposalService.listByConversationId(conversationId).stream()
                .map(ProposalVO::new)
                .toList());
    }

    @Operation(summary = "确认并应用文档变更")
    @PostMapping("/proposal/{proposalId}/apply")
    public Result<KnowledgeDocument> apply(@PathVariable UUID proposalId, UUID conversationId) {
        return Result.success(proposalService.apply(proposalId, conversationId));
    }
}
