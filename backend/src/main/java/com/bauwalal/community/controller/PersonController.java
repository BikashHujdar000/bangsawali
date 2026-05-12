package com.bauwalal.community.controller;

import com.bauwalal.community.dto.PersonCreateRequest;
import com.bauwalal.community.dto.PersonUpdateRequest;
import com.bauwalal.community.entity.Person;
import com.bauwalal.community.service.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.format.annotation.DateTimeFormat.ISO;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
public class PersonController {
    private final PersonService personService;

    @GetMapping("/{id}/children")
    public List<Person> listChildren(@PathVariable Long id) {
        return personService.listChildrenOf(id);
    }

    @GetMapping("/{id}")
    public Person get(@PathVariable Long id) {
        return personService.getActiveById(id);
    }

    @GetMapping
    public List<Person> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate dateOfBirth
    ) {
        return personService.search(id, name, dateOfBirth, q);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Person create(@RequestBody PersonCreateRequest request) {
        return personService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Person update(@PathVariable Long id, @RequestBody PersonUpdateRequest request) {
        return personService.update(id, request);
    }

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> permanentlyDelete(@PathVariable Long id) {
        personService.permanentlyDeletePerson(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> softDelete(@PathVariable Long id) {
        personService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
