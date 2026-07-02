export function getGlobalEtapas(plantillas, excludeId) {
  return plantillas
    .filter(p => p.esGlobal && p.id !== excludeId && p.status === 'activa' && p.etapasData?.length)
    .sort((a, b) => (a.ordenGlobal ?? 0) - (b.ordenGlobal ?? 0))
    .flatMap(p => p.etapasData.map(e => ({
      ...JSON.parse(JSON.stringify(e)),
      locked: true,
      sourceRouteName: p.name,
    })))
}
