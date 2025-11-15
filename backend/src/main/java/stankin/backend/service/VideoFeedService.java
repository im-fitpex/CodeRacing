package stankin.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stankin.backend.dto.VideoFeedResponse;
import stankin.backend.model.Video;
import stankin.backend.repository.VideoMetadataRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoFeedService {

    private final VideoMetadataRepository videoRepo;

    @Transactional(readOnly = true)
    public List<VideoFeedResponse> getFeed(String cursor, int limit) {
        List<Video> videos = videoRepo.findFeed(cursor, limit);
        if (videos.isEmpty()) {
            return List.of();
        }

        // Генерируем cursor для следующей страницы (по последнему элементу)
        Video last = videos.get(videos.size() - 1);
        String nextCursor = videoRepo.encodeCursor(last.createdAt(), last.id());

        return videos.stream()
                .map(video -> VideoFeedResponse.from(video, nextCursor))
                .collect(Collectors.toList());
    }
}
