package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.resource.dto.CheckoutRequest;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;
    
    /**
     * 取得會員訂單並補齊圖片路徑
     */
    public List<Order> getOrdersByMemberId(Long memberId) {
        // 1. 呼叫 Repository 取得原始訂單清單
        List<Order> orders = orderRepository.findByMembersId(memberId);
        
        // 2. 🚩 整合點：補齊圖片資料
        for (Order order : orders) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    // 根據 products_id 去產品表找出圖片路徑
                    productRepository.findById(item.getProductsId()).ifPresent(product -> {
                        // 將圖片路徑塞進 OrderItem 的 imageUrl 欄位 (回傳顯示用)
                        item.setImageUrl(product.getImageUrl());
                    });
                }
            }
        }
        return orders;
    }
    
    /**
     * 完整結帳邏輯 (已移除結帳時的圖片處理)
     */
    @Transactional
    public Order checkout(CheckoutRequest request) {
        
        // --- 1. 庫存檢查與扣除 ---
        for (CheckoutRequest.CartItemDTO itemDto : request.getItems()) {
            int updatedRows = productRepository.decreaseStock(itemDto.getId(), itemDto.getQty());
            if (updatedRows == 0) {
                throw new RuntimeException("商品 「" + itemDto.getName() + "」 庫存不足，結帳失敗！");
            }
        }

        // --- 2. 建立訂單主表 (Order) ---
        Order order = new Order();
        order.setMembersId(request.getMemberId());
        order.setOrderNumber("ORD" + System.currentTimeMillis());
        order.setPhone(request.getReceiverPhone());
        order.setShippingAddress(request.getReceiverAddress());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        // --- 3. 處理訂單明細 (OrderItem) ---
        List<OrderItem> orderItems = new ArrayList<>();
        int totalAmount = 0;

        for (CheckoutRequest.CartItemDTO itemDto : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrder(order); 
            item.setProductsId(itemDto.getId());
            item.setProductName(itemDto.getName());
            item.setPurchasePrice(itemDto.getPrice());
            item.setQuantity(itemDto.getQty());
            
            // 🚩 已刪除原有的 item.setImageUrl 程式碼，避免報錯
            
            int subtotal = itemDto.getPrice() * itemDto.getQty();
            item.setSubtotal(subtotal);
            
            totalAmount += subtotal;
            orderItems.add(item);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }
}