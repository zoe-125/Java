package com.example.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import java.text.SimpleDateFormat;
import java.util.*;
import ecpay.payment.sdk.EcpayValidator; // 請確保此類別存在

@RestController
public class PaymentController {

	@PostMapping("/payment/checkout")
	@ResponseBody
	public String checkout(
	        @RequestParam("itemName") String itemName, 
	        @RequestParam("totalAmount") String totalAmount) {
	    
	    // 1. 金鑰設定 (3002607)
	    String merchantID = "3002607"; 
	    String hashKey = "pwFHCqoQZGmho4w6";
	    String hashIV = "EkRm7iFT261dpevs";

	    // 2. 參數準備
	    Map<String, String> params = new HashMap<>();
	    params.put("MerchantID", merchantID);
	    params.put("MerchantTradeNo", "DX" + System.currentTimeMillis());
	    params.put("MerchantTradeDate", new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date()));
	    params.put("PaymentType", "aio");
	    params.put("TotalAmount", totalAmount);
	    params.put("TradeDesc", "TECO_Shopping_Order");
	    params.put("ItemName", itemName);
	    params.put("ReturnURL", "https://www.google.com"); 
	    params.put("ChoosePayment", "ALL");
	    params.put("EncryptType", "1");
	    params.put("OrderResultURL", "http://localhost:9970/thanks.html");

	    // 3. 計算 CheckMacValue
	    String checkMacValue = "";
	    try {
	        checkMacValue = EcpayValidator.generateCheckMacValue(hashKey, hashIV, params);
	    } catch (Exception e) {
	        return "<h1>加密失敗，請檢查後端日誌</h1>";
	    }

	    // 4. 構建自動提交的 HTML (這會由瀏覽器直接載入並執行)
	    StringBuilder html = new StringBuilder();
	    html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body>");
	    html.append("<form id='ecpay-form' action='https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5' method='post'>");
	    
	    for (Map.Entry<String, String> entry : params.entrySet()) {
	        html.append("<input type='hidden' name='").append(entry.getKey()).append("' value='").append(entry.getValue()).append("'/>");
	    }
	    html.append("<input type='hidden' name='CheckMacValue' value='").append(checkMacValue).append("'/>");
	    html.append("</form>");
	    
	    // 這裡的 submit() 在非 AJAX 環境下就不會被 CSP 擋住
	    html.append("<script type='text/javascript'>document.getElementById('ecpay-form').submit();</script>");
	    html.append("</body></html>");

	    return html.toString();
	}
}