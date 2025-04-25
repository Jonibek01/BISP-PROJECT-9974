package uz.temp.idealuy.service;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import uz.temp.idealuy.model.entity.Image;
import uz.temp.idealuy.model.entity.Product;
import uz.temp.idealuy.model.response.InputStreamResourceResponse;
import uz.temp.idealuy.model.response.ProductResponse;
import uz.temp.idealuy.repository.ImageRepository;
import uz.temp.idealuy.repository.ProductRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
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

    public List<Product> getProductByProductId(Long productId) {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) return new ArrayList<>();
        Product product = productOptional.get();
        Integer smgId = product.getSimilarProductGroup().getId();
        List<Product> productList = productRepository.findBySimilarProductGroupId(smgId);
        productList.forEach(p -> p.setImage(imageUrl+p.getMainImageId()));
        return productList;
    }

    public Boolean addProductImage(MultipartFile image, Long productId, Boolean main) throws BadRequestException {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) throw new BadRequestException("Product not found");
        byte[] byteImage = getBytesFromMultipartFile(image);
        Image imageRequest = new Image();
        imageRequest.setProductId(productId);
        imageRequest.setImage(byteImage);
        imageRepository.save(imageRequest);

        if (main) {
            productOptional.get().setMainImageId(imageRequest.getId());
            productRepository.save(productOptional.get());
        }
        return Boolean.TRUE;
    }

    public static byte[] getBytesFromMultipartFile(MultipartFile multipartFile) throws BadRequestException {
        try {
            return multipartFile.getBytes();
        } catch (IOException var2) {
            throw new BadRequestException("Invalid image");
        }
    }

    public Boolean deleteProductImage(Long imageId) throws BadRequestException {
        Optional<Image> image = imageRepository.findById(imageId);
        if (image.isEmpty() || image.get().getImage() == null) throw new BadRequestException("Invalid image with id: "+imageId);

        Optional<Product> productOptional = productRepository.findById(image.get().getProductId());
        if (productOptional.isEmpty()) throw new BadRequestException("Product not found");
        Long mainImageId = productOptional.get().getMainImageId();
        if (imageId.equals(mainImageId)) throw new BadRequestException("Main image cannot be deleted, update products main image first");
        imageRepository.delete(image.get());
        return Boolean.TRUE;
    }

    public Boolean updateProductMainImage(Long imageId, Long productId) throws BadRequestException {
        Optional<Image> imageOptional = imageRepository.findById(imageId);
        if (imageOptional.isEmpty()) throw new BadRequestException("Image not found with id: "+imageId);

        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) throw new BadRequestException("Product not found with id: "+productId);
        Product product = productOptional.get();
        Image image = imageOptional.get();
        if (!image.getProductId().equals(productId)) throw new BadRequestException("Image belongs to other prodct");
        product.setMainImageId(image.getId());
        productRepository.save(product);
        return Boolean.TRUE;
    }
}
