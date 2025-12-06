package com.example.backend.controller;

import com.example.backend.model.Slot;
import com.example.backend.repository.SlotRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "http://localhost:5173") // ★允許前端 React 連線
public class SlotController {

    @Autowired
    private SlotRepository slotRepository;

    // 1. 取得所有選取的時段
    @GetMapping
    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    // 2. 新增一個選取時段
    @PostMapping
    public Slot addSlot(@RequestBody Slot slot) {
        return slotRepository.save(slot);
    }
    
    // 3. 取消選取 (刪除)
    // 這裡簡化邏輯：前端傳送 ID 來刪除，或者我們可以做更聰明的刪除
    @DeleteMapping("/{id}")
    public void deleteSlot(@PathVariable Long id) {
        slotRepository.deleteById(id);
    }
}