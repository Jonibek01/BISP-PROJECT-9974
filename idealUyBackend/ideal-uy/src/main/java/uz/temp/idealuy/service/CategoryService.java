package uz.temp.idealuy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uz.temp.idealuy.model.entity.Category;
import uz.temp.idealuy.repository.CategoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

}
