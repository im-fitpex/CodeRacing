package stankin.backend.service;


import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import stankin.backend.model.ViewEvent;
import stankin.backend.repository.ViewEventRepository;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ViewEventRepository viewEventRepo;

    @Async
    public void recordView(ViewEvent event) {
        viewEventRepo.save(event);
    }
}