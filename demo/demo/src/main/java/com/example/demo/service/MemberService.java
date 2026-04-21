package com.example.demo.service;

import com.example.demo.model.Member;
import com.example.demo.repository.MemberRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
//import java.util.UUID;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService; // 注入發信服務

    public MemberService(MemberRepository memberRepository,EmailService emailService) {
        this.memberRepository = memberRepository;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    public Member updateMember(Long id, String username) {
        return memberRepository.findById(id).map(member -> {
            member.setUsername(username);
//            member.setPhone(phone);
//            member.setAddress(address);
            return memberRepository.save(member); // 存回資料庫
        }).orElseThrow(() -> new RuntimeException("找不到該會員"));
    }

    /**
     * 會員註冊邏輯
     */
    @Transactional
    public String registerMember(String username, String email, String password, String confirmPassword) {
        // 1. 基礎檢查
        if (username == null || username.trim().isEmpty() || 
            email == null || email.trim().isEmpty() || 
            password == null || password.isEmpty()) {
            return "錯誤：所有欄位皆為必填";
        }

        // 2. Email 格式檢查
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9+_.-]+\\.com$";
        if (!email.matches(emailRegex)) {
            return "錯誤：Email 格式不正確";
        }

        // 3. 密碼長度檢查
        if (password.length() < 8) {
            return "錯誤：密碼長度至少需 8 位字元";
        }

        // 4. 密碼一致性檢查
        if (!password.equals(confirmPassword)) {
            return "錯誤：兩次輸入的密碼不一致";
        }

        // 5. 檢查 Email 是否重複
        if (memberRepository.findByEmail(email).isPresent()) {
            return "錯誤：該 Email 已被註冊過";
        }


        Member newMember = new Member();
        newMember.setUsername(username);
        newMember.setEmail(email);
        newMember.setPassword(passwordEncoder.encode(password)); // 使用 BCrypt 加密密碼
        
        // 設定初始權限與狀態
        newMember.setRole("USER"); // 預設不是管理員
        newMember.setStatus("inactive"); 
        newMember.setFailedAttempts(0); 
        
        // 生成驗證資訊
        String token = UUID.randomUUID().toString();
        newMember.setVerificationToken(token);
        newMember.setTokenExpiryTime(LocalDateTime.now().plusHours(24));
        
        try {
            // 🚩 這行是連結 Java 物件與資料庫的關鍵橋樑
            memberRepository.save(newMember); 
            
         // 發送驗證信件
            emailService.sendVerificationEmail(newMember.getEmail(), token);
            
            return "註冊成功！請至信箱收取驗證信以啟用帳號。";
        } catch (Exception e) {
            // 萬一資料庫連不上、或是欄位長度爆了，save 就會失敗並跳到這裡
        	// 處理發信失敗或資料庫失敗
            e.printStackTrace(); // 開發階段建議印出 error log
            return "註冊失敗：系統發生錯誤,請稍後再試";
        }               
    }
    
    @Transactional
    public boolean verifyToken(String token) {
        // 1. 透過 token 尋找會員
        Optional<Member> memberOpt = memberRepository.findByVerificationToken(token);

        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();

            // 2. 檢查帳號是否已經是 active (避免重複驗證)
            if ("active".equals(member.getStatus())) {
                return true; 
            }

            // 3. 檢查 Token 是否過期
            if (member.getTokenExpiryTime().isBefore(LocalDateTime.now())) {
                return false; // 已過期
            }

            // 4. 驗證通過：更新狀態、清空 Token 與過期時間 (為了安全性)
            member.setStatus("active");
            member.setVerificationToken(null);
            member.setTokenExpiryTime(null);
            
            memberRepository.save(member);
            return true;
        }

        return false; // 找不到該 token
    }
    
    
    /**
     * 新增功能：處理登入失敗次數
     * 這裡我們不更動原本的架構，而是提供一個方法讓 Controller 呼叫
     */
    public void processFailedLogin(Member member) {
        int newAttempts = member.getFailedAttempts() + 1;
        member.setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
            member.setStatus("locked"); // 超過5次則變更狀態
        }
        memberRepository.save(member);
    }
    
    /**
     * 新增功能：登入成功後歸零次數
     */
    public void resetFailedAttempts(Member member) {
        if (member.getFailedAttempts() > 0) {
            member.setFailedAttempts(0);
            memberRepository.save(member);
        }
    }
    
    /**
     * 更新最近登入時間
     */
    public void updateLastLoginTime(Member member) {
        member.setLastLoginAt(LocalDateTime.now()); // 設定為當下時間
        memberRepository.save(member);
    }
    
    /**
     * 重設密碼並解除鎖定狀態
     */
    @Transactional
    public String resetPasswordAndUnlock(String email, String newPassword) {
        return memberRepository.findByEmail(email).map(member -> {
            // 設定新密碼
            member.setPassword(passwordEncoder.encode(newPassword));
            
            // 僅針對「被鎖定」的帳號進行狀態恢復
            if ("locked".equals(member.getStatus())) {
                member.setStatus("active");
            }
            
            
            // 重要：解鎖帳號
            member.setFailedAttempts(0); // 錯誤次數歸零
            //member.setStatus("active");  // 狀態改回啟動
            
            memberRepository.save(member);
            return "密碼重設成功";
        }).orElse("找不到此電子信箱");
    }

}