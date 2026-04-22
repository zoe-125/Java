package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "failed_attempts")
    private int failedAttempts = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Column(name = "role")
    private String role= "USER";

    @Column(name = "status")
    private String status = "pending"; // 預設為待驗證
    
    @Column(name = "verification_token")
    private String verificationToken;
    
    @Column(name = "token_expiry_time")
    private LocalDateTime tokenExpiryTime;
    
    
    @Column(name = "reset_token")
    private String resetToken;
    
    @Column(name = "reset_token_expiry_time")
    private LocalDateTime resetTokenExpiryTime;
    
//    private String phone;
//    private String address;
    


    // 1. 無參數建構子 (JPA 必備)
    public Member() {}

    // 2. 註冊時常用的建構子
    public Member(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    


    // --- Getter and Setters ---

    public Long getId() { 
    	return id; 
    	}
    public void setId(Long id) { 
    	this.id = id; 
    	}

    public String getUsername() { 
    	return username; 
    	}
    public void setUsername(String username) { 
    	this.username = username; 
    	}

    public String getEmail() { 
    	return email; 
    	}
    public void setEmail(String email) { 
    	this.email = email; 
    	}

    public String getPassword() { 
    	return password; 
    	}
    public void setPassword(String password) { 
    	this.password = password; 
    	}

    public int getFailedAttempts() { 
    	return failedAttempts; 
    	}
    public void setFailedAttempts(int failedAttempts) { 
    	this.failedAttempts = failedAttempts; 
    	}

    public LocalDateTime getCreatedAt() { 
    	return createdAt; 
    	}
    public void setCreatedAt(LocalDateTime createdAt) { 
    	this.createdAt = createdAt; 
    	}

    public LocalDateTime getLastLoginAt() { 
    	return lastLoginAt; 
    	}
    public void setLastLoginAt(LocalDateTime lastLoginAt) { 
    	this.lastLoginAt = lastLoginAt; 
    	}

    public String getStatus() { 
    	return status; 
    	}
    public void setStatus(String status) { 
    	this.status = status; 
    	}

    // 注意：布林值的慣用命名方式
    public String getRole() { 
    	return role; 
    	}
    public void setRole(String role) { 
    	this.role = role; 
    	}
  
    public String getVerificationToken() { 
    	return verificationToken; 
    	}
    public void setVerificationToken(String verificationToken) { 
    	this.verificationToken = verificationToken; 
    	}
    
    public LocalDateTime getTokenExpiryTime() { 
    	return tokenExpiryTime; 
    	}
    public void setTokenExpiryTime(LocalDateTime tokenExpiryTime) { 
    	this.tokenExpiryTime = tokenExpiryTime; 
    	}
    
    
    public String getResetToken() { 
    	return resetToken; 
    	}
    public void setResetToken(String resetToken) { 
    	this.resetToken = resetToken; 
    	}
    
    public LocalDateTime getResetTokenExpiryTime() { 
    	return resetTokenExpiryTime; 
    	}
    public void setResetTokenExpiryTime(LocalDateTime resetTokenExpiryTime) { 
    	this.resetTokenExpiryTime = resetTokenExpiryTime; 
    	}
//    public String getPhone() {
//        return phone;
//    }
//
//    public String getAddress() {
//        return address;
//    }
//    
//    public void setPhone(String phone) {
//        this.phone = phone;
//    }
//
//    public void setAddress(String address) {
//        this.address = address;
//    }
   
    

}
	


//package com.example.demo.model;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "members")
//public class Member {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false)
//    private String username;
//
//    @Column(nullable = false, unique = true)
//    private String email;
//
//    @Column(nullable = false)
//    private String password;
//
//    @Column(name = "failed_attempts", nullable = false)
//    private int failedAttempts = 0;
//
//    @Column(name = "created_at", updatable = false, nullable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "last_login_at")
//    private LocalDateTime lastLoginAt;
//
//
//    	
//    // JPA 規範需要的無參數建構子
//    public Member() {}
//
//    // 註冊時使用的建構子
//    public Member(String username, String email, String password) {
//        this.username = username;
//        this.email = email;
//        this.password = password;
//        this.failedAttempts = 0;
//        this.createdAt = LocalDateTime.now(); // 建立物件時自動產生成員註冊時間
//    }
//
//    private String status = "inactivate"; // 狀態：inactivate, activate
//    private boolean admin = false;        // 是否為管理員
//    
//    // --- Getter & Setter ---
//
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public String getUsername() { return username; }
//    public void setUsername(String username) { this.username = username; }
//
//    public String getEmail() { return email; }
//    public void setEmail(String email) { this.email = email; }
//
//    public String getPassword() { return password; }
//    public void setPassword(String password) { this.password = password; }
//
//    public int getFailedAttempts() { return failedAttempts; }
//    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }
//
//    public LocalDateTime getCreatedAt() { return createdAt; }
//    // 不需要 setCreatedAt，因為它是固定的
//
//    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
//    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
//    
// 
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//    public boolean isAdmin() { return admin; }
//    public void setAdmin(boolean admin) { this.admin = admin; }
//    
//    
//}