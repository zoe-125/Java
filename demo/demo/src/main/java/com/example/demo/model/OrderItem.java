package com.example.demo.model;

import jakarta.persistence.*;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "order_item")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id") // 這是對應資料庫的欄位名稱
    @JsonBackReference // 🚩 這裡加上 BackReference，告訴它不要往回讀 Order
    private Order order;

    @Column(name = "products_id", nullable = false)
    private Long productsId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "purchase_price", nullable = false)
    private Integer purchasePrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer subtotal;

    // JPA 規範需要一個無參數建構子
    public OrderItem() {
    }
    
    // 定義欄位 (建議加上 @Transient，代表這個欄位不用存進 order_item 資料表，只是回傳用)
    @Transient
    private String imageUrl;

    @Transient
    private String productDescription; // 用來存放從產品表抓回來的描述
    
    // --- Getter and Setter 方法 ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Long getProductsId() {
        return productsId;
    }

    public void setProductsId(Long productsId) {
        this.productsId = productsId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Integer purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Integer subtotal) {
        this.subtotal = subtotal;
    }
       
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }
}