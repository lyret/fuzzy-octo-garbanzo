import { z } from "zod";
import { DateTime } from "luxon";
import Yaml from "yaml";

/** Extended validation methods */
const ze = {
  yaml: <T extends z.ZodRawShape>(shape: T) =>
    z
      .string()
      .transform<z.ZodTypeAny>((val, ctx) => {
        try {
          return Yaml.parse(val);
        } catch (err: any) {
          ctx.addIssue({
            path: [],
            message: `${err.message}`,
            code: z.ZodIssueCode.custom,
            params:
              err.linePos && err.linePos.length
                ? {
                    line: err.linePos[0].line,
                    col: err.linePos[0].col,
                  }
                : undefined,
          });
          return z.NEVER;
        }
      })
      .pipe(z.object<T>(shape)),
  /** Matches a string in the datetime format of yyyy-MM-dd */
  datestring: () =>
    z
      .string()
      .transform((val) => {
        return DateTime.fromFormat(val, "yyyy-MM-dd");
      })
      .refine((val) => {
        return val.isValid;
      }, "Received an invalid date"),
};

const input = `faktura:
  betald: false
  nr: F2023-5
  faktureringsdatum: 2023-10-04
  leveransdatum: Oktober 2023
  dagarattbetala: 30
  projekt: Uppdatering och moderningsering av Personalboken
  referens: David Jensen
  adress1: H5 Förnyelsebyrå AB
  adress2: Box 8000
  adress3: 501 18 Borås
  adress4:
fluff:
  halkort: Säg upp er allihopa
rader:
  - beskrivning: Modernisering av Webb App arkitektur och kod
    antal: 8
    enhet: h
    kostnad: 1100
  - beskrivning: Enskilt arbete med refaktorering och felfixar enl. avstämning
    antal: 22
    enhet: h
    kostnad: 1100
`;

const Invoice = ze.yaml({
  faktura: z.object({
    betald: z.boolean().default(false),
    nr: z.string(),
    faktureringsdatum: ze.datestring(),
    leveransdatum: z.string(),
    dagarattbetala: z.number().min(1),
    projekt: z.string(),
    referens: z.string(),
    adress1: z.string(),
    adress2: z.string().nullable(),
    adress3: z.string().nullable(),
    adress4: z.string().nullable(),
  }),
  fluff: z.object({
    halkort: z.string(),
  }),
  rader: z
    .object({
      beskrivning: z.string(),
      antal: z.number().min(1),
      enhet: z.string(),
      kostnad: z.number(),
    })
    .array(),
});

const res = Invoice.safeParse(input);

if (!res.success) {
  console.log(res.error.formErrors);
  console.log(res.error.issues);
} else {
  console.log(res);
}
