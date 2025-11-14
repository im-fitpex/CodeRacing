package stankin.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Integer id;
    private Integer appId;
    private Integer userId;
    private Integer rating;
    private String comment;
    private Integer helpfulCount;
    private String createdAt;

}
