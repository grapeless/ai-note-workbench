package com.lim.noteworkbench.config.etl;

import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * 可选配置项：
 * <p>{@code encodingType}：要使用的分词器编码类型，默认值为 {@code CL100K_BASE}。
 * 支持的取值包括 {@code CL100K_BASE}、{@code P50K_BASE} 和 {@code O200K_BASE}。</p>
 *
 * <p>{@code chunkSize}：每个文本块的目标大小，单位为 Token，默认值为 {@code 800}。</p>
 *
 * <p>{@code minChunkSizeChars}：每个文本块的最小字符数，默认值为 {@code 350}。</p>
 *
 * <p>{@code minChunkLengthToEmbed}：文本块被纳入向量化处理所需的最小长度，默认值为 {@code 5}。</p>
 *
 * <p>{@code maxNumChunks}：从一段文本中最多生成的文本块数量，默认值为 {@code 10000}。</p>
 *
 * <p>{@code keepSeparator}：是否在文本块中保留分隔符，例如换行符，默认值为 {@code true}。</p>
 *
 * <p>{@code punctuationMarks}：用于判断句子边界并进行文本分割的标点符号列表，
 * 默认值为句号、问号、感叹号和换行符。</p>
 */
@Configuration
public class TokenTextSplitterConfig {
    //todo 如何更好的切分文档？
    @Bean
    public TokenTextSplitter tokenTextSplitter(){
        return TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(300)
                .withMinChunkLengthToEmbed(10)
                .withMaxNumChunks(2000)
                .withKeepSeparator(true)
                .withPunctuationMarks(List.of('。', '？', '！', '；', '.', '?', '!', '\n'))
                .build();
    }
}
