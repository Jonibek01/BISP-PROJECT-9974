package uz.temp.idealuy.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Data
@ToString
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue
    private Integer id;
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
}
