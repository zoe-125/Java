package com.example.demo.resource.dto; // 🚩 請根據你的專案路徑修改

import java.util.List;
import com.example.demo.model.OrderItem; // 引用訂單細項

public class OrderRequest {
    private Long memberId;           // 誰買的
    private List<OrderItem> items;   // 買了哪些東西、數量多少
    private String shippingAddress;   // 寄送地址
    private Integer totalAmount;      // 總金額 (可選)
    private String receiverName;  // 收件人姓名
    private String phone; // 收件人手機

    // 🚩 這裡改為引用「內部」定義的 Item，而不是外部的 OrderItem
    private List<Item> item;
    // --- 🚩 這裡就是「內部類別」，它只活在 OrderRequest 裡面 ---
    public static class Item {
        private Long productId;
        private Integer quantity;
        private Integer price;
        private String imageUrl;   // 這裡可以自由增加資料庫沒有的欄位
        private String productName;

        // Getter & Setter (針對 Item 內部的欄位)
        public String getImageUrl() { 
        	return imageUrl; 
        }
        public void setImageUrl(String imageUrl) { 
        	this.imageUrl = imageUrl; 
        }
        // ... 其他 Getter/Setter
    }
    
    // --- Getter 和 Setter (一定要寫，不然 Spring 抓不到值) ---
    
    public Long getMemberId() { 
    	return memberId; 
    }
    public void setMemberId(Long memberId) { 
    	this.memberId = memberId; 
    }

    public List<OrderItem> getItems() { 
    	return items; 
    }
    public void setItems(List<OrderItem> items) { 
    	this.items = items; 
    }

    public String getShippingAddress() { 
    	return shippingAddress; 
    }
    public void setShippingAddress(String shippingAddress) { 
    	this.shippingAddress = shippingAddress; 
    }
    public String getReceiverName() { 
    	return receiverName; 
    }
    public void setReceiverName(String receiverName) { 
    	this.receiverName = receiverName; 
    }
    

    public String getReceiverPhone() { 
    	return phone; 
    }
    public void setReceiverPhone(String receiverPhone) { 
    	this.phone = phone; 
    }
}