package com.example.demo.resource.dto;

/**
 * 用來接收登入表單資料的 Record
 */
public record Login(
    String email,
    String password
) {}