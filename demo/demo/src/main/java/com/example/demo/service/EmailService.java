// 記得補上 package 和 import
package com.example.demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code) {
    	String verifyUrl = "http://localhost:9990/api/auth/verify?code=" + code;
    	
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("djangodtl123@gmail.com");
        message.setTo(to);
        message.setSubject("TECO 購物通 - 會員帳號驗證");
        message.setText("您好：\n\n感謝您的註冊！請點擊以下連結以啟用您的帳號：\n" + verifyUrl);
        mailSender.send(message);
    }
}