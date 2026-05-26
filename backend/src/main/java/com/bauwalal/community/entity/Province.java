package com.bauwalal.community.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "provinces")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Province extends BaseEntity {
    @Column(unique = true, nullable = false)
    private Integer code;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameNp;
}
