package stankin.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class App {
    private Integer id;
    private String name;
    private String packageName;
    private String developer;
    private Integer categoryId;
    private String description;
    private String shortDescription;
    private String version;
    private Float sizeMb;
    private Float rating;
    private Long downloads;
    private Float price;
    private Boolean isFree;
    private String ageRating;
    private String iconUrl;
    private String apkUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isEditorChoice;
    private Boolean isNew;
    private Boolean isPopular;
}