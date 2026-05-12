package com.bauwalal.community.controller;

import com.bauwalal.community.dto.DuplicateHouseholdMemberCheckRequest;
import com.bauwalal.community.dto.DuplicateHouseholdMemberResponse;
import com.bauwalal.community.dto.FamilyCreateRequest;
import com.bauwalal.community.dto.FamilyPrimaryPersonUpdateRequest;
import com.bauwalal.community.dto.FamilyUpdateRequest;
import com.bauwalal.community.entity.Family;
import com.bauwalal.community.entity.Person;
import com.bauwalal.community.repository.FamilyRepository;
import com.bauwalal.community.repository.PersonRepository;
import com.bauwalal.community.service.FamilyBranchingService;
import com.bauwalal.community.service.FamilyDeletionService;
import com.bauwalal.community.service.FamilyViewService;
import com.bauwalal.community.service.PersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/families")
@RequiredArgsConstructor
public class FamilyController {
    private final FamilyRepository familyRepository;
    private final PersonRepository personRepository;
    private final PersonService personService;
    private final FamilyBranchingService familyBranchingService;
    private final FamilyViewService familyViewService;
    private final FamilyDeletionService familyDeletionService;

    /**
     * Lists families. Default {@code status=active} (non-deleted only).
     * ADMIN and SUPER_ADMIN may use {@code status=deleted} or {@code status=all}; other roles always get active only.
     */
    @GetMapping
    public List<Family> list(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "active") String status) {
        String normalized = status == null ? "active" : status.trim().toLowerCase();
        if (!normalized.equals("active") && !normalized.equals("deleted") && !normalized.equals("all")) {
            normalized = "active";
        }
        boolean adminOrSuper = hasAnyRole(authentication, "ROLE_ADMIN", "ROLE_SUPER_ADMIN");
        if (!adminOrSuper || "active".equals(normalized)) {
            return familyRepository.listActiveOrderByIdDesc();
        }
        if ("deleted".equals(normalized)) {
            return familyRepository.listSoftDeletedOrderByIdDesc();
        }
        return familyRepository.findAllByOrderByIdDesc();
    }

    private static boolean hasAnyRole(Authentication auth, String... roles) {
        if (auth == null) {
            return false;
        }
        for (GrantedAuthority a : auth.getAuthorities()) {
            for (String r : roles) {
                if (r.equals(a.getAuthority())) {
                    return true;
                }
            }
        }
        return false;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long safeId = Objects.requireNonNull(id);
        familyDeletionService.softDeleteFamily(safeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * SUPER_ADMIN only: fetch a family even if it is soft-deleted.
     * Used to show "Retrieve" option on the family details page.
     */
    @GetMapping("/{id}/include-deleted")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Family getIncludingDeleted(@PathVariable Long id) {
        Long safeId = Objects.requireNonNull(id);
        return familyRepository.findById(safeId).orElseThrow(() -> new RuntimeException("Family not found"));
    }

    /**
     * SUPER_ADMIN only: restore a soft-deleted family and its members.
     */
    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        Long safeId = Objects.requireNonNull(id);
        familyDeletionService.restoreFamily(safeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * SUPER_ADMIN only: remove the family and all its members from the database permanently.
     */
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deletePermanent(@PathVariable Long id) {
        Long safeId = Objects.requireNonNull(id);
        familyDeletionService.permanentlyDeleteFamily(safeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/branch-from-person/{personId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Family createBranchFromPerson(@PathVariable Long personId) {
        return familyBranchingService.createNewHouseholdFromPerson(personId);
    }

    @PostMapping
    public Family create(@RequestBody FamilyCreateRequest request) {
        Family family = new Family();
        String fallback = "Family-" + System.currentTimeMillis();
        family.setFamilyNameEn(
                request.getPrimaryPersonNameEn() == null || request.getPrimaryPersonNameEn().isBlank()
                        ? fallback
                        : request.getPrimaryPersonNameEn().trim()
        );
        family.setFamilyNameNp(
                request.getPrimaryPersonNameNp() == null || request.getPrimaryPersonNameNp().isBlank()
                        ? family.getFamilyNameEn()
                        : request.getPrimaryPersonNameNp().trim()
        );
        family.setDescription(request.getDescription());
        return familyRepository.save(family);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Family update(@PathVariable Long id, @RequestBody FamilyUpdateRequest request) {
        Long safeId = Objects.requireNonNull(id);
        Family family = familyRepository.findById(safeId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (family.isDeleted()) {
            throw new RuntimeException("Family not found");
        }
        if (request.getFamilyNameEn() != null && !request.getFamilyNameEn().isBlank()) {
            family.setFamilyNameEn(request.getFamilyNameEn().trim());
        }
        if (request.getFamilyNameNp() != null && !request.getFamilyNameNp().isBlank()) {
            family.setFamilyNameNp(request.getFamilyNameNp().trim());
        }
        family.setDescription(request.getDescription());
        return familyRepository.save(family);
    }

    @GetMapping("/{id}")
    public Family get(@PathVariable Long id) {
        Long safeId = Objects.requireNonNull(id);
        Family family = familyRepository.findById(safeId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (family.isDeleted()) {
            throw new RuntimeException("Family not found");
        }
        return family;
    }

    @GetMapping("/{id}/persons")
    public List<Person> persons(@PathVariable Long id) {
        Long safeId = Objects.requireNonNull(id);
        Family family = familyRepository.findById(safeId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (family.isDeleted()) {
            throw new RuntimeException("Family not found");
        }
        return personRepository.findByFamilyIdAndDeletedFalse(Objects.requireNonNull(safeId));
    }

    /**
     * Returns an existing household member id with the same identity as duplicate-create rules, or null.
     * Used by the family editor before POST /persons to link an existing row instead of failing with 400.
     */
    @PostMapping("/{id}/duplicate-household-member")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public DuplicateHouseholdMemberResponse checkDuplicateHouseholdMember(
            @PathVariable Long id,
            @Valid @RequestBody DuplicateHouseholdMemberCheckRequest request) {
        Long safeId = Objects.requireNonNull(id);
        Family family = familyRepository.findById(safeId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (family.isDeleted()) {
            throw new RuntimeException("Family not found");
        }
        List<Long> skips = request.getSkipPersonIds() == null ? List.of() : request.getSkipPersonIds();
        Long existing = personService.findConflictingDuplicatePersonIdInFamily(
                safeId,
                null,
                skips,
                request.getNameEn(),
                request.getNameNp(),
                request.getGender(),
                request.getDateOfBirth(),
                request.getPhone());
        return new DuplicateHouseholdMemberResponse(existing);
    }

    /**
     * Household members plus anyone linked as child or spouse of someone in that set (for read-only family detail).
     */
    @GetMapping("/{id}/persons-extended")
    public List<Person> personsExtended(@PathVariable Long id) {
        return familyViewService.listPersonsExtendedForDetail(id);
    }

    @PutMapping("/{id}/primary-person")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Family setPrimaryPerson(@PathVariable Long id, @Valid @RequestBody FamilyPrimaryPersonUpdateRequest request) {
        Long safeId = Objects.requireNonNull(id);
        Family family = familyRepository.findById(safeId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (family.isDeleted()) {
            throw new RuntimeException("Family not found");
        }
        family.setPrimaryPersonId(request.getPersonId());
        family.setPrimaryPersonNameEn(request.getPersonNameEn());
        family.setPrimaryPersonNameNp(request.getPersonNameNp());
        return familyRepository.save(family);
    }
}
