import * as ts from "../../_namespaces/ts";

describe("unittests:: tsbuild:: when containerOnly project is referenced", () => {
    ts.verifyTscWithEdits({
        scenario: "containerOnlyReferenced",
        subScenario: "verify that subsequent builds after initial build doesnt build anything",
        fs: () => ts.loadProjectFromDisk("tests/projects/containerOnlyReferenced"),
        commandLineArgs: ["--b", "/src", "--verbose"],
        edits: ts.noChangeOnlyRuns
    });

    ts.verifyTscWithEdits({
        scenario: "containerOnlyReferenced",
        subScenario: "when solution is referenced indirectly",
        fs: () => ts.loadProjectFromFiles({
            "/src/project1/tsconfig.json": JSON.stringify({
                compilerOptions: { composite: true },
                references: [],
            }),
            "/src/project2/tsconfig.json": JSON.stringify({
                compilerOptions: { composite: true },
                references: [],
            }),
            "/src/project2/src/b.ts": "export const b = 10;",
            "/src/project3/tsconfig.json": JSON.stringify({
                compilerOptions: { composite: true },
                references: [{ path: "../project1", }, { path: "../project2" }],
            }),
            "/src/project3/src/c.ts": "export const c = 10;",
            "/src/project4/tsconfig.json": JSON.stringify({
                compilerOptions: { composite: true },
                references: [{ path: "../project3" }]
            }),
            "/src/project4/src/d.ts": "export const d = 10;",
        }),
        commandLineArgs: ["--b", "/src/project4", "--verbose", "--explainFiles"],
        edits: [{
            subScenario: "modify project3 file",
            modifyFs: fs => ts.replaceText(fs, "/src/project3/src/c.ts", "c = ", "cc = "),
        }],
    });
});
