package com.example.backend.repository;

import com.example.backend.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    // 之後如果要找特定使用者的選擇，可以在這裡加方法
    // 例如: List<Slot> findByUsername(String username);
}