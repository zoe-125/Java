package com.example.demo.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Product;
import com.example.demo.service.GoodsService;
import com.example.demo.service.ProductService;

@RestController
@CrossOrigin(origins = "*") // 允許前端跨網域存取
public class ProductResource {
	
//	@Autowired
//	private GoodsService service;
	@Autowired
	private ProductService productService;
	
	// 🚩 修正 1: 把回傳類型改成 ResponseEntity<Product>，這才能正確處理 JSON
    @GetMapping(path="/api/products/{id}", produces="application/json")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        System.out.println("收到請求 ID: " + id);
        
        // 🚩 修正 2: 既然參數已經是 Long，就不需要寫 try-catch 去 parseInt 了
        // 直接呼叫你之前定義好的 getProductById 方法
        return productService.getProductById(id)
                .map(product -> ResponseEntity.ok(product))
                .orElse(ResponseEntity.notFound().build());
    }
}
	
	
//    @GetMapping(path="/api/products/{id}", produces="application/json")
//    public String getProduct(@PathVariable Long id) {
//        System.out.println("收到請求 ID: " + id);
//        
//        return productService.getProductById(id)
//                .map(product -> ResponseEntity.ok(product))
//                .orElse(ResponseEntity.notFound().build());
//    }
//}
        
        
        
//        int i;
//        try {
//        	i = Integer.parseInt(id);
//        } catch (NumberFormatException | NullPointerException e) {
//        	i = 0;
//        	e.printStackTrace();
//        } catch (Exception e) {
//        	i = 0;
//        	e.printStackTrace();
//        } finally {
//        	System.out.println("finally");
//        }
        
//        return productService.get(i);
        		
//       int m = Math.abs(i%3);
//        System.out.println(m);
//
//        return switch (m) {
//        	//case 0 -> goods1();
//            case 1 -> goods2();
//            case 2 -> goods3();           
//            default -> goods0();
//        };
//    }
//    
//    private String goods0() throws GoodsNotFoundException {
//    	throw new GoodsNotFoundException();
//    }
//
//    private String goods1() {
//        return """
//        {
//            "id": "1",
//            "brand": "TECO 東元",
//            "title": "白大廚 23L 三合一多功能氣炸烤微波爐",
//            "model": "YM2302CBW",
//            "capacity": "23L",
//            "promoText": "氣炸+燒烤+微波，一機搞定",
//            "marketPrice": 7990,
//            "currentPrice": 6990,
//            "features": ["23L 大容量", "10 道自動料理", "附烤盤烤架"],
//            "images": [
//        		"static/microwave.png",
//        		"static/microwaveThumbnail.png"                
//            ],
//            "warranty": "1 年保固期"
//        }
//        """;
//    }
//
//    private String goods2() {
//        return """
//        {
//            "id": "2",
//            "brand": "TECO 東元",
//            "title": "高效能負離子吹風機",
//            "model": "ND76544",
//            "capacity": "1500W",
//            "promoText": "速乾護髮，沙龍級體驗",
//            "marketPrice": 8990,
//            "currentPrice": 7990,
//            "features": ["風力強大快速吹乾", "三段式風力", "冷溫熱變頻控制"],
//            "images": [
//        		"static/hairdryer.png",
//        		"static/hairdryerThumbnail.png"                
//            ],
//            "warranty": "1 年保固期"
//        }
//        """;
//    }
//
//    private String goods3() {
//        return """
//        {
//            "id": "3",
//            "brand": "TECO 東元",
//            "title": "一級能效省電冰箱",
//            "model": "AC53140",
//            "capacity": "450L",
//            "promoText": "極致省電，新鮮長存",
//            "marketPrice": 19990,
//            "currentPrice": 18990,
//            "features": ["空間容量大", "溫度自動調節", "變頻馬達超安靜"],
//            "images": [
//        		"static/fridge.png",
//        		"static/fridgeThumbnail.png"                   
//            ],
//            "warranty": "1 年保固期"
//        }
//        """;
//    }
//}
//}