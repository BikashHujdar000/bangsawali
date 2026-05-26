package com.bauwalal.community.entity;

import com.bauwalal.community.enums.Gender;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "persons")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Person extends BaseEntity {
    @ManyToOne(optional = false)
    private Family family;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameNp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    private LocalDate dateOfBirth;
    private String phone;

    @ManyToOne
    private District district;

    private Integer wardNo;
    private String toleEn;
    private String toleNp;
    private String municipality;
    private String vdc;

    @ManyToOne
    @JoinColumn(name = "father_id")
    @JsonIgnoreProperties({"father", "mother", "spouse"})
    private Person father;

    @ManyToOne
    @JoinColumn(name = "mother_id")
    @JsonIgnoreProperties({"father", "mother", "spouse"})
    private Person mother;

    @OneToOne
    @JoinColumn(name = "spouse_id")
    @JsonIgnoreProperties({"father", "mother", "spouse"})
    private Person spouse;

    @Column(nullable = false)
    private boolean deleted = false;
}
