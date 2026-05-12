package com.bauwalal.community.service;

import com.bauwalal.community.dto.PersonCreateRequest;
import com.bauwalal.community.dto.PersonUpdateRequest;
import com.bauwalal.community.entity.Person;
import com.bauwalal.community.entity.PersonSpouseLink;
import com.bauwalal.community.enums.Gender;
import com.bauwalal.community.entity.Family;
import com.bauwalal.community.repository.DistrictRepository;
import com.bauwalal.community.repository.FamilyRepository;
import com.bauwalal.community.repository.FinancialTransactionRepository;
import com.bauwalal.community.repository.PersonRepository;
import com.bauwalal.community.repository.PersonRoleMapRepository;
import com.bauwalal.community.repository.PersonSpouseLinkRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PersonService {
    private final PersonRepository personRepository;
    private final FamilyRepository familyRepository;
    private final DistrictRepository districtRepository;
    private final PersonSpouseLinkRepository spouseLinkRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final PersonRoleMapRepository personRoleMapRepository;

    public Person getActiveById(Long id) {
        Person person = personRepository.findById(id).orElseThrow(() -> new RuntimeException("Person not found"));
        if (person.isDeleted()) {
            throw new RuntimeException("Person not found");
        }
        return person;
    }

    public List<Person> listChildrenOf(Long parentId) {
        return personRepository.findActiveChildrenOfParent(parentId);
    }

    public List<Person> listActive() {
        return personRepository.findByDeletedFalse();
    }

    public List<Person> searchActive(String term) {
        if (term == null || term.isBlank()) {
            return listActive();
        }
        return personRepository.searchActive(term.trim());
    }

    /**
     * Structured filters are combined with AND. When all structured params are absent,
     * falls back to legacy {@code q} search (ID or name substring), or full active list.
     */
    public List<Person> search(Long id, String name, LocalDate dateOfBirth, String q) {
        boolean structured = id != null
                || (name != null && !name.isBlank())
                || dateOfBirth != null;
        if (!structured) {
            return searchActive(q);
        }
        Specification<Person> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));
            if (id != null) {
                predicates.add(cb.equal(root.get("id"), id));
            }
            if (name != null && !name.isBlank()) {
                String pattern = "%" + name.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nameEn")), pattern),
                        cb.like(cb.lower(root.get("nameNp")), pattern)
                ));
            }
            if (dateOfBirth != null) {
                predicates.add(cb.equal(root.get("dateOfBirth"), dateOfBirth));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return personRepository.findAll(spec);
    }

    @Transactional
    public Person create(PersonCreateRequest request) {
        assertNoConflictingDuplicateInFamily(
                request.getFamilyId(),
                null,
                request.getNameEn(),
                request.getNameNp(),
                request.getGender(),
                request.getDateOfBirth(),
                request.getPhone());
        Person person = new Person();
        applyDetails(person, request.getFamilyId(), request.getNameEn(), request.getNameNp(), request.getGender(),
                request.getPhone(), request.getWardNo(), request.getToleEn(), request.getToleNp(), request.getMunicipality(),
                request.getVdc(), request.getDistrictId(), request.getDateOfBirth(), request.getFatherId(), request.getMotherId(), request.getSpouseId());
        Person saved = personRepository.save(person);
        saveSpouseLinks(saved, request.getSpouseIds());
        return saved;
    }

    @Transactional
    public Person update(Long personId, PersonUpdateRequest request) {
        Person person = personRepository.findById(personId).orElseThrow(() -> new RuntimeException("Person not found"));
        assertNoConflictingDuplicateInFamily(
                request.getFamilyId(),
                personId,
                request.getNameEn(),
                request.getNameNp(),
                request.getGender(),
                request.getDateOfBirth(),
                request.getPhone());
        applyDetails(person, request.getFamilyId(), request.getNameEn(), request.getNameNp(), request.getGender(),
                request.getPhone(), request.getWardNo(), request.getToleEn(), request.getToleNp(), request.getMunicipality(),
                request.getVdc(), request.getDistrictId(), request.getDateOfBirth(), request.getFatherId(), request.getMotherId(), request.getSpouseId());
        Person saved = personRepository.save(person);
        saveSpouseLinks(saved, request.getSpouseIds());
        return saved;
    }

    @Transactional
    public void softDelete(Long personId) {
        Person person = personRepository.findById(personId).orElseThrow(() -> new RuntimeException("Person not found"));
        person.setDeleted(true);
        personRepository.save(person);
    }

    /**
     * Removes the person row and dependent data from the database (cannot be undone).
     * Clears spouse/father/mother pointers from other people, spouse-link rows, role maps, and transactions for this person.
     */
    @Transactional
    public void permanentlyDeletePerson(Long personId) {
        Person person = personRepository.findById(personId).orElseThrow(() -> new RuntimeException("Person not found"));
        Long pid = person.getId();

        for (Family f : familyRepository.findByPrimaryPersonId(pid)) {
            f.setPrimaryPersonId(null);
            f.setPrimaryPersonNameEn(null);
            f.setPrimaryPersonNameNp(null);
            familyRepository.save(f);
        }

        spouseLinkRepository.deleteAllLinksTouchingPerson(pid);
        personRepository.clearSpouseReferencesTo(pid);
        personRepository.clearFatherReferencesTo(pid);
        personRepository.clearMotherReferencesTo(pid);
        financialTransactionRepository.deleteAllForPerson(pid);
        personRoleMapRepository.deleteAllForPerson(pid);
        personRepository.flush();
        personRepository.deleteById(pid);
    }

    /**
     * Returns an existing active household member id with the same identity as duplicate rules, or null.
     * {@code excludePersonId} skips that person (e.g. the row being updated). {@code skipPersonIds} skips additional
     * people (used by the UI before create to avoid linking a new child row to the wrong household member).
     */
    public Long findConflictingDuplicatePersonIdInFamily(
            Long familyId,
            Long excludePersonId,
            List<Long> skipPersonIds,
            String nameEn,
            String nameNp,
            Gender gender,
            LocalDate dateOfBirth,
            String phone) {
        if (familyId == null || gender == null) {
            return null;
        }
        String ne = normalizeNameEn(nameEn);
        String nn = normalizeNameNp(nameNp);
        if (ne.isEmpty() && nn.isEmpty()) {
            return null;
        }
        String phoneN = normalizePhone(phone);
        Set<Long> skip = new HashSet<>();
        if (skipPersonIds != null) {
            for (Long s : skipPersonIds) {
                if (s != null) {
                    skip.add(s);
                }
            }
        }
        List<Person> members = personRepository.findByFamilyIdAndDeletedFalse(familyId);
        for (Person p : members) {
            if (excludePersonId != null && excludePersonId.equals(p.getId())) {
                continue;
            }
            if (skip.contains(p.getId())) {
                continue;
            }
            if (!Objects.equals(p.getGender(), gender)) {
                continue;
            }
            if (!normalizeNameEn(p.getNameEn()).equals(ne)) {
                continue;
            }
            if (!normalizeNameNp(p.getNameNp()).equals(nn)) {
                continue;
            }
            boolean dobMatch = Objects.equals(p.getDateOfBirth(), dateOfBirth);
            if (dobMatch) {
                return p.getId();
            }
            if (dateOfBirth == null && p.getDateOfBirth() == null) {
                String pPhone = normalizePhone(p.getPhone());
                if (!phoneN.isEmpty() && phoneN.equals(pPhone)) {
                    return p.getId();
                }
            }
        }
        return null;
    }

    /**
     * Blocks a second household member whose identity matches an existing active member (same names, gender, and DOB;
     * if both lack DOB, same non-blank phone is also treated as a duplicate).
     */
    private void assertNoConflictingDuplicateInFamily(
            Long familyId,
            Long excludePersonId,
            String nameEn,
            String nameNp,
            Gender gender,
            LocalDate dateOfBirth,
            String phone) {
        Long dup = findConflictingDuplicatePersonIdInFamily(
                familyId, excludePersonId, null, nameEn, nameNp, gender, dateOfBirth, phone);
        if (dup != null) {
            throw duplicateHouseholdMemberException(dup);
        }
    }

    private static RuntimeException duplicateHouseholdMemberException(Long existingId) {
        return new RuntimeException(
                "This household already has a member with the same English name, Nepali name, gender, and date of birth "
                        + "(or the same phone when both records have no birth date). Existing person ID: "
                        + existingId
                        + ". Remove or merge the duplicate, or link the existing person instead of creating another.");
    }

    private static String normalizeNameEn(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    private static String normalizeNameNp(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().replaceAll("\\s+", " ");
    }

    private static String normalizePhone(String p) {
        if (p == null) {
            return "";
        }
        return p.replaceAll("\\s+", "").trim();
    }

    private void applyDetails(Person person, Long familyId, String nameEn, String nameNp, com.bauwalal.community.enums.Gender gender,
                              String phone, Integer wardNo, String toleEn, String toleNp, String municipality, String vdc,
                              Long districtId, java.time.LocalDate dateOfBirth, Long fatherId, Long motherId, Long spouseId) {
        person.setFamily(familyRepository.findById(familyId).orElseThrow(() -> new RuntimeException("Family not found")));
        person.setNameEn(nameEn);
        person.setNameNp(nameNp);
        person.setGender(gender);
        person.setDateOfBirth(dateOfBirth);
        person.setPhone(phone);
        person.setWardNo(wardNo);
        person.setToleEn(toleEn);
        person.setToleNp(toleNp);
        person.setMunicipality(municipality);
        person.setVdc(vdc);

        person.setDistrict(null);
        if (districtId != null) {
            person.setDistrict(districtRepository.findById(districtId).orElseThrow(() -> new RuntimeException("District not found")));
        }
        person.setFather(fatherId == null ? null : personRepository.findById(fatherId).orElseThrow(() -> new RuntimeException("Father not found")));
        person.setMother(motherId == null ? null : personRepository.findById(motherId).orElseThrow(() -> new RuntimeException("Mother not found")));
        person.setSpouse(spouseId == null ? null : personRepository.findById(spouseId).orElseThrow(() -> new RuntimeException("Spouse not found")));
    }

    private void saveSpouseLinks(Person person, List<Long> spouseIds) {
        spouseLinkRepository.deleteByPersonId(person.getId());
        if (spouseIds == null || spouseIds.isEmpty()) {
            return;
        }
        for (Long spouseId : spouseIds) {
            if (spouseId == null || spouseId.equals(person.getId())) {
                continue;
            }
            Person spouse = personRepository.findById(spouseId).orElseThrow(() -> new RuntimeException("Spouse not found"));
            PersonSpouseLink link = new PersonSpouseLink();
            link.setPerson(person);
            link.setSpouse(spouse);
            spouseLinkRepository.save(link);
        }
    }
}
