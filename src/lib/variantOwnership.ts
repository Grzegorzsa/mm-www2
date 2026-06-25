type VariantRecord = {
  id?: number | null
  uid?: string | null
  name?: string | null
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

export function expandOwnedVariantIds(
  directOwnedVariantIds: Set<number>,
  variants: VariantRecord[],
): Set<number> {
  const expandedOwnedVariantIds = new Set(directOwnedVariantIds)

  const loopsProVariant = variants.find(isLoopsProVariant)
  const beatsVariant = variants.find(isBeatsVariant)
  const composerVariant = variants.find(isComposerVariant)

  if (composerVariant?.id && beatsVariant?.id && directOwnedVariantIds.has(composerVariant.id)) {
    expandedOwnedVariantIds.add(beatsVariant.id)
  }

  if (composerVariant?.id && loopsProVariant?.id && directOwnedVariantIds.has(composerVariant.id)) {
    expandedOwnedVariantIds.add(loopsProVariant.id)
  }

  if (loopsProVariant?.id && beatsVariant?.id && directOwnedVariantIds.has(beatsVariant.id)) {
    expandedOwnedVariantIds.add(loopsProVariant.id)
  }

  return expandedOwnedVariantIds
}
