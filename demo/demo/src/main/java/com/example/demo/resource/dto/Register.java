package com.example.demo.resource.dto;

/**
 * 這是用來接收註冊表單資料的 Record
 */
public record Register(
    String username,
    String email,
    String password,
    String confirmPassword
) {}


