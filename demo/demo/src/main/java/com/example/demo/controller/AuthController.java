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
@RequestMapping("/api/auth") 
public class AuthController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder; 
    
    public AuthController(MemberService memberService, MemberRepository memberRepository) {
    	this.memberService = memberService;
        this.memberRepository = memberRepository;    	
        this.passwordEncoder = new BCryptPasswordEncoder(); 
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
                	// 更新最近登入時間
                    memberService.updateLastLoginTime(member);
                    // 登入成功：歸零錯誤次數
                    memberService.resetFailedAttempts(member); 
                                        
                    // 🚩 整合後的封裝：確保包含 id, username, role, email
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", member.getId());           // 對應 loginUser.id
                    response.put("username", member.getUsername()); // 對應 loginUser.username
                    response.put("role", member.getRole());       // 對應 loginUser.role
                    response.put("email", member.getEmail());     // 🚩 這裡補上了信箱！
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
        String newPassword = request.get("password"); 

        if (email == null || newPassword == null) {
            return ResponseEntity.status(400).body("資料缺失");
        }

        String result = memberService.resetPasswordAndUnlock(email, newPassword);

        if (result.contains("成功")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(400).body(result);
        }
    }
}

