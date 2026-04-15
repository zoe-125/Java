package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // 1. 上架新商品或更新商品
    public Product saveProduct(Product product) {
        // 可以在這裡加入邏輯，例如：如果價格低於 0 則拋出異常
        if (product.getPrice() != null && product.getPrice() < 0) {
            throw new RuntimeException("商品價格不能為負數");
        }
        return productRepository.save(product);
    }

    // 2. 獲取所有商品列表
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 3. 根據 ID 獲取單一商品
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // 4. 刪除商品
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}