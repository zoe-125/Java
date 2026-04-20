package com.example.demo.resource.dto; // 🚩 請根據你的專案路徑修改

import java.util.List;
import com.example.demo.model.OrderItem; // 引用訂單細項

public class OrderRequest {
    private Long memberId;           // 誰買的
    private List<OrderItem> items;   // 買了哪些東西、數量多少
    private String shippingAddress;   // 寄送地址
    private Integer totalAmount;      // 總金額 (可選)

    // --- Getter 和 Setter (一定要寫，不然 Spring 抓不到值) ---
    
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
}