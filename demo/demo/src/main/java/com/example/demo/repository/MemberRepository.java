package com.example.demo.repository;

import com.example.demo.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 🚩 使用 Optional 包裝，代表「可能找不到這名會員」
    Optional<Member> findByEmail(String email);

    // 我們之後還需要透過驗證碼找人，所以順便定義這個：
    Optional<Member> findByVerificationToken(String token);
    
}