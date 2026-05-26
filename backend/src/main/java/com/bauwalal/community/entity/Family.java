package com.bauwalal.community.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "families")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Family extends BaseEntity {
    @Column(nullable = false)
    private String familyNameEn;

    @Column(nullable = false)
    private String familyNameNp;

    private String description;
    private Long primaryPersonId;
    private String primaryPersonNameEn;
    private String primaryPersonNameNp;

    /** Soft-delete: hidden from lists; household members are soft-deleted first. */
    @Column(nullable = false)
    private boolean deleted = false;
}
