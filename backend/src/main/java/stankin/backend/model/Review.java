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
public class Review {
    private Long id;
    private Integer appId;
    private Integer userId;
    private Integer rating;
    private String comment;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
}
