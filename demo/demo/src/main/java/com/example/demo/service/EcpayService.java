package com.example.demo.service;  // 👉 改成你的專案路徑

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.codec.digest.DigestUtils;

@Service
public class EcpayService {
	 private String hashKey = "pwFHCqoQZGmho4w6";
     private String hashIV = "EkRm7iFT261dpevs";

//    private String hashKey = "5294y06JbISpM5x9";
//    private String hashIV = "v77hoKGq4kWxNNIS";

    // ✅ 1️⃣ 產生 CheckMacValue
    public String genCheckMacValue(Map<String, String> params) {

        Map<String, String> sortedMap = new TreeMap<>(params);

        StringBuilder sb = new StringBuilder();
        sb.append("HashKey=").append(hashKey);

        for (Map.Entry<String, String> entry : sortedMap.entrySet()) {
            sb.append("&").append(entry.getKey()).append("=").append(entry.getValue());
        }

        sb.append("&HashIV=").append(hashIV);

        String raw = sb.toString()
                .toLowerCase()
                .replaceAll("%", "%25")
                .replaceAll("\\+", "%2b")
                .replaceAll(" ", "%20");

        return DigestUtils.md5Hex(raw).toUpperCase();
    }

    // ✅ 2️⃣ 產生自動送出表單
    public String generateAutoSubmitForm(Map<String, String> params) {

        StringBuilder form = new StringBuilder();
        form.append("<form id='ecpayForm' method='post' action='https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'>");

        for (Map.Entry<String, String> entry : params.entrySet()) {
            form.append("<input type='hidden' name='")
                .append(entry.getKey())
                .append("' value='")
                .append(entry.getValue())
                .append("'/>");
        }

        form.append("</form>");
        form.append("<script>document.getElementById('ecpayForm').submit();</script>");

        return form.toString();
    }
}