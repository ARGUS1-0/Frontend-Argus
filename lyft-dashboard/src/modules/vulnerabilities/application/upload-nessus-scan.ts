import type { VulnerabilityRepository } from "../domain/vulnerability";

/** Mismo límite que quarkus.http.limits.max-body-size del backend. */
export const MAX_SCAN_BYTES = 50 * 1024 * 1024;

/** Exports de Nessus que entiende el backend: CSV y XML (.nessus es XML v2). */
export const NESSUS_FILE_EXTENSIONS = [".csv", ".xml", ".nessus"] as const;

/** Valor del atributo accept del input de archivo. */
export const NESSUS_FILE_ACCEPT = [
  ...NESSUS_FILE_EXTENSIONS,
  "text/csv",
  "text/xml",
  "application/xml",
].join(",");

export function validateNessusFile(
  file: Pick<File, "name" | "size">,
): string | null {
  const name = file.name.toLowerCase();

  if (!NESSUS_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Selecciona el CSV o el XML (.nessus) exportado de Nessus.";
  }

  if (file.size === 0) {
    return "El archivo está vacío.";
  }

  if (file.size > MAX_SCAN_BYTES) {
    return "El archivo supera el límite de 50 MB.";
  }

  return null;
}

export function createUploadNessusScan(
  repository: VulnerabilityRepository,
) {
  return async (file: File) => {
    const error = validateNessusFile(file);

    if (error) {
      throw new Error(error);
    }

    return repository.uploadNessusScan(file);
  };
}
