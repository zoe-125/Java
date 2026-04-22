package com.example.demo.controller;

import com.example.demo.resource.dto.CheckoutRequest;
import com.example.demo.service.MemberService;

import jakarta.servlet.http.HttpServletResponse;

import com.example.demo.model.Member;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.repository.MemberRepository;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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
            response.put("role", updatedMember.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("更新失敗：" + e.getMessage());
        }
    }
    
    
    /**
     * 🚩 新增功能：處理信箱驗證連結
     * 使用者點擊 Email 連結後會觸發此路徑：GET /api/members/verify?token=xxxxxx
     */
    
    @GetMapping("/verify")
 // 🚩 重點 1：加上 HttpServletResponse 參數，回傳改為 void
	 public void verifyAccount(@RequestParam("token") String token, HttpServletResponse response) throws IOException {
	     try {
	         // 呼叫 Service 層進行 Token 比對與狀態修改
	         boolean isSuccess = memberService.verifyToken(token);
	         
	         if (isSuccess) {
	             // 🚩 重點 2：直接使用 response 進行重導向
	             response.sendRedirect("/login.html?verified=true");
	         } else {
	             response.sendRedirect("/login.html?error=expired");
	         }
	     } catch (Exception e) {
	         // 發生錯誤時也可以導向錯誤頁面或登入頁
	         response.sendRedirect("/login.html?error=system_error");
	     }
	 }
    
 
}