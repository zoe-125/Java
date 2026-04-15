package ecpay.payment.sdk;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.TreeMap;

public class EcpayValidator {
    public static String generateCheckMacValue(String hashKey, String hashIV, Map<String, String> params) {
        // 1. 使用 TreeMap 進行 A-Z 排序 (不可使用 CASE_INSENSITIVE_ORDER)
        TreeMap<String, String> sortedParams = new TreeMap<>();
        sortedParams.putAll(params);
        sortedParams.remove("CheckMacValue");

        // 2. 拼湊原始字串
        StringBuilder sb = new StringBuilder();
        sb.append("HashKey=").append(hashKey);
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            sb.append("&").append(entry.getKey()).append("=").append(entry.getValue());
        }
        sb.append("&HashIV=").append(hashIV);

        // 3. 符合綠界規範的 URL Encode
        String urlEncoded = ecpayUrlEncode(sb.toString());

        // 4. SHA-256 加密轉大寫
        return sha256(urlEncoded).toUpperCase();
    }

    private static String ecpayUrlEncode(String str) {
        try {
            // 關鍵：將空格 "+" 轉為 "%20"，並確保全小寫
            String encoded = URLEncoder.encode(str, StandardCharsets.UTF_8.name())
                    .replace("+", "%20")
                    .toLowerCase();
            
            // 特殊符號還原
            return encoded.replace("%21", "!").replace("%28", "(").replace("%29", ")")
                          .replace("%2a", "*").replace("%2d", "-").replace("%5f", "_")
                          .replace("%2e", ".");
        } catch (Exception e) { return ""; }
    }

    private static String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) { throw new RuntimeException(ex); }
    }
}