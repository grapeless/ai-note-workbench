package com.lim.noteworkbench.rag.etl;

import com.lim.noteworkbench.common.exception.BusinessException;
import com.lim.noteworkbench.common.response.ResultCode;
import com.lim.noteworkbench.model.entity.KnowledgeDocument;
import com.lim.noteworkbench.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.TextReader;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Component
@RequiredArgsConstructor
public class KnowledgeDocumentExtractor {
    private final StorageService storageService;

    /**
     * 根据传递的knowledgeDocument中的目录信息，从存储目录取出后将其转换为Document类型方便后续处理。
     * 只负责把特定文件格式可靠地读取出来，去掉文件格式细节，保留页码、标题等天然结构，不保证Document大小适合。
     * @param knowledgeDocument  要读取为Document类型的用户文件对象
     * @return 该文件转换后得到的Document列表
     */
    public List<Document> extract(KnowledgeDocument knowledgeDocument) {
        Resource resource = storageService.loadAsResource(knowledgeDocument.getSourcePath());

        List<Document> documents = (switch (knowledgeDocument.getDocumentType()) {
            case MARKDOWN -> readMarkdown(resource);
            case PLAIN_TEXT -> new TextReader(resource).read();
            case PDF -> readPdf(resource);
        }).stream()
                .filter(document -> StringUtils.hasText(document.getText()))
                .toList();

        if (documents.isEmpty()) throw new BusinessException(ResultCode.SYSTEM_ERROR, "无效的文档");

        return documents;
    }


    /**
     * 读取PDF资源文件并将其按页转换为Document列表。
     * @param resource PDF文件资源
     * @return 从PDF中提取的Document列表
     */
    private List<Document> readPdf(Resource resource) {
        return new PagePdfDocumentReader(resource, PdfDocumentReaderConfig.builder()
                .build()).read();
    }


    /**
     * 读取Markdown资源文件并将其转换为Document列表。
     * @param resource Markdown文件资源
     * @return 从Markdown中提取的Document列表
     */
    private List<Document> readMarkdown(Resource resource) {
        return new MarkdownDocumentReader(resource, MarkdownDocumentReaderConfig.builder()
                //用水平线分割的文本将创建新的Document。默认值为false，意味着由水平线分隔的文本不会创建新文档。
                .withHorizontalRuleCreateDocument(false)
                //默认值为false，意味着所有代码块都会放在单独的文档中。
                .withIncludeCodeBlock(false)
                //默认值为false，意味着所有引用块都会放在单独的文档中。
                .withIncludeBlockquote(true)
                .build()).read();
    }
}
