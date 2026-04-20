package com.example.demo.repository;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // 額外功能：根據會員 ID 查詢該會員的所有訂單
    List<Order> findByMembersId(Long membersId);
    
    // 額外功能：根據訂單編號查詢
    Order findByOrderNumber(String orderNumber);
}