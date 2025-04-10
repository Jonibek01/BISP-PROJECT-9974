package uz.temp.idealuy.model.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import uz.temp.idealuy.model.entity.Image;
import uz.temp.idealuy.model.entity.Product;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ProductResponse {

    private Integer id;
    private String name;
    private String description;
    private Long price;
    private Long originalPrice;
    private String mainImage;
    private List<String> thumbnails;

    public ProductResponse(Product product, List<Image> images, String imageUrl) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.originalPrice = product.getOriginalPrice();
        this.mainImage = imageUrl.concat(String.valueOf(product.getMainImageId()));
        this.thumbnails = images
                .stream()
                .map(image -> imageUrl.concat(String.valueOf(image.getId())))
                .toList();
    }
}
