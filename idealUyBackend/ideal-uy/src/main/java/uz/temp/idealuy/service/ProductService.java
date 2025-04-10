package uz.temp.idealuy.service;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import uz.temp.idealuy.model.entity.Image;
import uz.temp.idealuy.model.entity.Product;
import uz.temp.idealuy.model.response.InputStreamResourceResponse;
import uz.temp.idealuy.model.response.ProductResponse;
import uz.temp.idealuy.repository.ImageRepository;
import uz.temp.idealuy.repository.ProductRepository;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Value("${app.image.url}")
    private String imageUrl;

    public ProductService(ProductRepository productRepository, ImageRepository imageRepository) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
    }

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    public List<Product> getAllProducts() {
        List<Product> productList = productRepository.findAll();
        productList.forEach(p -> p.setImage(imageUrl+p.getMainImageId()));
        return productList;

    }

    public InputStreamResourceResponse getProductImage(Long id) {
        Optional<Image> image = imageRepository.findById(id);
        if (image.isEmpty() || image.get().getImage() == null) {
            return new InputStreamResourceResponse(null, MediaType.IMAGE_JPEG);
        }
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(image.get().getImage());
        InputStreamResource inputStreamResource = new InputStreamResource(byteArrayInputStream);
        return new InputStreamResourceResponse(inputStreamResource, MediaType.IMAGE_JPEG);
    }

    public ProductResponse getProductById(Long id) throws BadRequestException {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) throw new BadRequestException("Product not found");

        List<Image> images = imageRepository.findByProductId(id);
        return new ProductResponse(productOptional.get(), images, imageUrl);
    }

    public List<Product> getProductsByCategoryId(Long categoryId) {
        List<Product> productList = productRepository.findByCategoryId(categoryId);
        productList.forEach(p -> p.setImage(imageUrl+p.getMainImageId()));
        return productList;
    }

    public List<Product> getProductBySimilarProductId(Integer similarPGId) {
        List<Product> productList = productRepository.findBySimilarProductGroupId(similarPGId);
        productList.forEach(p -> p.setImage(imageUrl+p.getMainImageId()));
        return productList;
    }
}
