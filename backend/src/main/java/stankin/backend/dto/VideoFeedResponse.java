package stankin.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import stankin.backend.model.Video;

import java.util.UUID;

public record VideoFeedResponse(
        @JsonProperty("video_id") UUID videoId,
        @JsonProperty("author_id") UUID authorId,
        String title,
        @JsonProperty("video_url") String videoUrl,
        @JsonProperty("thumbnail_url") String thumbnailUrl,
        @JsonProperty("duration_sec") int durationSeconds,
        String cursor
) {
    public static VideoFeedResponse from(Video video, String nextCursor) {
        return new VideoFeedResponse(
                video.id(),
                video.authorId(),
                video.title(),
                video.videoUrl(),
                video.thumbnailUrl(),
                video.durationSeconds(),
                nextCursor
        );
    }
}