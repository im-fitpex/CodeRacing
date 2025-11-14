package stankin.backend.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stankin.backend.dto.AppDTO;
import stankin.backend.dto.AppDetailDTO;
import stankin.backend.service.AppService;
import stankin.backend.service.RecommendationService;

import java.util.List;

@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
public class AppController {

    private final AppService appService;
    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<AppDTO>> getAllApps() {
        return ResponseEntity.ok(appService.getAllApps());
    }

//    @GetMapping("/{id}")
//    public ResponseEntity<AppDetailDTO> getAppById(@PathVariable Integer id,
//                                                   @RequestParam(required = false) Integer userId) {
//        if (userId != null) {
//            recommendationService.trackActivity(userId, id, "view");
//        }
//        return ResponseEntity.ok(appService.getAppById(id));
//    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<AppDTO>> getAppsByCategory(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(appService.getAppsByCategory(categoryId));
    }

    @GetMapping("/free")
    public ResponseEntity<List<AppDTO>> getFreeApps() {
        return ResponseEntity.ok(appService.getFreeApps());
    }

    @GetMapping("/paid")
    public ResponseEntity<List<AppDTO>> getPaidApps() {
        return ResponseEntity.ok(appService.getPaidApps());
    }

    @GetMapping("/editor-choice")
    public ResponseEntity<List<AppDTO>> getEditorChoice() {
        return ResponseEntity.ok(appService.getEditorChoice());
    }

    @GetMapping("/new")
    public ResponseEntity<List<AppDTO>> getNewApps() {
        return ResponseEntity.ok(appService.getNewApps());
    }

    @GetMapping("/popular")
    public ResponseEntity<List<AppDTO>> getPopularApps() {
        return ResponseEntity.ok(appService.getPopularApps());
    }

    @GetMapping("/search")
    public ResponseEntity<List<AppDTO>> searchApps(@RequestParam String q) {
        return ResponseEntity.ok(appService.searchApps(q));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<AppDTO>> getRecommendations(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, limit));
    }
// nen
    @PostMapping("/{id}/install")
    public ResponseEntity<Void> trackInstall(@PathVariable Integer id,
                                             @RequestParam Integer userId) {
        recommendationService.trackActivity(userId, id, "install");
        return ResponseEntity.ok().build();
    }
}
