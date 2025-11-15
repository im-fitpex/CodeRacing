package stankin.backend.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stankin.backend.dto.VideoClipDTO;
import stankin.backend.service.VideoFeedService;


import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/video-feed")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VideoFeedController {

    private final VideoFeedService videoFeedService;

    @GetMapping
    public ResponseEntity<List<VideoClipDTO>> getFeed(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {

        List<VideoClipDTO> feed = videoFeedService.getFeed(userId, cursor, limit);
        return ResponseEntity.ok(feed);
    }

    @PostMapping("/{videoId}/view")
    public ResponseEntity<Void> recordView(
            @PathVariable UUID videoId,
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "0") int watchDurationSec) {

        videoFeedService.recordInteraction(userId, videoId, "view", watchDurationSec, 0);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{videoId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable UUID videoId,
            @RequestParam Integer userId) {

        boolean liked = videoFeedService.toggleLike(userId, videoId);
        long newLikeCount = videoFeedService.getLikeCount(videoId);

        return ResponseEntity.ok(Map.of(
                "liked", liked,
                "likeCount", newLikeCount
        ));
    }

    @PostMapping("/{videoId}/not-interested")
    public ResponseEntity<Void> markNotInterested(
            @PathVariable UUID videoId,
            @RequestParam Integer userId,
            @RequestParam(required = false, defaultValue = "not_interested") String reason) {

        videoFeedService.markNotInterested(userId, videoId, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{videoId}/wishlist")
    public ResponseEntity<Map<String, Boolean>> toggleWishlist(
            @PathVariable UUID videoId,
            @RequestParam Integer userId) {

        boolean added = videoFeedService.toggleWishlist(userId, videoId);
        return ResponseEntity.ok(Map.of("inWishlist", added));
    }

    @PostMapping("/{videoId}/demo/start")
    public ResponseEntity<Map<String, Object>> startDemo(
            @PathVariable UUID videoId,
            @RequestParam Integer userId) {

        UUID sessionId = videoFeedService.startDemoSession(userId, videoId);

        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId.toString(),
                "timeLimitSec", 90,
                "message", "Demo session started"
        ));
    }

    @PostMapping("/{videoId}/demo/end")
    public ResponseEntity<Void> endDemo(
            @PathVariable UUID videoId,
            @RequestParam Integer userId,
            @RequestParam UUID sessionId,
            @RequestParam int playedSec,
            @RequestParam(defaultValue = "false") boolean completed) {

        videoFeedService.endDemoSession(sessionId, playedSec, completed);
        videoFeedService.recordInteraction(userId, videoId, "demo_played", 0, playedSec);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<VideoClipDTO>> getWishlist(
            @RequestParam Integer userId) {

        List<VideoClipDTO> wishlist = videoFeedService.getWishlist(userId);
        return ResponseEntity.ok(wishlist);
    }
}
