package stankin.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import stankin.backend.dto.AppDTO;
import stankin.backend.dto.AppDetailDTO;
import stankin.backend.dto.ReviewDTO;
import stankin.backend.model.App;
import stankin.backend.model.Category;
import stankin.backend.repository.AppRepository;
import stankin.backend.repository.CategoryRepository;
import stankin.backend.repository.ReviewRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppService {

    private final AppRepository appRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final JdbcTemplate jdbcTemplate;

    @Cacheable(value = "apps", key = "'all'")
    public List<AppDTO> getAllApps() {
        return appRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

//    public AppDetailDTO getAppById(Integer id) {
//        App app = appRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("App not found"));
//
//        List<String> screenshots = getScreenshots(id);
//        List<AppDTO> similarApps = appRepository.findSimilarApps(app.getCategoryId(), id, 5)
//                .stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//
//        List<ReviewDTO> reviews = reviewRepository.findByAppId(id, 10)
//                .stream()
//                .map(review -> ReviewDTO.builder()
//                        .id(review.getId())
//                        .appId(review.getAppId())
//                        .userId(review.getUserId())
//                        .rating(review.getRating())
//                        .comment(review.getComment())
//                        .helpfulCount(review.getHelpfulCount())
//                        .createdAt(review.getCreatedAt())
//                        .build())
//                .collect(Collectors.toList());
//
//        String categoryName = categoryRepository.findById(app.getCategoryId())
//                .map(Category::getName)
//                .orElse("Неизвестно");
//
//        return AppDetailDTO.builder()
//                .id(app.getId())
//                .name(app.getName())
//                .packageName(app.getPackageName())
//                .developer(app.getDeveloper())
//                .category(categoryName)
//                .description(app.getDescription())
//                .shortDescription(app.getShortDescription())
//                .version(app.getVersion())
//                .sizeMb(app.getSizeMb())
//                .rating(app.getRating())
//                .downloads(app.getDownloads())
//                .price(app.getPrice())
//                .isFree(app.getIsFree())
//                .ageRating(app.getAgeRating())
//                .iconUrl(app.getIconUrl())
//                .apkUrl(app.getApkUrl())
//                .screenshots(screenshots)
//                .similarApps(similarApps)
//                .reviews(reviews)
//                .build();
//    }

    public List<AppDTO> getAppsByCategory(Integer categoryId) {
        return appRepository.findByCategory(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppDTO> getFreeApps() {
        return appRepository.findByFreeStatus(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppDTO> getPaidApps() {
        return appRepository.findByFreeStatus(false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "apps", key = "'editor-choice'")
    public List<AppDTO> getEditorChoice() {
        return appRepository.findEditorChoice().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "apps", key = "'new'")
    public List<AppDTO> getNewApps() {
        return appRepository.findNew().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "apps", key = "'popular'")
    public List<AppDTO> getPopularApps() {
        return appRepository.findPopular().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppDTO> searchApps(String query) {
        return appRepository.searchByName(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AppDTO convertToDTO(App app) {
        String categoryName = categoryRepository.findById(app.getCategoryId())
                .map(Category::getName)
                .orElse("Неизвестно");

        return AppDTO.builder()
                .id(app.getId())
                .name(app.getName())
                .packageName(app.getPackageName())
                .developer(app.getDeveloper())
                .category(categoryName)
                .shortDescription(app.getShortDescription())
                .rating(app.getRating())
                .downloads(app.getDownloads())
                .price(app.getPrice())
                .isFree(app.getIsFree())
                .iconUrl(app.getIconUrl())
                .ageRating(app.getAgeRating())
                .isEditorChoice(app.getIsEditorChoice())
                .isNew(app.getIsNew())
                .isPopular(app.getIsPopular())
                .build();
    }

    private List<String> getScreenshots(Integer appId) {
        String sql = "SELECT url FROM rustore.screenshots WHERE app_id = ? ORDER BY order_index";
        return jdbcTemplate.queryForList(sql, String.class, appId);
    }
}

