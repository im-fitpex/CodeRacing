package stankin.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

public record ViewEvent(
        UUID videoId,
        UUID userId,
        UUID sessionId,
        long watchDurationMs,
        boolean scrolledToNext,
        LocalDateTime timestamp
) {
    public double getWatchRatio(int videoDurationSeconds) {
        long fullMs = videoDurationSeconds * 1000L;
        return fullMs > 0 ? (double) watchDurationMs / fullMs : 0.0;
    }
}
