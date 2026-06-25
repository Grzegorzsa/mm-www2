type VariantRecord = {
  id?: number | null
  uid?: string | null
  name?: string | null
  hierarchy?: number | null
}

function matchesVariant(variant: VariantRecord, keyword: string) {
  const uid = String(variant.uid ?? '').toLowerCase()
  const name = String(variant.name ?? '').toLowerCase()

  return uid.includes(keyword) || name.includes(keyword)
}

function isLoopsProVariant(variant: VariantRecord) {
  const uid = String(variant.uid ?? '').toLowerCase()
  const name = String(variant.name ?? '').toLowerCase()

  return (
    matchesVariant(variant, 'loops') &&
    !uid.includes('elements') &&
    !uid.includes('player') &&
    !name.includes('elements')
  )
}

function isBeatsVariant(variant: VariantRecord) {
  return matchesVariant(variant, 'beats')
}

function isComposerVariant(variant: VariantRecord) {
  return matchesVariant(variant, 'composer')
}

function isElementsVariant(variant: VariantRecord) {
  return matchesVariant(variant, 'elements')
}

function isPlayerVariant(variant: VariantRecord) {
  return matchesVariant(variant, 'player')
}

export function getVariantHierarchy(variant: VariantRecord): number | null {
  if (typeof variant.hierarchy === 'number' && Number.isFinite(variant.hierarchy)) {
    return variant.hierarchy
  }

  if (isElementsVariant(variant)) return 1
  if (isPlayerVariant(variant)) return 2
  if (isLoopsProVariant(variant)) return 3
  if (isBeatsVariant(variant)) return 4
  if (isComposerVariant(variant)) return 5

  return null
}

export function getMaxOwnedHierarchy(
  directOwnedVariantIds: Set<number>,
  variants: VariantRecord[],
): number | null {
  let maxHierarchy: number | null = null

  for (const variant of variants) {
    if (!variant.id || !directOwnedVariantIds.has(variant.id)) continue

    const hierarchy = getVariantHierarchy(variant)
    if (!hierarchy) continue

    if (maxHierarchy === null || hierarchy > maxHierarchy) {
      maxHierarchy = hierarchy
    }
  }

  return maxHierarchy
}

export function expandOwnedVariantIds(
  directOwnedVariantIds: Set<number>,
  variants: VariantRecord[],
): Set<number> {
  const expandedOwnedVariantIds = new Set(directOwnedVariantIds)
  const maxOwnedHierarchy = getMaxOwnedHierarchy(directOwnedVariantIds, variants)

  if (maxOwnedHierarchy === null) return expandedOwnedVariantIds

  for (const variant of variants) {
    if (!variant.id) continue
    const hierarchy = getVariantHierarchy(variant)
    if (hierarchy && hierarchy <= maxOwnedHierarchy) {
      expandedOwnedVariantIds.add(variant.id)
    }
  }

  return expandedOwnedVariantIds
}
