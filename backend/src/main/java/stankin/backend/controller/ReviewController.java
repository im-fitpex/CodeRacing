package stankin.backend.controller;



import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stankin.backend.dto.ReviewDTO;
import stankin.backend.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/app/{appId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByAppId(
            @PathVariable Integer appId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reviewService.getReviewsByAppId(appId, limit));
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(reviewService.createReview(reviewDTO));
    }

    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<Void> markHelpful(@PathVariable Long reviewId) {
        reviewService.markHelpful(reviewId);
        return ResponseEntity.ok().build();
    }
}
