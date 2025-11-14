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
public class Category {
    private Integer id;
    private String name;
    private String slug;
    private String icon;
    private String type;
    private LocalDateTime createdAt;
}
