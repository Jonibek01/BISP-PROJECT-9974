package uz.temp.idealuy.model.request;

import com.fasterxml.jackson.annotation.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductCreateRequest {

    private String name;
    private String description;
    private Long price;
    private Long discountAmount;
    private Long discountPercent;
    private Long originalPrice;
    private Long categoryId;

}
