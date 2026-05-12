package com.bauwalal.community.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FamilyPrimaryPersonUpdateRequest {
    @NotNull
    private Long personId;
    private String personNameEn;
    private String personNameNp;
}
