package stankin.backend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

import java.util.UUID;

public record ViewEventRequest(
        @NotNull
        @JsonProperty("video_id")
        UUID videoId,

        @JsonProperty("user_id")
        UUID userId,

        @NotNull
        @JsonProperty("session_id")
        UUID sessionId,

        @Min(0)
        @JsonProperty("watch_duration_ms")
        long watchDurationMs,

        @JsonProperty("scrolled_to_next")
        boolean scrolledToNext
) {}
