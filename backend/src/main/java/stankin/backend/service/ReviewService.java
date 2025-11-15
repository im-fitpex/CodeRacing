package stankin.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import stankin.backend.dto.ReviewDTO;
import stankin.backend.model.Review;
import stankin.backend.repository.ReviewRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public List<ReviewDTO> getReviewsByAppId(Integer appId, int limit) {
        return reviewRepository.findByAppId(appId, limit).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO createReview(ReviewDTO reviewDTO) {
        Review review = Review.builder()
                .appId(reviewDTO.getAppId())
                .userId(reviewDTO.getUserId())
                .rating(reviewDTO.getRating())
                .comment(reviewDTO.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Created review: id={}, appId={}, userId={}", saved.getId(), saved.getAppId(), saved.getUserId());

        return convertToDTO(saved);
    }

    public void markHelpful(Long reviewId) {
        reviewRepository.incrementHelpfulCount(reviewId);
        log.info("Marked review {} as helpful", reviewId);
    }

    private ReviewDTO convertToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .appId(review.getAppId())
                .userId(review.getUserId())
                .rating(review.getRating())
                .comment(review.getComment())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

