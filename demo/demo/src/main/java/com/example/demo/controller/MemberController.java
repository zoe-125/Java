package com.example.demo.controller;

import com.example.demo.resource.dto.CheckoutRequest;
import com.example.demo.service.MemberService;
import com.example.demo.model.Member;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.repository.MemberRepository;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members") // 🚩 這樣就能對應到你圖中的 /api/members 了
public class MemberController {

    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private MemberService memberService;

    @GetMapping("/{id}") // 這裡的 {id} 就會接在 /api/members 之後
    public ResponseEntity<Member> getMember(@PathVariable Long id) {
        return memberRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateMember(@RequestBody Map<String, Object> payload) {
        try {
            Long id = Long.valueOf(payload.get("id").toString());
            String username = (String) payload.get("username");
//            String phone = (String) payload.get("phone");
//            String addrss = (String) payload.get("address");
 

            Member updatedMember = memberService.updateMember(id, username);
            
            // 回傳更新後的資料（不包含密碼）
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedMember.getId());
            response.put("username", updatedMember.getUsername());
//            response.put("phone", updatedMember.getPhone());
//            response.put("address", updatedMember.getAddress());
            response.put("email", updatedMember.getEmail());
            response.put("email", updatedMember.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("更新失敗：" + e.getMessage());
        }
    }
}