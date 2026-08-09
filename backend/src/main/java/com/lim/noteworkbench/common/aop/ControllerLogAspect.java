package com.lim.noteworkbench.common.aop;

import com.lim.noteworkbench.model.vo.ChatResponseVO;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.util.Arrays;
import java.util.Map;

/**
 * 统一记录 Controller 的请求参数、返回值和执行耗时。
 *
 * <p>日志输出前会脱敏敏感字段并限制文本长度；对于 SSE 流式接口，
 * 仅在流结束时记录一次正式回答预览，避免每个响应片段都产生一条日志。</p>
 */
@Aspect
@Component
@Slf4j
public class ControllerLogAspect {
    /** 用户消息和 AI 回复在日志中的最大 Unicode 字符数，包含截断标记。 */
    private static final int MAX_MESSAGE_LENGTH = 50;
    private final JsonMapper jsonMapper;

    public ControllerLogAspect(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    /**
     * 拦截项目中所有 Controller 方法，分别处理普通响应和 Flux 流式响应。
     */
    @Around("within(com.lim.noteworkbench.controller..*)")
    public Object logController(ProceedingJoinPoint point) throws Throwable {
        long start = System.nanoTime();
        String method = point.getSignature().toShortString();

        // 文件上传只记录元数据，避免序列化或输出文件内容。
        log.info("接口请求 method={} params={}",
                method,
                maskAndLimit(Arrays.stream(point.getArgs())
                        .map(argument -> argument instanceof MultipartFile file
                                ? "MultipartFile{name=%s, originalFilename=%s, contentType=%s, size=%d}"
                                .formatted(file.getName(), file.getOriginalFilename(), file.getContentType(), file.getSize())
                                : argument)
                        .toArray())
        );

        Object result = point.proceed();

        if (result instanceof Flux<?> flux) {
            StringBuilder responsePreview = new StringBuilder();
            return flux.doOnNext(item -> {
                        // 最多暂存 51 个字符，让最终截断结果能够用第 50 个字符显示省略号。
                        if (item instanceof ChatResponseVO(ChatResponseVO.Type type, String content)
                                && type == ChatResponseVO.Type.ANSWER_DELTA
                                && responsePreview.codePointCount(0, responsePreview.length()) <= MAX_MESSAGE_LENGTH) {
                            responsePreview.append(
                                    content,
                                    0,
                                    content.offsetByCodePoints(0,
                                            Math.min(MAX_MESSAGE_LENGTH + 1 - responsePreview.codePointCount(0, responsePreview.length()),
                                                    content.codePointCount(0, content.length()))
                                    ));
                        }
                    })
                    // doFinally 同时覆盖正常完成、异常和客户端取消订阅等终止情况。
                    .doFinally(signal -> log.info(
                            "流式接口响应 method={} result={} signal={} durationMs={}",
                            method,
                            maskAndLimit(Map.of("content", responsePreview.toString())),
                            signal,
                            (System.nanoTime() - start) / 1_000_000
                    ));
        }

        log.info("接口响应 method={} result={} durationMs={}",
                method,
                maskAndLimit(result),
                (System.nanoTime() - start) / 1_000_000);

        return result;
    }

    /**
     * 将日志对象转换为 JSON，递归完成脱敏和消息截断，并限制单段日志的总长度。
     */
    private String maskAndLimit(Object value) {
        JsonNode jsonNode = jsonMapper.valueToTree(value);
        maskAndLimit(jsonNode);
        return truncate(jsonNode.toString(), 2000);
    }

    /**
     * 遍历 JSON 树：隐藏认证字段，并截断用户消息、AI 回复和推理内容。
     */
    private void maskAndLimit(JsonNode jsonNode) {
        if (jsonNode.isObject()) {
            ObjectNode objectNode = (ObjectNode) jsonNode;
            jsonNode.forEachEntry((name, value) -> {
                if ("password".equalsIgnoreCase(name)
                        || "token".equalsIgnoreCase(name)
                        || "apiKey".equalsIgnoreCase(name)
                        || "authorization".equalsIgnoreCase(name)) {
                    objectNode.put(name, "***");
                } else if (value.isString()
                        && ("message".equals(name)
                        || "content".equals(name)
                        || "reasoningContent".equals(name))) {
                    objectNode.put(name, truncate(value.stringValue(), MAX_MESSAGE_LENGTH));
                } else {
                    maskAndLimit(value);
                }
            });
        } else if (jsonNode.isArray()) {
            jsonNode.forEach(this::maskAndLimit);
        }
    }

    /**
     * 按 Unicode 码点截断文本，避免在代理对中间切断 emoji 等字符。
     */
    private String truncate(String value, int maxLength) {
        if (value.codePointCount(0, value.length()) <= maxLength) {
            return value;
        }
        return value.substring(0, value.offsetByCodePoints(0, maxLength - 1)) + "…";
    }
}
