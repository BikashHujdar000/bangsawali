package com.bauwalal.community.dto;

import com.bauwalal.community.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PersonUpdateRequest {
    @NotNull
    private Long familyId;
    @NotBlank
    private String nameEn;
    @NotBlank
    private String nameNp;
    @NotNull
    private Gender gender;
    private Long districtId;
    private LocalDate dateOfBirth;
    private Integer wardNo;
    private String toleEn;
    private String toleNp;
    private String municipality;
    private String vdc;
    private String phone;
    private Long fatherId;
    private Long motherId;
    private Long spouseId;
    private List<Long> spouseIds;
}
