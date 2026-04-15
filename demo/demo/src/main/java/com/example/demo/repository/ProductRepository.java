package com.example.demo.repository;

import com.example.demo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // 繼承 JpaRepository 後，你就自動擁有：
    // .save(product) -> 存檔或修改
    // .findAll()     -> 取得所有商品
    // .findById(id)  -> 根據 ID 找商品
    // .deleteById(id)-> 刪除商品
}