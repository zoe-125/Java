package com.example.demo.controller;

import com.example.demo.repository.MemberRepository;
import com.example.demo.resource.dto.*;
import com.example.demo.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // 設定統一的基礎路徑
public class AuthController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder; // ✅ 2. 定義加密器
    
    // 🚩 只需要注入 MemberService
    public AuthController(MemberService memberService, MemberRepository memberRepository) {
    	this.memberService = memberService;
        this.memberRepository = memberRepository;    	
        this.passwordEncoder = new BCryptPasswordEncoder(); // ✅ 3. 初始化加密器
    }

    /**
     * 處理註冊請求
     */
    @PostMapping("/register")
    public String register(@RequestBody Register request) {
        return memberService.registerMember(
                request.username(),
                request.email(),
                request.password(),
                request.confirmPassword()
        );
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Login request) {
        return memberRepository.findByEmail(request.email())
            .map(member -> {
            	// 1. 先檢查帳號是否已被鎖定
                if ("locked".equals(member.getStatus()) || member.getFailedAttempts() >= 5) {
                    return ResponseEntity.status(403).body("錯誤次數過多，帳號已被鎖定");
                }
            	
            	
                // 2. 比對密碼
                if (passwordEncoder.matches(request.password(), member.getPassword())) {                	
                	// 🚩 這裡新增：更新最近登入時間
                    memberService.updateLastLoginTime(member);
                    // 登入成功：歸零錯誤次數
                    memberService.resetFailedAttempts(member); 
                                        
                    // 🚩 封裝回傳給前端的資料
                    Map<String, Object> response = new HashMap<>();
                    response.put("username", member.getUsername());
                    response.put("userRole", member.getRole()); // 這裡對應你的 Member.java
                    response.put("status", member.getStatus());
                    return ResponseEntity.ok(response);
                } else {
                	// 密碼錯誤：增加錯誤次數
                    memberService.processFailedLogin(member);
                    return ResponseEntity.status(401).body("電子信箱或密碼錯誤");
                }               
            })
            .orElse(ResponseEntity.status(404).body("帳號不存在"));
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        boolean exists = memberRepository.findByEmail(email).isPresent();
        
        if (exists) {
            return ResponseEntity.ok("帳號存在");
        } else {
            return ResponseEntity.status(404).body("帳號不存在");
        }
    }
    
    /**
     * 處理重設密碼與解鎖請求
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("password"); // 對應前端傳送的 key 是 password

        if (email == null || newPassword == null) {
            return ResponseEntity.status(400).body("資料缺失");
        }

        // 呼叫 Service 執行重設與解鎖邏輯
        String result = memberService.resetPasswordAndUnlock(email, newPassword);

        if (result.contains("成功")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(400).body(result);
        }
    }

}