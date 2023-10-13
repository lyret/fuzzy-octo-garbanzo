import React from "react";
import { z } from "zod";
import { render, Transform, Box, Text, measureElement, useInput } from "ink";
import Yaml from "yaml";
import { Editor } from "./source/components/editor.js";

// const one = `
// str1: >
//  this is a multi-line string it
//  spans more than one
//  line
// lol: ~
// str2: |
//  this is a multi-line string it
//  spans more than one
//  line
// str3:
//  this is a multi-line string it
//  spans more than one
//  line`;
// const oneObj = Yaml.parse(one);
// const oneToStr = Yaml.stringify(oneObj);
// console.log("ONE");
// console.log(oneObj);
// console.log("TWO");
// console.log(oneToStr);
//process.exit(0);

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

async function main<S extends z.ZodTypeAny, V extends z.infer<S>>(
  schema: S,
  value: V,
  options: {
    useFullscreen: boolean;
  }
) {
  // If fullscreen is enabled, render to application
  // to an alternative stdout screen, and restore
  // the screen when the application exits
  if (options.useFullscreen) {
    const enterAltScreenCommand = "\x1b[?1049h";
    const leaveAltScreenCommand = "\x1b[?1049l";
    process.stdout.write(enterAltScreenCommand);
    process.on("exit", (code) => {
      process.stdout.write(String(code));
      if (!code) {
        //process.stdout.write(leaveAltScreenCommand);
      }
    });
  }

  render(
    <Editor
      schema={schema}
      value={value}
      useFullscreen={options.useFullscreen}
    />
  );
}

const testSchema1 = z
  .string()
  .min(3)
  .max(5)
  .describe("A test value")
  .default("test");

const testSchema2 = z.object({
  bool: z.boolean().default(false),
  test: z.string().min(3).max(5).describe("A test value").default("test"),
  lol: z.string().min(3).max(5).default("lol"),
  number: z.number().min(0).max(50).default(5),
  subdocument: z.object({
    title: z.string(),
    sublist: z.array(z.string().describe("a desc").default("mu")),
  }),
  list: z.array(
    z.object({
      hostname: z.string(),
      port: z.number(),
    })
  ),
});

main(
  testSchema2,
  {
    bool: true,
    lol: "A really long text without breaks, A really long text without breaks , A really long text without breaks , A really long text without breaks ",
    number: 3,
    test: "A value",
    subdocument: {
      title: "A really long text\nA really long text, with breaks",
      sublist: ["lol", "A really long text\nA really long text, with breaks"],
    },
    list: [
      { hostname: "lol", port: 1337 },
      { hostname: "bajs", port: 3000 },
    ],
  },
  { useFullscreen: true }
);
//
// main(
//   testSchema1,
//   "A really long text without breaks, A really long text without breaks , A really long text without breaks , A really long text without breaks",
//   { useFullscreen: true }
// );
