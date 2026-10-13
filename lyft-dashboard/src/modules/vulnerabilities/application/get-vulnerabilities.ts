import type { VulnerabilityRepository } from "../domain/vulnerability";

export function createGetVulnerabilities(
  repository: VulnerabilityRepository,
) {
  return async () => {
    const items = await repository.list();

    return [...items].sort((a, b) =>
      b.detectedAt.localeCompare(a.detectedAt),
    );
  };
}