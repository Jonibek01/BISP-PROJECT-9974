package uz.temp.idealuy.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Data
@ToString
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "name")
    private String name;
    @Column(columnDefinition = "description")
    private String description;
    @Column(columnDefinition = "price")
    private Long price;
    @Column(name = "original_price")
    private Long originalPrice;

    @Column(name = "main_image")
    @JsonIgnore
    private Long mainImageId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "similar_product_group_id")
    private SimilarProductGroup similarProductGroup;

    @Transient
    private String image;

    public Product() {
    }

    public Product(String name, String description, Long price, Long originalPrice, Category category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice;
        this.category = category;
    }
}
