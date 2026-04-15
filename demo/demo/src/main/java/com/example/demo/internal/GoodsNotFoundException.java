package com.example.demo.internal;

public class GoodsNotFoundException extends Exception {

	private static final long serialVersionUID = 1L;

	private String code;
	
	public GoodsNotFoundException(String code) {
		super();
		this.code = code;
	}
	
	public String getCode() {
		return this.code;
	}
}
