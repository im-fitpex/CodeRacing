package stankin.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stankin.backend.dto.VideoFeedResponse;
import stankin.backend.dto.ViewEventRequest;
import stankin.backend.model.ViewEvent;
import stankin.backend.service.AnalyticsService;
import stankin.backend.service.VideoFeedService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoFeedController {

    private final VideoFeedService feedService;
    private final AnalyticsService analyticsService;

    @GetMapping("/feed")
    public ResponseEntity<List<VideoFeedResponse>> getFeed(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {

        List<VideoFeedResponse> feed = feedService.getFeed(cursor, limit);
        return ResponseEntity.ok(feed);
    }

    @PostMapping("/{videoId}/view")
    public ResponseEntity<Void> recordView(
            @PathVariable UUID videoId,
            @Valid @RequestBody ViewEventRequest request) {

        if (!videoId.equals(request.videoId())) {
            return ResponseEntity.badRequest().build();
        }

        ViewEvent event = new ViewEvent(
                request.videoId(),
                request.userId(),
                request.sessionId(),
                request.watchDurationMs(),
                request.scrolledToNext(),
                LocalDateTime.now()
        );

        analyticsService.recordView(event);
        return ResponseEntity.accepted().build();
    }
}