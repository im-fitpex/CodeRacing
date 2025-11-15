package stankin.backend.controller;

import stankin.backend.dto.ChatRequestDTO;
import stankin.backend.dto.ChatResponseDTO;
import stankin.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO request) {
        ChatResponseDTO response = chatService.chat(request);
        return ResponseEntity.ok(response);
    }
}
