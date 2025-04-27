package uz.temp.idealuy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.temp.idealuy.model.entity.SimilarProductGroup;

import java.util.Optional;

@Repository
public interface SimilarProductGroupRepository extends JpaRepository<SimilarProductGroup, Long> {

    Optional<SimilarProductGroup> findByName(String name);

}
