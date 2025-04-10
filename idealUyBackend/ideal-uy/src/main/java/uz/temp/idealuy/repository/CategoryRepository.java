package uz.temp.idealuy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.temp.idealuy.model.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
