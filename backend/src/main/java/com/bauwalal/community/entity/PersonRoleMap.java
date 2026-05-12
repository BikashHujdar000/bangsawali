package com.bauwalal.community.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "person_role_map")
@Getter
@Setter
public class PersonRoleMap extends BaseEntity {
    @ManyToOne(optional = false)
    private Person person;

    @ManyToOne(optional = false)
    private PersonRole role;

    @ManyToOne(optional = false)
    private District district;
}
