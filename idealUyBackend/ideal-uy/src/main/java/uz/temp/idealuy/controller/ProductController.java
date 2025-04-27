package uz.temp.idealuy.controller;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.apache.coyote.BadRequestException;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import uz.temp.idealuy.model.entity.Product;
import uz.temp.idealuy.model.request.ProductCreateRequest;
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

    @PostMapping
    public ResponseEntity<Long> createProduct(@Valid @RequestBody ProductCreateRequest request) throws BadRequestException {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @DeleteMapping
    public ResponseEntity<Boolean> deleteProduct(
            @RequestParam("product_id") Long productId
    ) throws BadRequestException {
        return ResponseEntity.ok(productService.deleteProduct(productId));
    }

    @PostMapping("/similar-group")
    public ResponseEntity<Long> addSimilarGroup(
            @RequestParam("name") String name
    ) throws BadRequestException {
        return ResponseEntity.ok(productService.createSimilarProductGroup(name));
    }

    @PutMapping("/similar-group/change")
    public ResponseEntity<Boolean> addSimilarProductGroup(
            @RequestParam("similar_group_id") Long similarGroupId,
            @RequestParam("product_id") Long productId
    ) throws BadRequestException {
        return ResponseEntity.ok(productService.changeProductSimilarGroup(similarGroupId, productId));
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
            @PathVariable(name = "id") Long similarPGId
    ) {
        return ResponseEntity.ok(productService.getProductBySimilarProductId(similarPGId));
    }

    @GetMapping("/similar/product/{product_id}")
    public ResponseEntity<List<Product> > getSimilarProductByProductId(
            @PathVariable(name = "product_id") Long productId
    ) {
        return ResponseEntity.ok(productService.getProductByProductId(productId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) throws BadRequestException {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/image/{image_id}")
    public ResponseEntity<InputStreamResource> getProductImage(
            @PathVariable("image_id") Long id) {
        var response = productService.getProductImage(id);
        return ResponseEntity.ok().contentType(response.getContentType()).body(response.getInputStreamResource());
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Boolean> addProductImage(
            @RequestParam @Parameter(description = "max 1 mb") MultipartFile image,
            @RequestParam("product_id") Long productId,
            @RequestParam(value = "main") Boolean main
    ) throws BadRequestException {
        var res = productService.addProductImage(image, productId, main);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/image/main")
    public ResponseEntity<Boolean> updateProductImage(
            @RequestParam(name = "image_id") Long imageId,
            @RequestParam(name = "product_id") Long productId
    ) throws BadRequestException {
        var res = productService.updateProductMainImage(imageId, productId);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/image/{id}")
    public ResponseEntity<Boolean> deleteProductImage(
            @PathVariable(name = "id") Long imageId
    ) throws BadRequestException {
        var res = productService.deleteProductImage(imageId);
        return ResponseEntity.ok(res);
    }

}
