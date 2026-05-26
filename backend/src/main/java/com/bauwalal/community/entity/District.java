package com.bauwalal.community.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "districts")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class District extends BaseEntity {
    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameNp;

    @ManyToOne
    private Province province;

    /** Nepal federal province number, 1–7 (Koshi … Sudurpashchim). */
    private Integer provinceCode;

    /** English label for province, derived from provinceCode for API consumers. */
    private String provinceNameEn;
}
