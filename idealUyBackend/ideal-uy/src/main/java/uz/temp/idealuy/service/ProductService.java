package uz.temp.idealuy.service;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import uz.temp.idealuy.model.entity.Category;
import uz.temp.idealuy.model.entity.Image;
import uz.temp.idealuy.model.entity.Product;
import uz.temp.idealuy.model.entity.SimilarProductGroup;
import uz.temp.idealuy.model.request.ProductCreateRequest;
import uz.temp.idealuy.model.response.InputStreamResourceResponse;
import uz.temp.idealuy.model.response.ProductResponse;
import uz.temp.idealuy.repository.CategoryRepository;
import uz.temp.idealuy.repository.ImageRepository;
import uz.temp.idealuy.repository.ProductRepository;
import uz.temp.idealuy.repository.SimilarProductGroupRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final CategoryRepository categoryRepository;
    private final SimilarProductGroupRepository similarProductGroupRepository;
    @Value("${app.image.url}")
    private String imageUrl;

    public ProductService(ProductRepository productRepository, ImageRepository imageRepository, CategoryRepository categoryRepository, SimilarProductGroupRepository similarProductGroupRepository) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
        this.categoryRepository = categoryRepository;
        this.similarProductGroupRepository = similarProductGroupRepository;
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

    public List<Product> getProductBySimilarProductId(Long similarPGId) {
        List<Product> productList = productRepository.findBySimilarProductGroupId(similarPGId);
        productList.forEach(p -> p.setImage(imageUrl+p.getMainImageId()));
        return productList;
    }

    public List<Product> getProductByProductId(Long productId) {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) return new ArrayList<>();
        Product product = productOptional.get();
        Long smgId = product.getSimilarProductGroup().getId();
        List<Product> productList = productRepository.findBySimilarProductGroupId(smgId);
        List<Product> similarProductList = new ArrayList<>();
        for (Product p : productList) {
            if (!p.getId().equals(productId)) {
                p.setImage(imageUrl + p.getMainImageId());
                similarProductList.add(p);
            }
        }
        return similarProductList;
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

    public Long createProduct(ProductCreateRequest request) throws BadRequestException {
        Optional<Category> categoryOptional = categoryRepository.findById(request.getCategoryId());
        if (categoryOptional.isEmpty()) throw new BadRequestException("Category not found");
        Category category = categoryOptional.get();
        Product product = toEntity(request, category);
        productRepository.save(product);
        return product.getId();
    }

    public Product toEntity(ProductCreateRequest request, Category category) {
        return new Product(request.getName(), request.getDescription(), request.getPrice(), request.getOriginalPrice(), category);
    }

    public Long createSimilarProductGroup(String name) throws BadRequestException {
        Optional<SimilarProductGroup> optional = similarProductGroupRepository.findByName(name);
        if (optional.isPresent()) throw new BadRequestException("Similar group with this name already exist");
        SimilarProductGroup similarProductGroup = new SimilarProductGroup();
        similarProductGroup.setName(name);
        similarProductGroupRepository.save(similarProductGroup);
        return similarProductGroup.getId();
    }

    public Boolean changeProductSimilarGroup(Long similarGroupId, Long productId) throws BadRequestException {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) throw new BadRequestException("Product not found with id: "+productId);
        Product product = productOptional.get();
        Optional<SimilarProductGroup> optional = similarProductGroupRepository.findById(similarGroupId);
        if (optional.isEmpty()) throw new BadRequestException("Similar group not found with id: "+similarGroupId);
        SimilarProductGroup similarProductGroup = optional.get();
        product.setSimilarProductGroup(similarProductGroup);
        productRepository.save(product);
        return Boolean.TRUE;
    }

    public Boolean deleteProduct(Long productId) throws BadRequestException {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) throw new BadRequestException("Product not found with id: " + productId);
        Product product = productOptional.get();
        List<Image> images = imageRepository.findByProductId(productId);
        if (!images.isEmpty()) {
            product.setMainImageId(null);
            productRepository.save(product);
            imageRepository.deleteAll(images);
        }
        productRepository.delete(product);
        return true;
    }
}
