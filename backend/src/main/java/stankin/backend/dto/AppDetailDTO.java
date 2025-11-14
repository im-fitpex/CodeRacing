package stankin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppDetailDTO {
    private Integer id;
    private String name;
    private String packageName;
    private String developer;
    private String category;
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
    private List<String> screenshots;
    private List<AppDTO> similarApps;
    private List<ReviewDTO> reviews;
}