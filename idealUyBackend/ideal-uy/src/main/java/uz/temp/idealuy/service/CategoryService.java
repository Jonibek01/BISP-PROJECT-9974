package uz.temp.idealuy.service;

import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import uz.temp.idealuy.model.entity.Category;
import uz.temp.idealuy.model.entity.Product;
import uz.temp.idealuy.model.response.CategoryResponse;
import uz.temp.idealuy.repository.CategoryRepository;
import uz.temp.idealuy.repository.ProductRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

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

    public Long createCategory(String name) throws BadRequestException {
        Optional<Category> optional = categoryRepository.findByName(name);
        if (optional.isPresent()) throw new BadRequestException("Category already exists with this name");
        Category category = new Category();
        category.setName(name);
        categoryRepository.save(category);
        return category.getId();
    }

    public Boolean deleteCategory(Long categoryId) throws BadRequestException {
        Optional<Category> categoryOptional = categoryRepository.findById(categoryId);
        if (categoryOptional.isEmpty()) throw new BadRequestException("Category not found with id: " + categoryId);
        List<Product> productList = productRepository.findByCategoryId(categoryId);
        if (!productList.isEmpty()) throw new BadRequestException("Category with products cannot be deleted");
        categoryRepository.deleteById(categoryId);
        return true;
    }
}
