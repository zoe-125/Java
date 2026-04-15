package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path; // ✅ 正確的 Path
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Value("${file.upload-dir}")
    private String uploadDir; // 從 application.yml 讀取路徑

    /**
     * 1. 獲取所有商品 (GET)
     */
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    /**
     * 2. 獲取特定商品 (GET)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 3. 刪除商品 (DELETE)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("商品已成功刪除 (ID: " + id + ")");
    }

    /**
     * 4. 基礎上架 (純 JSON，不含圖片檔案)
     */
    @PostMapping("/upload")
    public ResponseEntity<Product> uploadProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return ResponseEntity.ok(savedProduct);
    }

    /**
     * 5. 進階上架：包含實體圖片上傳 (Multipart Form Data)
     */
    @PostMapping("/upload-with-image")
    public ResponseEntity<?> uploadProductWithImage(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("price") Integer price,
            @RequestParam("stock") Integer stock, // ✅ 新增這行來接收前端傳來的 stock
            @RequestParam("description") String description,            
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            // --- 1. 資料基本檢查 ---
            if (title == null || title.isBlank()) {
                return ResponseEntity.badRequest().body("商品名稱不能為空");
            }
            if (price == null || price <= 0) {
                return ResponseEntity.badRequest().body("價格必須大於 0");
            }

            // --- 2. 建立 Product 實體 ---
            Product product = new Product();
            product.setTitle(title);
            product.setCategory(category);
            product.setPrice(price);
            product.setStock(stock); // ✅ 將接收到的 stock 存入實體
            product.setDescription(description);

            // --- 3. 處理實體圖片存檔 ---
            if (image != null && !image.isEmpty()) {
                // A. 檢查格式
                String contentType = image.getContentType();
                if (contentType == null || !(contentType.contains("image/jpeg") || contentType.contains("image/png"))) {
                    return ResponseEntity.badRequest().body("僅支援 JPG 或 PNG 格式圖片");
                }

                // B. 產生唯一檔名
                String originalFileName = image.getOriginalFilename();
                String fileName = System.currentTimeMillis() + "_" + originalFileName;

                // C. 確保資料夾存在
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                // D. 執行存檔到硬碟
                Path path = Paths.get(uploadDir + fileName);
                Files.write(path, image.getBytes());

                // E. 設定資料庫存取的 URL 路徑
                product.setImageUrl("/uploads/" + fileName);
            }

            // --- 4. 儲存到資料庫 ---
            Product savedProduct = productService.saveProduct(product);
            return ResponseEntity.ok(savedProduct);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("檔案儲存失敗：" + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("後端處理發生錯誤：" + e.getMessage());
        }
    }
    
    /**
     * 6. 修改商品 (PUT)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productService.getProductById(id).map(product -> {
            // 只更新價格和描述
            product.setPrice(productDetails.getPrice());
            product.setDescription(productDetails.getDescription());
            product.setStock(productDetails.getStock()); // ✅ 新增：更新庫存
            
            Product updatedProduct = productService.saveProduct(product);
            return ResponseEntity.ok(updatedProduct);
        }).orElse(ResponseEntity.notFound().build());
    }
 
    
}

//package com.example.demo.controller;
//
//import com.example.demo.model.Product;
//import com.example.demo.service.ProductService;
//
//import jakarta.persistence.criteria.Path;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.File;
//import java.io.IOException;
//import java.nio.file.Files;
//import java.nio.file.Paths;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/products")
//public class ProductController {
//
//    @Autowired
//    private ProductService productService;
//
//    /**
//     * 1. 獲取所有商品 (GET)
//     */
//    @GetMapping
//    public List<Product> getAllProducts() {
//        return productService.getAllProducts();
//    }
//
//    /**
//     * 2. 獲取特定商品 (GET)
//     */
//    @GetMapping("/{id}")
//    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
//        return productService.getProductById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    /**
//     * 3. 刪除商品 (DELETE)
//     */
//    @DeleteMapping("/{id}")
//    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
//        productService.deleteProduct(id);
//        return ResponseEntity.ok("商品已成功刪除 (ID: " + id + ")");
//    }
//
//    /**
//     * 4. 基礎上架 (純 JSON，不含圖片檔案)
//     */
//    @PostMapping("/upload")
//    public ResponseEntity<Product> uploadProduct(@RequestBody Product product) {
//        Product savedProduct = productService.saveProduct(product);
//        return ResponseEntity.ok(savedProduct);
//    }
//
//    @Value("${file.upload-dir}")
//    private String uploadDir; // 🚩 會自動讀取 yml 中的 C:/Java_project/upload_images/
//
//    @PostMapping("/upload-with-image")
//    public ResponseEntity<?> uploadProduct(
//            @RequestParam("title") String title,
//            @RequestParam("category") String category,
//            @RequestParam("price") Double price,
//            @RequestParam("description") String description,
//            @RequestParam(value = "image", required = false) MultipartFile image) {
//
//        try {
//            // --- 1. 資料基本檢查 (保留舊版的嚴謹) ---
//            if (title == null || title.isBlank()) {
//                return ResponseEntity.badRequest().body("商品名稱不能為空");
//            }
//            if (price == null || price <= 0) {
//                return ResponseEntity.badRequest().body("價格必須大於 0");
//            }
//
//            // --- 2. 建立 Product 實體 ---
//            Product product = new Product();
//            product.setTitle(title);
//            product.setCategory(category);
//            product.setPrice(price);
//            product.setDescription(description);
//
//            // --- 3. 處理實體圖片存檔 ---
//            if (image != null && !image.isEmpty()) {
//                // A. 檢查格式
//                String contentType = image.getContentType();
//                if (contentType == null || !(contentType.contains("image/jpeg") || contentType.contains("image/png"))) {
//                    return ResponseEntity.badRequest().body("僅支援 JPG 或 PNG 格式圖片");
//                }
//
//                // B. 產生唯一檔名 (避免重複)
//                String originalFileName = image.getOriginalFilename();
//                String fileName = System.currentTimeMillis() + "_" + originalFileName;
//
//                // C. 確保資料夾存在 (防止路徑不存在導致報錯)
//                File directory = new File(uploadDir);
//                if (!directory.exists()) {
//                    directory.mkdirs();
//                }
//
//                // D. 執行存檔到硬碟
//                Path path = Paths.get(uploadDir + fileName);
//                Files.write(path, image.getBytes());
//
//                // E. 設定資料庫存取的 URL (對應 WebConfig 的 /uploads/**)
//                product.setImageUrl("/uploads/" + fileName);
//            }
//
//            // --- 4. 儲存到資料庫 ---
//            Product savedProduct = productService.saveProduct(product);
//            
//            // 為了讓前端方便處理，我們回傳整個物件
//            return ResponseEntity.ok(savedProduct);
//
//        } catch (IOException e) {
//            e.printStackTrace();
//            return ResponseEntity.status(500).body("檔案儲存失敗：" + e.getMessage());
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(500).body("後端處理發生錯誤：" + e.getMessage());
//        }
//    }
//    
    
//    
//    @PostMapping("/upload-with-image")
//    public ResponseEntity<?> uploadProduct(
//            @RequestParam("title") String title,
//            @RequestParam("description") String description,
//            @RequestParam("price") Double price,
//            @RequestParam("category") String category,
//            @RequestParam(value = "image", required = false) MultipartFile image) {
//
//        try {
//            Product product = new Product();
//            product.setTitle(title);
//            product.setDescription(description);
//            product.setPrice(price);
//            product.setCategory(category);
//
//            // 如果有傳圖片，這裡可以處理儲存邏輯（目前先設為空字串或處理過的檔名）
//            if (image != null && !image.isEmpty()) {
//                // 範例：暫時先存個檔名，之後再做實體存檔
//                product.setImageUrl(image.getOriginalFilename());
//            }
//
//            Product savedProduct = productService.saveProduct(product);
//            return ResponseEntity.ok(savedProduct);
//            
//        } catch (Exception e) {
//            // 這會把後端的報錯印在 IntelliJ 的控制台，方便你除錯
//            e.printStackTrace(); 
//            return ResponseEntity.status(500).body("後端發生錯誤：" + e.getMessage());
//        }
//    }
//}