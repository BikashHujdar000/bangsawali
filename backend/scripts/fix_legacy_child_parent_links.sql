-- One-time repair: children whose "mother" was wrongly set to the household head's own mother (grandmother),
-- when the child's father is the head and the head has a spouse. Run against your app database when ready.
--
-- psql:  \i backend/scripts/fix_legacy_child_parent_links.sql
-- Or paste into your SQL client.

BEGIN;

-- Male head: child has father = head but mother = head's mother → set mother to head's spouse (person id).
UPDATE persons AS child
SET mother_id = head.spouse_id
FROM persons AS head
INNER JOIN families AS fam ON fam.primary_person_id = head.id
WHERE child.family_id = fam.id
  AND child.father_id = head.id
  AND child.mother_id IS NOT DISTINCT FROM head.mother_id
  AND head.mother_id IS NOT NULL
  AND head.spouse_id IS NOT NULL
  AND child.id <> head.id
  AND child.deleted = false
  AND head.deleted = false;

-- Female head: child has mother = head but father = head's father → set father to head's spouse (person id).
UPDATE persons AS child
SET father_id = head.spouse_id
FROM persons AS head
INNER JOIN families AS fam ON fam.primary_person_id = head.id
WHERE child.family_id = fam.id
  AND child.mother_id = head.id
  AND child.father_id IS NOT DISTINCT FROM head.father_id
  AND head.father_id IS NOT NULL
  AND head.spouse_id IS NOT NULL
  AND child.id <> head.id
  AND child.deleted = false
  AND head.deleted = false;

COMMIT;
