package uz.temp.idealuy.controller;

import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.temp.idealuy.model.response.CategoryResponse;
import uz.temp.idealuy.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<Long> addCategory(
            @RequestParam("category_name") String name
    ) throws BadRequestException {
        return ResponseEntity.ok(categoryService.createCategory(name));
    }

    @DeleteMapping
    public ResponseEntity<Boolean> deleteCategory(
            @RequestParam("category_id") Long categoryId
    ) throws BadRequestException {
        return ResponseEntity.ok(categoryService.deleteCategory(categoryId));
    }

}
