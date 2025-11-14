package stankin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppDTO {
    private Integer id;
    private String name;
    private String packageName;
    private String developer;
    private String category;
    private String shortDescription;
    private Float rating;
    private Long downloads;
    private Float price;
    private Boolean isFree;
    private String iconUrl;
    private String ageRating;
    private Boolean isEditorChoice;
    private Boolean isNew;
    private Boolean isPopular;
}