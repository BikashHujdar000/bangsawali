package com.bauwalal.community.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "person_spouse_links")
@Getter
@Setter
public class PersonSpouseLink extends BaseEntity {
    @ManyToOne(optional = false)
    @JoinColumn(name = "person_id")
    private Person person;

    @ManyToOne(optional = false)
    @JoinColumn(name = "spouse_id")
    private Person spouse;
}
