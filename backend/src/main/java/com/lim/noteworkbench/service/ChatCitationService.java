package com.lim.noteworkbench.service;

import com.lim.noteworkbench.mapper.ChatCitationMapper;
import com.lim.noteworkbench.model.entity.ChatCitation;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatCitationService {

    private final ChatCitationMapper chatCitationMapper;

    public void save(
            UUID assistantMessageId,
            String citationId,
            KnowledgeDocument knowledgeDocument,
            String sourceLocator,
            Integer pageNumber,
            String quote
    ) {
        chatCitationMapper.upsert(ChatCitation.builder()
                .assistantMessageId(assistantMessageId)
                .citationId(citationId)
                .documentId(knowledgeDocument.getId())
                .documentVersion(knowledgeDocument.getUpdateTime())
                .documentTitle(knowledgeDocument.getTitle())
                .documentType(knowledgeDocument.getDocumentType())
                .sourceLocator(sourceLocator)
                .pageNumber(pageNumber)
                .quote(quote)
                .build());
    }

    public List<ChatCitation> listByConversationId(UUID conversationId) {
        return chatCitationMapper.findByConversationId(conversationId);
    }
}
