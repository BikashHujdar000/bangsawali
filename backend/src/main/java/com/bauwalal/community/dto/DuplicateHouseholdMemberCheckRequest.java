package com.bauwalal.community.dto;

import com.bauwalal.community.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * Find an existing active household member with the same identity as {@link PersonService}
 * duplicate rules. {@code skipPersonIds} lets the client ignore certain people (e.g. parents)
 * when resolving a new child row to an existing record.
 */
@Data
public class DuplicateHouseholdMemberCheckRequest {
    private List<Long> skipPersonIds;

    @NotBlank
    private String nameEn;
    @NotBlank
    private String nameNp;
    @NotNull
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phone;
}
