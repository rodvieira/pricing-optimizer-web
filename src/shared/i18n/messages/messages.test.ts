import { describe, expect, it } from "vitest";
import en from "./en.json";
import ptBr from "./pt-BR.json";

/** Flattens a nested message object into dotted leaf-key paths. */
function leafKeys(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node).flatMap(([key, value]) =>
    leafKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("locale message catalogs", () => {
  it("have identical key sets — no key present in one catalog and missing from the other", () => {
    const enKeys = new Set(leafKeys(en));
    const ptKeys = new Set(leafKeys(ptBr));

    const missingFromPt = [...enKeys].filter((key) => !ptKeys.has(key));
    const missingFromEn = [...ptKeys].filter((key) => !enKeys.has(key));

    expect(missingFromPt, "keys in en.json but missing from pt-BR.json").toEqual([]);
    expect(missingFromEn, "keys in pt-BR.json but missing from en.json").toEqual([]);
  });

  it("have no empty string values in either catalog", () => {
    for (const [name, catalog] of [
      ["en", en],
      ["pt-BR", ptBr],
    ] as const) {
      const empty = leafKeys(catalog).filter((key) => {
        const value = key.split(".").reduce<unknown>((obj, part) => (obj as never)[part], catalog);
        return value === "";
      });
      expect(empty, `empty-string values in ${name}.json`).toEqual([]);
    }
  });
});
