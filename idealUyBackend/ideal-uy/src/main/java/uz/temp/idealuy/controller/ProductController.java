package uz.temp.idealuy.controller;

import org.apache.coyote.BadRequestException;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.temp.idealuy.model.entity.Product;
import uz.temp.idealuy.model.response.ProductResponse;
import uz.temp.idealuy.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }


    @GetMapping("/all")
    public ResponseEntity<List<Product> > getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<List<Product> > getProductsByCategoryId(
            @PathVariable(name = "id") Long categoryId
    ) {
        return ResponseEntity.ok(productService.getProductsByCategoryId(categoryId));
    }

    @GetMapping("/similar/{id}")
    public ResponseEntity<List<Product> > getProductBySimilarProductId(
            @PathVariable(name = "id") Integer similarPGId
    ) {
        return ResponseEntity.ok(productService.getProductBySimilarProductId(similarPGId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) throws BadRequestException {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<InputStreamResource> getProductImage(
            @PathVariable("id") Long id) {
        var response = productService.getProductImage(id);
        return ResponseEntity.ok().contentType(response.getContentType()).body(response.getInputStreamResource());
    }

}
