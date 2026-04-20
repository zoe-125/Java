package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.resource.dto.CheckoutRequest; // 🚩 確保指向你原本的 DTO
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
    
    public List<Order> getOrdersByMemberId(Long memberId) {
        // 呼叫原本 Repository 裡的查詢功能
        return orderRepository.findByMembersId(memberId);
    }
    
    /**
     * 完整結帳邏輯：
     * 1. 檢查並即時扣除庫存
     * 2. 建立訂單主表 (Order)
     * 3. 處理訂單明細 (OrderItem)
     * 4. 存檔 (由 @Transactional 確保原子性)
     */
    @Transactional
    public Order checkout(CheckoutRequest request) {
        
        // --- 1. 庫存檢查與扣除 ---
        for (CheckoutRequest.CartItemDTO itemDto : request.getItems()) {
            // 呼叫 Repository 的 @Query 進行扣庫存
            int updatedRows = productRepository.decreaseStock(itemDto.getId(), itemDto.getQty());
            
            if (updatedRows == 0) {
                // 如果回傳 0，表示該商品庫存不足，會直接拋出異常並回滾 (Rollback)
                throw new RuntimeException("商品 「" + itemDto.getName() + "」 庫存不足，結帳失敗！");
            }
        }

        // --- 2. 建立訂單主表 (Order) ---
        Order order = new Order();
        order.setMembersId(request.getMemberId());
        order.setOrderNumber("ORD" + System.currentTimeMillis()); // 產生唯一編號
        order.setPhone(request.getReceiverPhone());
        order.setShippingAddress(request.getReceiverAddress());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        // --- 3. 處理訂單明細 (OrderItem) ---
        List<OrderItem> orderItems = new ArrayList<>();
        int totalAmount = 0;

        for (CheckoutRequest.CartItemDTO itemDto : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrder(order); // 🚩 重要：建立雙向關聯
            item.setProductsId(itemDto.getId());
            item.setProductName(itemDto.getName());
            item.setPurchasePrice(itemDto.getPrice());
            item.setQuantity(itemDto.getQty());
            
            int subtotal = itemDto.getPrice() * itemDto.getQty();
            item.setSubtotal(subtotal);
            
            totalAmount += subtotal;
            orderItems.add(item);
        }

        // 將明細清單放入訂單物件，並設定總金額
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        // --- 4. 儲存到資料庫 ---
        // 因為你有設定 CascadeType.ALL，存 order 就會連帶存 items
        return orderRepository.save(order);
    }
}