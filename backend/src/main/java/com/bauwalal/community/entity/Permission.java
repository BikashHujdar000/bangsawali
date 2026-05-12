package com.bauwalal.community.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "permissions")
@Getter
@Setter
public class Permission extends BaseEntity {
    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String description;
}
