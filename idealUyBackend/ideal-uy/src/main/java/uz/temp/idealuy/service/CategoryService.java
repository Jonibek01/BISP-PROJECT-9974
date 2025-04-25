package uz.temp.idealuy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uz.temp.idealuy.model.entity.Category;
import uz.temp.idealuy.model.response.CategoryResponse;
import uz.temp.idealuy.repository.CategoryRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return toCategoryResponse(categories);
    }

    public List<CategoryResponse> toCategoryResponse(List<Category> categories) {
        List<CategoryResponse> categoryResponses = new ArrayList<>();
        for (Category category : categories) {
            categoryResponses.add(new CategoryResponse(category.getId(), category.getName()));
        }
        return categoryResponses;
    }
}
