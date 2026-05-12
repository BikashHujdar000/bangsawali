package com.bauwalal.community.dto;

/**
 * Result of duplicate-household-member check; {@code existingPersonId} is null when no match.
 */
public record DuplicateHouseholdMemberResponse(Long existingPersonId) {}
