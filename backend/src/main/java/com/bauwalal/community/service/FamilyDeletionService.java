package com.bauwalal.community.service;

import com.bauwalal.community.entity.Family;
import com.bauwalal.community.entity.Person;
import com.bauwalal.community.repository.FamilyRepository;
import com.bauwalal.community.repository.PersonRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FamilyDeletionService {
    private final FamilyRepository familyRepository;
    private final PersonRepository personRepository;
    private final PersonService personService;

    @Transactional
    public void softDeleteFamily(Long familyId) {
        Family family = familyRepository.findById(familyId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (family.isDeleted()) {
            return;
        }
        List<Person> members = personRepository.findByFamilyIdAndDeletedFalse(familyId);
        for (Person p : members) {
            personService.softDelete(p.getId());
        }
        family.setDeleted(true);
        familyRepository.save(family);
    }

    /**
     * Restores a previously soft-deleted family.
     * SUPER_ADMIN only: set `family.deleted=false` and all household members `person.deleted=false`.
     */
    @Transactional
    public void restoreFamily(Long familyId) {
        Family family = familyRepository.findById(familyId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (!family.isDeleted()) {
            return;
        }
        List<Person> members = personRepository.findByFamilyId(familyId);
        for (Person p : members) {
            p.setDeleted(false);
            personRepository.save(p);
        }
        family.setDeleted(false);
        familyRepository.save(family);
    }

    /**
     * Hard-deletes the family row and every person in that household from the database (cannot be undone).
     */
    @Transactional
    public void permanentlyDeleteFamily(Long familyId) {
        Family family = familyRepository.findById(familyId).orElseThrow(() -> new RuntimeException("Family not found"));
        List<Person> members = new ArrayList<>(personRepository.findByFamilyId(familyId));
        family.setPrimaryPersonId(null);
        family.setPrimaryPersonNameEn(null);
        family.setPrimaryPersonNameNp(null);
        familyRepository.save(family);
        for (Person p : members) {
            personService.permanentlyDeletePerson(p.getId());
        }
        familyRepository.deleteById(familyId);
    }
}
