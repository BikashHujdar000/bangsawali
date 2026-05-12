package com.bauwalal.community.service;

import com.bauwalal.community.entity.Family;
import com.bauwalal.community.entity.Person;
import com.bauwalal.community.repository.FamilyRepository;
import com.bauwalal.community.repository.PersonRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Creates a new {@link Family} and moves a person (plus spouse and children in the same household) onto it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FamilyBranchingService {
    private final FamilyRepository familyRepository;
    private final PersonRepository personRepository;

    @Transactional
    public Family createNewHouseholdFromPerson(Long personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Person not found"));
        if (person.isDeleted()) {
            throw new RuntimeException("Person not found");
        }
        Family oldFamily = person.getFamily();
        if (oldFamily == null) {
            throw new RuntimeException("Person has no household");
        }
        if (oldFamily.getPrimaryPersonId() != null && oldFamily.getPrimaryPersonId().equals(person.getId())) {
            log.info("Person {} already primary of household {}; skip new branch.", person.getId(), oldFamily.getId());
            return oldFamily;
        }
        Long oldFamilyId = oldFamily.getId();

        String en = person.getNameEn() != null && !person.getNameEn().isBlank() ? person.getNameEn().trim() : "Household";
        String np = person.getNameNp() != null && !person.getNameNp().isBlank() ? person.getNameNp().trim() : en;

        Family newFamily = new Family();
        newFamily.setFamilyNameEn(en);
        newFamily.setFamilyNameNp(np);
        newFamily.setDescription("New household from person #" + person.getId() + " (previously family #" + oldFamilyId + ")");
        newFamily.setPrimaryPersonId(person.getId());
        newFamily.setPrimaryPersonNameEn(person.getNameEn());
        newFamily.setPrimaryPersonNameNp(person.getNameNp());
        newFamily = familyRepository.save(newFamily);

        Set<Long> toMove = new HashSet<>();
        toMove.add(person.getId());

        Person spouse = person.getSpouse();
        if (spouse != null && !spouse.isDeleted() && spouse.getFamily() != null
                && spouse.getFamily().getId().equals(oldFamilyId)) {
            toMove.add(spouse.getId());
        }

        List<Person> members = personRepository.findByFamilyIdAndDeletedFalse(oldFamilyId);
        for (Person m : members) {
            if (toMove.contains(m.getId())) {
                continue;
            }
            Person f = m.getFather();
            Person mo = m.getMother();
            boolean childOfSubject = (f != null && f.getId().equals(person.getId()))
                    || (mo != null && mo.getId().equals(person.getId()));
            if (childOfSubject) {
                toMove.add(m.getId());
            }
        }

        for (Long pid : toMove) {
            Person p = personRepository.findById(pid).orElseThrow(() -> new RuntimeException("Person not found"));
            p.setFamily(newFamily);
            personRepository.save(p);
        }

        if (oldFamily.getPrimaryPersonId() != null && toMove.contains(oldFamily.getPrimaryPersonId())) {
            List<Person> remaining = personRepository.findByFamilyIdAndDeletedFalse(oldFamilyId);
            if (remaining.isEmpty()) {
                oldFamily.setPrimaryPersonId(null);
                oldFamily.setPrimaryPersonNameEn(null);
                oldFamily.setPrimaryPersonNameNp(null);
            } else {
                Person next = remaining.get(0);
                oldFamily.setPrimaryPersonId(next.getId());
                oldFamily.setPrimaryPersonNameEn(next.getNameEn());
                oldFamily.setPrimaryPersonNameNp(next.getNameNp());
            }
            familyRepository.save(oldFamily);
        }

        log.info(
                "New household id={} primaryPersonId={} created from personId={}; moved {} people from family id={}",
                newFamily.getId(),
                person.getId(),
                person.getId(),
                toMove.size(),
                oldFamilyId
        );
        return newFamily;
    }
}
