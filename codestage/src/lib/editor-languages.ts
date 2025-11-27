import type { editor, languages } from "monaco-editor"
import type { Monaco } from "@monaco-editor/react"
import type { ReactNode } from "react"
import { DiJavascript1, DiPython, DiJava } from "react-icons/di"
import { TbBrandCpp } from "react-icons/tb"

export interface LanguageConfig {
  id: string
  icon: ReactNode
  iconColor: string
  defaultCode: string
}

export const languageConfig: Record<string, LanguageConfig> = {
  JavaScript: {
    id: "javascript",
    icon: DiJavascript1({ className: "h-4 w-4" }),
    iconColor: "text-yellow-400",
    defaultCode: `function solution(arr) {
  return arr.flat(Infinity);
}

console.log(solution([1, [2, [3, [4]]]]));
console.log(solution([1, 2, 3]));`,
  },
  Python: {
    id: "python",
    icon: DiPython({ className: "h-4 w-4" }),
    iconColor: "text-sky-400",
    defaultCode: `def solution(arr):
    result = []
    def flatten(items):
        for item in items:
            if isinstance(item, list):
                flatten(item)
            else:
                result.append(item)
    flatten(arr)
    return result

print(solution([1, [2, [3, [4]]]]))
print(solution([1, 2, 3]))`,
  },
  Java: {
    id: "java",
    icon: DiJava({ className: "h-4 w-4" }),
    iconColor: "text-orange-500",
    defaultCode: `import java.util.*;

public class Solution {
    public static List<Integer> flatten(List<Object> arr) {
        List<Integer> result = new ArrayList<>();
        for (Object item : arr) {
            if (item instanceof List) {
                result.addAll(flatten((List<Object>) item));
            } else {
                result.add((Integer) item);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
  },
  "C++": {
    id: "cpp",
    icon: TbBrandCpp({ className: "h-4 w-4" }),
    iconColor: "text-blue-500",
    defaultCode: `#include <iostream>
#include <vector>
#include <variant>

using namespace std;

template<typename T>
void flatten(const vector<variant<T, vector<variant<T, vector<T>>>>>& arr, vector<T>& result) {
    for (const auto& item : arr) {
        if (holds_alternative<T>(item)) {
            result.push_back(get<T>(item));
        }
    }
}

int main() {
    vector<int> arr = {1, 2, 3, 4, 5};
    for (int num : arr) {
        cout << num << " ";
    }
    cout << endl;
    return 0;
}`,
  },
}

const pythonCompletions: languages.CompletionItem[] = [
  { label: "def", kind: 14, insertText: "def ${1:function_name}(${2:params}):\n\t${3:pass}", insertTextRules: 4, detail: "Define a function" },
  { label: "class", kind: 5, insertText: "class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}", insertTextRules: 4, detail: "Define a class" },
  { label: "if", kind: 14, insertText: "if ${1:condition}:\n\t${2:pass}", insertTextRules: 4, detail: "If statement" },
  { label: "elif", kind: 14, insertText: "elif ${1:condition}:\n\t${2:pass}", insertTextRules: 4, detail: "Elif statement" },
  { label: "else", kind: 14, insertText: "else:\n\t${1:pass}", insertTextRules: 4, detail: "Else statement" },
  { label: "for", kind: 14, insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}", insertTextRules: 4, detail: "For loop" },
  { label: "while", kind: 14, insertText: "while ${1:condition}:\n\t${2:pass}", insertTextRules: 4, detail: "While loop" },
  { label: "try", kind: 14, insertText: "try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:pass}", insertTextRules: 4, detail: "Try-except block" },
  { label: "with", kind: 14, insertText: "with ${1:expression} as ${2:var}:\n\t${3:pass}", insertTextRules: 4, detail: "Context manager" },
  { label: "lambda", kind: 14, insertText: "lambda ${1:x}: ${2:x}", insertTextRules: 4, detail: "Lambda function" },
  { label: "import", kind: 14, insertText: "import ${1:module}", insertTextRules: 4, detail: "Import module" },
  { label: "from", kind: 14, insertText: "from ${1:module} import ${2:name}", insertTextRules: 4, detail: "Import from module" },
  { label: "print", kind: 1, insertText: "print(${1})", insertTextRules: 4, detail: "Print to console" },
  { label: "len", kind: 1, insertText: "len(${1})", insertTextRules: 4, detail: "Return length" },
  { label: "range", kind: 1, insertText: "range(${1:stop})", insertTextRules: 4, detail: "Generate range" },
  { label: "list", kind: 5, insertText: "list(${1})", insertTextRules: 4, detail: "Create list" },
  { label: "dict", kind: 5, insertText: "dict(${1})", insertTextRules: 4, detail: "Create dictionary" },
  { label: "set", kind: 5, insertText: "set(${1})", insertTextRules: 4, detail: "Create set" },
  { label: "tuple", kind: 5, insertText: "tuple(${1})", insertTextRules: 4, detail: "Create tuple" },
  { label: "str", kind: 5, insertText: "str(${1})", insertTextRules: 4, detail: "Convert to string" },
  { label: "int", kind: 5, insertText: "int(${1})", insertTextRules: 4, detail: "Convert to integer" },
  { label: "float", kind: 5, insertText: "float(${1})", insertTextRules: 4, detail: "Convert to float" },
  { label: "bool", kind: 5, insertText: "bool(${1})", insertTextRules: 4, detail: "Convert to boolean" },
  { label: "isinstance", kind: 1, insertText: "isinstance(${1:obj}, ${2:type})", insertTextRules: 4, detail: "Check instance type" },
  { label: "enumerate", kind: 1, insertText: "enumerate(${1:iterable})", insertTextRules: 4, detail: "Enumerate iterable" },
  { label: "zip", kind: 1, insertText: "zip(${1:iter1}, ${2:iter2})", insertTextRules: 4, detail: "Zip iterables" },
  { label: "map", kind: 1, insertText: "map(${1:func}, ${2:iterable})", insertTextRules: 4, detail: "Map function" },
  { label: "filter", kind: 1, insertText: "filter(${1:func}, ${2:iterable})", insertTextRules: 4, detail: "Filter iterable" },
  { label: "sorted", kind: 1, insertText: "sorted(${1:iterable})", insertTextRules: 4, detail: "Sort iterable" },
  { label: "reversed", kind: 1, insertText: "reversed(${1:seq})", insertTextRules: 4, detail: "Reverse sequence" },
  { label: "any", kind: 1, insertText: "any(${1:iterable})", insertTextRules: 4, detail: "Check if any true" },
  { label: "all", kind: 1, insertText: "all(${1:iterable})", insertTextRules: 4, detail: "Check if all true" },
  { label: "sum", kind: 1, insertText: "sum(${1:iterable})", insertTextRules: 4, detail: "Sum of iterable" },
  { label: "min", kind: 1, insertText: "min(${1:iterable})", insertTextRules: 4, detail: "Minimum value" },
  { label: "max", kind: 1, insertText: "max(${1:iterable})", insertTextRules: 4, detail: "Maximum value" },
  { label: "abs", kind: 1, insertText: "abs(${1:x})", insertTextRules: 4, detail: "Absolute value" },
  { label: "round", kind: 1, insertText: "round(${1:x})", insertTextRules: 4, detail: "Round number" },
  { label: "input", kind: 1, insertText: "input(${1:prompt})", insertTextRules: 4, detail: "Read input" },
  { label: "open", kind: 1, insertText: "open(${1:file}, ${2:'r'})", insertTextRules: 4, detail: "Open file" },
  { label: "__init__", kind: 0, insertText: "def __init__(self${1:, params}):\n\t${2:pass}", insertTextRules: 4, detail: "Constructor method" },
  { label: "__str__", kind: 0, insertText: "def __str__(self):\n\treturn ${1:''}", insertTextRules: 4, detail: "String representation" },
  { label: "@property", kind: 14, insertText: "@property\ndef ${1:name}(self):\n\treturn self._${1:name}", insertTextRules: 4, detail: "Property decorator" },
  { label: "@staticmethod", kind: 14, insertText: "@staticmethod\ndef ${1:name}(${2:params}):\n\t${3:pass}", insertTextRules: 4, detail: "Static method" },
  { label: "@classmethod", kind: 14, insertText: "@classmethod\ndef ${1:name}(cls${2:, params}):\n\t${3:pass}", insertTextRules: 4, detail: "Class method" },
  { label: "self", kind: 14, insertText: "self", detail: "Instance reference" },
  { label: "None", kind: 14, insertText: "None", detail: "None value" },
  { label: "True", kind: 14, insertText: "True", detail: "Boolean True" },
  { label: "False", kind: 14, insertText: "False", detail: "Boolean False" },
  { label: "return", kind: 14, insertText: "return ${1}", insertTextRules: 4, detail: "Return statement" },
  { label: "yield", kind: 14, insertText: "yield ${1}", insertTextRules: 4, detail: "Yield value" },
  { label: "raise", kind: 14, insertText: "raise ${1:Exception}(${2})", insertTextRules: 4, detail: "Raise exception" },
  { label: "assert", kind: 14, insertText: "assert ${1:condition}", insertTextRules: 4, detail: "Assert statement" },
  { label: "pass", kind: 14, insertText: "pass", detail: "Pass statement" },
  { label: "break", kind: 14, insertText: "break", detail: "Break loop" },
  { label: "continue", kind: 14, insertText: "continue", detail: "Continue loop" },
  { label: "async def", kind: 14, insertText: "async def ${1:function_name}(${2:params}):\n\t${3:pass}", insertTextRules: 4, detail: "Async function" },
  { label: "await", kind: 14, insertText: "await ${1}", insertTextRules: 4, detail: "Await expression" },
] as languages.CompletionItem[]

const javaCompletions: languages.CompletionItem[] = [
  { label: "public class", kind: 5, insertText: "public class ${1:ClassName} {\n\t${2}\n}", insertTextRules: 4, detail: "Public class" },
  { label: "public static void main", kind: 0, insertText: "public static void main(String[] args) {\n\t${1}\n}", insertTextRules: 4, detail: "Main method" },
  { label: "public", kind: 14, insertText: "public ", detail: "Public modifier" },
  { label: "private", kind: 14, insertText: "private ", detail: "Private modifier" },
  { label: "protected", kind: 14, insertText: "protected ", detail: "Protected modifier" },
  { label: "static", kind: 14, insertText: "static ", detail: "Static modifier" },
  { label: "final", kind: 14, insertText: "final ", detail: "Final modifier" },
  { label: "abstract", kind: 14, insertText: "abstract ", detail: "Abstract modifier" },
  { label: "void", kind: 14, insertText: "void", detail: "Void return type" },
  { label: "int", kind: 14, insertText: "int", detail: "Integer type" },
  { label: "String", kind: 5, insertText: "String", detail: "String type" },
  { label: "boolean", kind: 14, insertText: "boolean", detail: "Boolean type" },
  { label: "double", kind: 14, insertText: "double", detail: "Double type" },
  { label: "float", kind: 14, insertText: "float", detail: "Float type" },
  { label: "long", kind: 14, insertText: "long", detail: "Long type" },
  { label: "char", kind: 14, insertText: "char", detail: "Character type" },
  { label: "if", kind: 14, insertText: "if (${1:condition}) {\n\t${2}\n}", insertTextRules: 4, detail: "If statement" },
  { label: "else if", kind: 14, insertText: "else if (${1:condition}) {\n\t${2}\n}", insertTextRules: 4, detail: "Else if statement" },
  { label: "else", kind: 14, insertText: "else {\n\t${1}\n}", insertTextRules: 4, detail: "Else statement" },
  { label: "for", kind: 14, insertText: "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}", insertTextRules: 4, detail: "For loop" },
  { label: "foreach", kind: 14, insertText: "for (${1:Type} ${2:item} : ${3:collection}) {\n\t${4}\n}", insertTextRules: 4, detail: "Enhanced for loop" },
  { label: "while", kind: 14, insertText: "while (${1:condition}) {\n\t${2}\n}", insertTextRules: 4, detail: "While loop" },
  { label: "do while", kind: 14, insertText: "do {\n\t${1}\n} while (${2:condition});", insertTextRules: 4, detail: "Do-while loop" },
  { label: "switch", kind: 14, insertText: "switch (${1:variable}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}", insertTextRules: 4, detail: "Switch statement" },
  { label: "try catch", kind: 14, insertText: "try {\n\t${1}\n} catch (${2:Exception} e) {\n\t${3}\n}", insertTextRules: 4, detail: "Try-catch block" },
  { label: "throw", kind: 14, insertText: "throw new ${1:Exception}(${2});", insertTextRules: 4, detail: "Throw exception" },
  { label: "new", kind: 14, insertText: "new ${1:Type}(${2})", insertTextRules: 4, detail: "Create new instance" },
  { label: "return", kind: 14, insertText: "return ${1};", insertTextRules: 4, detail: "Return statement" },
  { label: "this", kind: 14, insertText: "this", detail: "Current instance" },
  { label: "super", kind: 14, insertText: "super", detail: "Parent class" },
  { label: "null", kind: 14, insertText: "null", detail: "Null value" },
  { label: "true", kind: 14, insertText: "true", detail: "Boolean true" },
  { label: "false", kind: 14, insertText: "false", detail: "Boolean false" },
  { label: "import", kind: 14, insertText: "import ${1:package.Class};", insertTextRules: 4, detail: "Import statement" },
  { label: "package", kind: 14, insertText: "package ${1:name};", insertTextRules: 4, detail: "Package declaration" },
  { label: "interface", kind: 7, insertText: "interface ${1:InterfaceName} {\n\t${2}\n}", insertTextRules: 4, detail: "Interface declaration" },
  { label: "implements", kind: 14, insertText: "implements ${1:Interface}", insertTextRules: 4, detail: "Implements clause" },
  { label: "extends", kind: 14, insertText: "extends ${1:Class}", insertTextRules: 4, detail: "Extends clause" },
  { label: "ArrayList", kind: 5, insertText: "ArrayList<${1:Type}> ${2:name} = new ArrayList<>();", insertTextRules: 4, detail: "ArrayList creation" },
  { label: "HashMap", kind: 5, insertText: "HashMap<${1:Key}, ${2:Value}> ${3:name} = new HashMap<>();", insertTextRules: 4, detail: "HashMap creation" },
  { label: "HashSet", kind: 5, insertText: "HashSet<${1:Type}> ${2:name} = new HashSet<>();", insertTextRules: 4, detail: "HashSet creation" },
  { label: "System.out.println", kind: 0, insertText: "System.out.println(${1});", insertTextRules: 4, detail: "Print to console" },
  { label: "@Override", kind: 14, insertText: "@Override\n", detail: "Override annotation" },
  { label: "instanceof", kind: 14, insertText: "instanceof ${1:Type}", insertTextRules: 4, detail: "Instance check" },
  { label: "break", kind: 14, insertText: "break;", detail: "Break statement" },
  { label: "continue", kind: 14, insertText: "continue;", detail: "Continue statement" },
  { label: "Lambda", kind: 14, insertText: "(${1:params}) -> ${2:expression}", insertTextRules: 4, detail: "Lambda expression" },
] as languages.CompletionItem[]

const cppCompletions: languages.CompletionItem[] = [
  { label: "#include", kind: 14, insertText: "#include <${1:iostream}>", insertTextRules: 4, detail: "Include header" },
  { label: "using namespace", kind: 14, insertText: "using namespace ${1:std};", insertTextRules: 4, detail: "Using namespace" },
  { label: "int main", kind: 0, insertText: "int main() {\n\t${1}\n\treturn 0;\n}", insertTextRules: 4, detail: "Main function" },
  { label: "cout", kind: 1, insertText: "cout << ${1} << endl;", insertTextRules: 4, detail: "Print to console" },
  { label: "cin", kind: 1, insertText: "cin >> ${1};", insertTextRules: 4, detail: "Read input" },
  { label: "endl", kind: 14, insertText: "endl", detail: "End line" },
  { label: "class", kind: 5, insertText: "class ${1:ClassName} {\npublic:\n\t${2}\nprivate:\n\t${3}\n};", insertTextRules: 4, detail: "Class definition" },
  { label: "struct", kind: 5, insertText: "struct ${1:StructName} {\n\t${2}\n};", insertTextRules: 4, detail: "Struct definition" },
  { label: "template", kind: 14, insertText: "template<typename ${1:T}>\n${2}", insertTextRules: 4, detail: "Template" },
  { label: "if", kind: 14, insertText: "if (${1:condition}) {\n\t${2}\n}", insertTextRules: 4, detail: "If statement" },
  { label: "else if", kind: 14, insertText: "else if (${1:condition}) {\n\t${2}\n}", insertTextRules: 4, detail: "Else if statement" },
  { label: "else", kind: 14, insertText: "else {\n\t${1}\n}", insertTextRules: 4, detail: "Else statement" },
  { label: "for", kind: 14, insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}", insertTextRules: 4, detail: "For loop" },
  { label: "for range", kind: 14, insertText: "for (auto& ${1:item} : ${2:container}) {\n\t${3}\n}", insertTextRules: 4, detail: "Range-based for" },
  { label: "while", kind: 14, insertText: "while (${1:condition}) {\n\t${2}\n}", insertTextRules: 4, detail: "While loop" },
  { label: "do while", kind: 14, insertText: "do {\n\t${1}\n} while (${2:condition});", insertTextRules: 4, detail: "Do-while loop" },
  { label: "switch", kind: 14, insertText: "switch (${1:variable}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}", insertTextRules: 4, detail: "Switch statement" },
  { label: "try catch", kind: 14, insertText: "try {\n\t${1}\n} catch (${2:exception}& e) {\n\t${3}\n}", insertTextRules: 4, detail: "Try-catch block" },
  { label: "vector", kind: 5, insertText: "vector<${1:int}> ${2:name};", insertTextRules: 4, detail: "Vector declaration" },
  { label: "map", kind: 5, insertText: "map<${1:key}, ${2:value}> ${3:name};", insertTextRules: 4, detail: "Map declaration" },
  { label: "set", kind: 5, insertText: "set<${1:type}> ${2:name};", insertTextRules: 4, detail: "Set declaration" },
  { label: "string", kind: 5, insertText: "string ${1:name};", insertTextRules: 4, detail: "String declaration" },
  { label: "pair", kind: 5, insertText: "pair<${1:first}, ${2:second}> ${3:name};", insertTextRules: 4, detail: "Pair declaration" },
  { label: "auto", kind: 14, insertText: "auto ${1:name} = ${2};", insertTextRules: 4, detail: "Auto type" },
  { label: "const", kind: 14, insertText: "const ", detail: "Const modifier" },
  { label: "static", kind: 14, insertText: "static ", detail: "Static modifier" },
  { label: "virtual", kind: 14, insertText: "virtual ", detail: "Virtual modifier" },
  { label: "override", kind: 14, insertText: "override", detail: "Override specifier" },
  { label: "nullptr", kind: 14, insertText: "nullptr", detail: "Null pointer" },
  { label: "new", kind: 14, insertText: "new ${1:Type}(${2})", insertTextRules: 4, detail: "Dynamic allocation" },
  { label: "delete", kind: 14, insertText: "delete ${1:ptr};", insertTextRules: 4, detail: "Delete memory" },
  { label: "return", kind: 14, insertText: "return ${1};", insertTextRules: 4, detail: "Return statement" },
  { label: "break", kind: 14, insertText: "break;", detail: "Break statement" },
  { label: "continue", kind: 14, insertText: "continue;", detail: "Continue statement" },
  { label: "sizeof", kind: 1, insertText: "sizeof(${1})", insertTextRules: 4, detail: "Size of type" },
  { label: "lambda", kind: 14, insertText: "[${1:capture}](${2:params}) {\n\t${3}\n}", insertTextRules: 4, detail: "Lambda expression" },
  { label: "unique_ptr", kind: 5, insertText: "unique_ptr<${1:Type}> ${2:name} = make_unique<${1:Type}>(${3});", insertTextRules: 4, detail: "Unique pointer" },
  { label: "shared_ptr", kind: 5, insertText: "shared_ptr<${1:Type}> ${2:name} = make_shared<${1:Type}>(${3});", insertTextRules: 4, detail: "Shared pointer" },
  { label: "push_back", kind: 0, insertText: "push_back(${1})", insertTextRules: 4, detail: "Add to vector" },
  { label: "size", kind: 0, insertText: "size()", detail: "Container size" },
  { label: "empty", kind: 0, insertText: "empty()", detail: "Check if empty" },
  { label: "begin", kind: 0, insertText: "begin()", detail: "Begin iterator" },
  { label: "end", kind: 0, insertText: "end()", detail: "End iterator" },
] as languages.CompletionItem[]

export function setupEditorTheme(monaco: Monaco) {
  monaco.editor.defineTheme("codestage-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "c084fc" },
      { token: "keyword.control", foreground: "f472b6" },
      { token: "string", foreground: "4ade80" },
      { token: "string.escape", foreground: "fbbf24" },
      { token: "number", foreground: "fbbf24" },
      { token: "function", foreground: "60a5fa" },
      { token: "variable", foreground: "e2e8f0" },
      { token: "variable.predefined", foreground: "22d3ee" },
      { token: "type", foreground: "22d3ee" },
      { token: "type.identifier", foreground: "38bdf8" },
      { token: "class", foreground: "22d3ee" },
      { token: "interface", foreground: "2dd4bf" },
      { token: "operator", foreground: "f472b6" },
      { token: "delimiter", foreground: "94a3b8" },
      { token: "delimiter.bracket", foreground: "94a3b8" },
      { token: "annotation", foreground: "fbbf24" },
      { token: "constant", foreground: "fb923c" },
      { token: "tag", foreground: "f472b6" },
      { token: "attribute.name", foreground: "22d3ee" },
      { token: "attribute.value", foreground: "4ade80" },
      { token: "meta", foreground: "94a3b8" },
      { token: "regexp", foreground: "f87171" },
    ],
    colors: {
      "editor.background": "#0d0d14",
      "editor.foreground": "#e2e8f0",
      "editor.lineHighlightBackground": "#1e1e2e",
      "editor.lineHighlightBorder": "#2d2d3d00",
      "editor.selectionBackground": "#6366f140",
      "editor.inactiveSelectionBackground": "#6366f120",
      "editorLineNumber.foreground": "#4b5563",
      "editorLineNumber.activeForeground": "#a78bfa",
      "editorCursor.foreground": "#a78bfa",
      "editorCursor.background": "#0d0d14",
      "editorIndentGuide.background": "#27272a",
      "editorIndentGuide.activeBackground": "#3f3f46",
      "editor.selectionHighlightBackground": "#6366f125",
      "editorBracketMatch.background": "#a78bfa30",
      "editorBracketMatch.border": "#a78bfa",
      "editorWidget.background": "#18181b",
      "editorWidget.border": "#27272a",
      "editorSuggestWidget.background": "#18181b",
      "editorSuggestWidget.border": "#27272a",
      "editorSuggestWidget.selectedBackground": "#3f3f46",
      "editorSuggestWidget.highlightForeground": "#a78bfa",
      "editorHoverWidget.background": "#18181b",
      "editorHoverWidget.border": "#27272a",
      "input.background": "#27272a",
      "input.border": "#3f3f46",
      "input.foreground": "#e2e8f0",
      "inputOption.activeBorder": "#a78bfa",
      "scrollbar.shadow": "#00000000",
      "scrollbarSlider.background": "#4b556340",
      "scrollbarSlider.hoverBackground": "#4b556360",
      "scrollbarSlider.activeBackground": "#4b556380",
    },
  })

  monaco.editor.setTheme("codestage-dark")
}

export function registerLanguageCompletions(monaco: Monaco) {
  monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems: (
      model: editor.ITextModel,
      position: { lineNumber: number; column: number }
    ) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }
      return { suggestions: pythonCompletions.map((item) => ({ ...item, range })) }
    },
  })

  monaco.languages.registerCompletionItemProvider("java", {
    provideCompletionItems: (
      model: editor.ITextModel,
      position: { lineNumber: number; column: number }
    ) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }
      return { suggestions: javaCompletions.map((item) => ({ ...item, range })) }
    },
  })

  monaco.languages.registerCompletionItemProvider("cpp", {
    provideCompletionItems: (
      model: editor.ITextModel,
      position: { lineNumber: number; column: number }
    ) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }
      return { suggestions: cppCompletions.map((item) => ({ ...item, range })) }
    },
  })
}

