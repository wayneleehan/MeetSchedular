package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data // Lombok 自動生成 Getter/Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "availability_slots")
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    private int dayIndex;

    // 0 - 23 (代表小時)
    @Column(name = "slot_hour")
    private int hour;

    // 誰選了這個時段 (暫時用字串存名字)
    private String username;
}