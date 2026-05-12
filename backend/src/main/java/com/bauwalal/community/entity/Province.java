package com.bauwalal.community.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "provinces")
@Getter
@Setter
public class Province extends BaseEntity {
    @Column(unique = true, nullable = false)
    private Integer code;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameNp;
}
