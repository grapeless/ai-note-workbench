package com.lim.noteworkbench.controller;

import com.lim.noteworkbench.common.response.Result;
import com.lim.noteworkbench.model.dto.ChatRequestDTO;
import com.lim.noteworkbench.model.vo.ChatResponseVO;
import com.lim.noteworkbench.model.vo.ModelProviderVO;
import com.lim.noteworkbench.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "AI聊天")
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "AI聊天")
    @PostMapping("/doChat")
    public Result<ChatResponseVO> chatWithAI(@Valid @RequestBody ChatRequestDTO chatRequestDTO) {
        ChatResponseVO response = chatService.chat(chatRequestDTO);
        return Result.success(response);
    }

    @Operation(summary = "查询可用模型列表")
    @GetMapping("/models")
    public Result<List<ModelProviderVO>> getAvailableModelList() {
        List<ModelProviderVO> list = chatService.getAvailableModelList();
        return Result.success(list);
    }
}
