package uz.temp.idealuy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uz.temp.idealuy.model.entity.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long id);

    List<Product> findBySimilarProductGroupId(Long id);

}
