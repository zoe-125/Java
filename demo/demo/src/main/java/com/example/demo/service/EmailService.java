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
}