package com.example.demo.service;

import com.example.demo.model.Member;
import com.example.demo.repository.MemberRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
//import java.util.UUID;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * 會員註冊邏輯
     */
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
        if (password.length() < 6) {
            return "錯誤：密碼長度至少需 6 位字元";
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
        newMember.setStatus("active"); // 開發階段預設 active
        newMember.setFailedAttempts(0); // 初始化錯誤次數為 0
        
        try {
            // 🚩 這行是連結 Java 物件與資料庫的關鍵橋樑
            memberRepository.save(newMember); 
            return "註冊成功！";
        } catch (Exception e) {
            // 萬一資料庫連不上、或是欄位長度爆了，save 就會失敗並跳到這裡
            return "註冊失敗：系統發生錯誤";
        }               
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
    public String resetPasswordAndUnlock(String email, String newPassword) {
        return memberRepository.findByEmail(email).map(member -> {
            // 1. 設定新密碼
            member.setPassword(passwordEncoder.encode(newPassword));
            
            // 2. 🚩 重要：解鎖帳號
            member.setFailedAttempts(0); // 錯誤次數歸零
            member.setStatus("active");  // 狀態改回啟動
            
            memberRepository.save(member);
            return "密碼重設成功，帳號已解鎖！";
        }).orElse("找不到此電子信箱");
    }

}