package com.lim.noteworkbench.tool;

import com.lim.noteworkbench.model.constant.AgentToolContextKey;
import com.lim.noteworkbench.model.dto.ProposalDTO;
import com.lim.noteworkbench.model.enums.DocumentType;
import com.lim.noteworkbench.model.vo.EditableDocumentVO;
import com.lim.noteworkbench.model.vo.ProposalVO;
import com.lim.noteworkbench.service.KnowledgeDocumentService;
import com.lim.noteworkbench.service.ProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.UUID;

@SuppressWarnings("unused")
@Component
@RequiredArgsConstructor
public class WritingTools {

    private final KnowledgeDocumentService knowledgeDocumentService;
    private final ProposalService proposalService;

    @Tool(description = """
            读取当前知识库中可编辑文档的完整原始内容。
            修改已有文档前必须先调用。
            仅支持 TXT 和 Markdown，PDF不可编辑因此如果是PDF不需要也禁止调用该工具。
            """)
    public EditableDocumentVO readEditableDocument(
            @ToolParam(description = "要读取的文档 ID") Long documentId,
            ToolContext toolContext
    ) {
        Long collectionId = (Long) toolContext.getContext().get(AgentToolContextKey.COLLECTION_ID);
        return knowledgeDocumentService.readEditableDocument(collectionId, documentId);
    }

    @Tool(description = """
            根据修改后的完整内容生成文档修改提案和 Diff。
            该工具只生成提案，不会修改或写入文件。
            调用前必须先读取当前文档。
            """)
    public ProposalVO proposeDocumentUpdate(
            @ToolParam(description = "要修改的文档 ID") Long documentId,
            @ToolParam(description = "修改后的完整文档内容") String proposedContent,
            ToolContext toolContext
    ) {
        ProposalDTO proposalDTO = proposalService.update(
                        getCollectionId(toolContext),
                        getConversationId(toolContext),
                        getAssistantMessageId(toolContext),
                        documentId,
                        proposedContent);
        return new ProposalVO(proposalDTO);
    }


    @Tool(description = """
          生成创建新文档的提案和 Diff。
          该工具只生成提案，不会立即创建或写入文件。
          仅支持 PLAIN_TEXT 和 MARKDOWN 文档。
          title 应为包含扩展名的完整标题，例如“学习笔记.md”。
          """)
    public ProposalVO proposeDocumentCreate(
            @ToolParam(description = "新文档标题，例如“学习笔记.md”") String title,
            @ToolParam(description = "文档类型，只能使用PLAIN_TEXT 或 MARKDOWN") DocumentType documentType,
            @ToolParam(description = "准备写入的新文档完整内容") String proposedContent,
            ToolContext toolContext
    ) {

        //collectionId、conversationId和assistantMessageId 由应用注入 ToolContext，不需要模型生成。
        ProposalDTO proposal = proposalService.create(
                getCollectionId(toolContext),
                getConversationId(toolContext),
                getAssistantMessageId(toolContext),
                title,
                documentType,
                proposedContent
        );

        //Tool 只向模型返回安全的提案展示信息，proposedContent 和内部会话字段不需要全部暴露。
        return new ProposalVO(proposal);
    }

    private Long getCollectionId(ToolContext toolContext) {
        return (Long) toolContext.getContext().get(AgentToolContextKey.COLLECTION_ID);
    }

    private UUID getConversationId(ToolContext toolContext) {
        return (UUID) toolContext.getContext().get(AgentToolContextKey.CONVERSATION_ID);
    }

    private UUID getAssistantMessageId(ToolContext toolContext) {
        return (UUID) toolContext.getContext().get(AgentToolContextKey.ASSISTANT_MESSAGE_ID);
    }

}
