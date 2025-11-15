package stankin.backend.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record VideoClipDTO(
        UUID id,
        Integer appId,
        String appName,
        String appIconUrl,
        Float appRating,
        Float appPrice,
        Boolean appIsFree,
        String title,
        String description,
        String videoUrl,
        String thumbnailUrl,
        Integer durationSec,
        Boolean isPlayable,
        String demoUrl,
        Integer demoTimeLimitSec,
        String orientation,
        Long views,
        Long likes,
        Boolean isLiked,
        Boolean isInWishlist,
        String cursor
) {}
