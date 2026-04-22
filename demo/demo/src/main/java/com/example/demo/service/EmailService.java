package com.example.demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
    	String verifyUrl = "http://localhost:8001/api/members/verify?token=" + token;
    	
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("djangodtl123@gmail.com");
        message.setTo(toEmail);
        message.setSubject("LifeStyle 購物 - 會員帳號驗證");
        message.setText("您好：\n\n感謝您的註冊！請點擊以下連結以啟用您的帳號：\n" + verifyUrl);
        mailSender.send(message);
    }
    
    
    
    /**
     * 發送重設密碼信件
     */
    public void sendResetPasswordEmail(String toEmail, String token) {
        // 1. 組合重設連結 (指向我們新建立的 reset-password.html)
        // 注意：如果是開發環境，網址通常是 localhost:8080
        String resetLink = "http://localhost:8001/resetPassword.html?token=" + token;

        // 2. 設定郵件內容
        String subject = "LifeStyle 購物 - 密碼重設請求";
        String content = "您好：\n\n" +
                "我們收到了您的密碼重設請求。請點擊下方連結以設定新密碼：\n" +
                resetLink + "\n\n" +
                "此連結將於 30 分鐘後失效。如果您並未要求重設密碼，請忽略此信件。\n\n" +
                "祝您有愉快的一天！";

        // 3. 執行寄信
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            message.setFrom("djangodtl123@gmail.com"); // 需與設定檔一致

            mailSender.send(message);            
            System.out.println("Email 已成功發送至: " + toEmail); // 幫助你在控制台確認程式有跑完
        } catch (Exception e) {
            // 建議印出 Log 方便排查發信問題
            System.err.println("發送重設密碼信件失敗: " + e.getMessage());
            throw new RuntimeException("郵件發送失敗，請稍後再試");
        }
    }
}