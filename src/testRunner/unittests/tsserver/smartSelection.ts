import * as ts from "../../_namespaces/ts";

function setup(fileName: string, content: string) {
    const file: ts.projectSystem.File = { path: fileName, content };
    const host = ts.projectSystem.createServerHost([file, ts.projectSystem.libFile]);
    const session = ts.projectSystem.createSession(host);
    ts.projectSystem.openFilesForSession([file], session);
    return function getSmartSelectionRange(locations: ts.projectSystem.protocol.SelectionRangeRequestArgs["locations"]) {
        return ts.projectSystem.executeSessionRequest<ts.projectSystem.protocol.SelectionRangeRequest, ts.projectSystem.protocol.SelectionRangeResponse>(
            session,
            ts.projectSystem.CommandNames.SelectionRange,
            { file: fileName, locations });
    };
}

// More tests in fourslash/smartSelection_*
describe("unittests:: tsserver:: smartSelection", () => {
    it("works for simple JavaScript", () => {
        const getSmartSelectionRange = setup("/file.js", `
class Foo {
    bar(a, b) {
        if (a === b) {
            return true;
        }
        return false;
    }
}`);

        const locations = getSmartSelectionRange([
            { line: 4, offset: 13 }, // a === b
        ]);

        assert.deepEqual(locations, [{
            textSpan: { // a
                start: { line: 4, offset: 13 },
                end: { line: 4, offset: 14 } },
            parent: {
                textSpan: { // a === b
                    start: { line: 4, offset: 13 },
                    end: { line: 4, offset: 20 } },
                parent: {
                    textSpan: { // IfStatement
                        start: { line: 4, offset: 9 },
                        end: { line: 6, offset: 10 } },
                    parent: {
                        textSpan: { // SyntaxList + whitespace (body of method)
                            start: { line: 3, offset: 16 },
                            end: { line: 8, offset: 5 }
                        },
                        parent: {
                            textSpan: { // {}
                                start: { line: 3, offset: 15 },
                                end: { line: 8, offset: 6 } },
                            parent: {
                                textSpan: { // MethodDeclaration
                                    start: { line: 3, offset: 5 },
                                    end: { line: 8, offset: 6 } },
                                parent: {
                                    textSpan: { // SyntaxList + whitespace (body of class)
                                        start: { line: 2, offset: 12 },
                                        end: { line: 9, offset: 1 } },
                                    parent: {
                                        textSpan: { // ClassDeclaration
                                            start: { line: 2, offset: 1 },
                                            end: { line: 9, offset: 2 } },
                                        parent: {
                                            textSpan: { // SourceFile (all text)
                                                start: { line: 1, offset: 1 },
                                                end: { line: 9, offset: 2 } } } } } } } } } } }]);
    });
});
