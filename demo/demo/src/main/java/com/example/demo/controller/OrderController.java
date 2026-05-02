package com.example.demo.controller;

import com.example.demo.resource.dto.CheckoutRequest;
import com.example.demo.model.Order;
import com.example.demo.service.OrderService; // 🚩 改為引用 Service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService; // 🚩 改用 Service 來處理複雜邏輯

    /**
     * 結帳功能：
     * 現在交給 orderService.checkout 處理 (內含扣庫存 + 存訂單)
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            // 呼叫 Service 執行結帳（這會跑完扣庫存、算金額、存明細的所有動作）
            Order order = orderService.checkout(request);
            
            // 回傳 200 OK 與訂單資訊
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            // 抓取庫存不足的錯誤
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("訂單建立失敗: " + e.getMessage());
        }
    }

    /**
     * 查詢會員訂單功能：
     * 保留你原本的功能，不做任何更改
     */
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Order>> getOrdersByMember(@PathVariable Long memberId) {
        try {
            // 🚩 注意：這裡如果報錯，請確認 OrderService 裡是否也有 orderRepository
            // 或是這裡改為呼叫 orderService.findOrdersByMemberId(memberId)
            List<Order> orders = orderService.getOrdersByMemberId(memberId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    /**
     * 🚩 新增：供後台管理頁面使用的「取得所有訂單」
     * 對應 adminOrder.js 裡的 url: '/api/admin/orders'
     */
    @GetMapping("/admin/all") // 或者改為 @GetMapping("/all")，看你 JS 的 url 怎麼寫
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            // 呼叫 service 抓取資料庫所有訂單
            List<Order> orders = orderService.getAllOrders(); 
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 🚩 新增：供後台管理頁面使用的「更新訂單狀態」
     * 對應 adminOrder.js 裡的 method: 'PATCH'
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            orderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("更新失敗: " + e.getMessage());
        }
    }
    
}