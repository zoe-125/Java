package com.example.demo.resource.dto;

import java.util.List;

public class CheckoutRequest {
	private Long memberId;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private List<CartItemDTO> items;

    // 1. 無參數建構子
    public CheckoutRequest() {
    }

    // 2. Getter and Setter
    public Long getMemberId() { 
    	return memberId; 
	}
    
    public void setMemberId(Long memberId) {     	
    	this.memberId = memberId; 
	}
    
    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getReceiverAddress() {
        return receiverAddress;
    }

    public void setReceiverAddress(String receiverAddress) {
        this.receiverAddress = receiverAddress;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    // --- 內部類別 CartItemDTO ---
    public static class CartItemDTO {
        private Long id;
        private String name;
        private Integer price;
        private Integer qty;

        public CartItemDTO() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getPrice() {
            return price;
        }

        public void setPrice(Integer price) {
            this.price = price;
        }

        public Integer getQty() {
            return qty;
        }

        public void setQty(Integer qty) {
            this.qty = qty;
        }
        
        
    }
}