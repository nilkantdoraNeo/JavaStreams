function starterCode(constants, instruction, imports = "import java.util.*;\nimport java.util.stream.*;") {
  return `${imports}

public class Solution {
${constants}
    public static Object solve() {
        // ${instruction}
        return null;
    }
}`;
}

const WORLD_NAMES = {
  1: "World 1: Basic Streams",
  2: "World 2: Filtering & Mapping",
  3: "World 3: Collectors",
  4: "World 4: Advanced Stream Operations",
  5: "World 5: Parallel Streams"
};

const TITLE_ADJECTIVES = [
  "Crimson",
  "Silent",
  "Rapid",
  "Curious",
  "Brave",
  "Golden",
  "Hidden",
  "Sharp",
  "Solar",
  "Lunar",
  "Neon",
  "Swift",
  "Polar",
  "Emerald",
  "Ruby",
  "Azure"
];

const TITLE_NOUNS = [
  "River",
  "Beacon",
  "Circuit",
  "Harbor",
  "Atlas",
  "Forge",
  "Signal",
  "Compass",
  "Canyon",
  "Garden",
  "Voyage",
  "Summit",
  "Valley",
  "Matrix",
  "Orbit",
  "Pattern"
];

const WORD_ROOTS = ["stream", "lambda", "collect", "map", "filter", "reduce", "flat", "group", "sort", "distinct", "parallel"];
const WORD_SUFFIXES = ["ops", "flow", "path", "lab", "grid", "forge", "pulse", "stack"];
const NAME_POOL = ["Ava", "Ben", "Cara", "Dax", "Eli", "Faye", "Gia", "Hugo", "Ivy", "Jude", "Kai", "Lia", "Mia", "Noah"];
const DEPARTMENTS = ["Eng", "Design", "QA", "Data"];
const CLASSIC_WORDS = [
  "stream",
  "lambda",
  "collector",
  "filter",
  "map",
  "reduce",
  "prime",
  "palindrome",
  "java",
  "code",
  "array",
  "list",
  "queue",
  "stack",
  "string",
  "object",
  "school",
  "student",
  "employee",
  "salary",
  "department",
  "project",
  "analysis",
  "design",
  "system",
  "logic",
  "data",
  "value",
  "range",
  "matrix",
  "graph",
  "tree",
  "node",
  "level",
  "report",
  "summary",
  "daily"
];
const PALINDROME_WORDS = ["level", "radar", "civic", "madam", "noon", "refer", "racecar", "rotor"];
const ANAGRAM_SETS = [
  ["eat", "tea", "ate"],
  ["tan", "nat"],
  ["listen", "silent"],
  ["loop", "polo", "pool"]
];

const BASE_SEED = 1337;

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(index) {
  return mulberry32(BASE_SEED + index * 1013);
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick(rng, list) {
  return list[randomInt(rng, 0, list.length - 1)];
}

function shuffle(rng, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildWordPool() {
  const pool = [];
  WORD_ROOTS.forEach((root) => {
    WORD_SUFFIXES.forEach((suffix) => {
      pool.push(`${root}${suffix}`.toLowerCase());
    });
  });
  return pool;
}

const WORD_POOL = buildWordPool();

function pickWords(rng, count, allowDuplicates = false) {
  if (!allowDuplicates) {
    return shuffle(rng, WORD_POOL).slice(0, count);
  }
  const words = [];
  for (let i = 0; i < count; i += 1) {
    words.push(pick(rng, WORD_POOL));
  }
  return words;
}

function generateIntList(rng, count, min, max, allowDuplicates = true) {
  if (allowDuplicates) {
    return Array.from({ length: count }, () => randomInt(rng, min, max));
  }
  const set = new Set();
  while (set.size < count) {
    set.add(randomInt(rng, min, max));
  }
  return Array.from(set);
}

function ensureMatch(list, predicate, fallback) {
  if (!list.some(predicate)) {
    list[0] = fallback;
  }
}

function javaStringLiteral(value) {
  return JSON.stringify(value);
}

function javaListLiteral(values, kind = "number") {
  if (!values || values.length === 0) {
    return "java.util.List.of()";
  }
  if (kind === "string") {
    return `java.util.List.of(${values.map(javaStringLiteral).join(", ")})`;
  }
  return `java.util.List.of(${values.join(", ")})`;
}

function displayList(values, kind = "number") {
  if (!values || values.length === 0) {
    return "[]";
  }
  if (kind === "string") {
    return `[${values.join(", ")}]`;
  }
  return `[${values.join(", ")}]`;
}

function mapAssertion(entries, valueFormatter) {
  const checks = entries.map(([key, value]) => {
    const keyExpr = typeof key === "string" ? javaStringLiteral(key) : String(key);
    return `((java.util.Map)result).get(${keyExpr}).equals(${valueFormatter(value)})`;
  });
  return `(result instanceof java.util.Map) && ${checks.join(" && ")}`;
}

function hintStepsFromHint(hint, instruction) {
  return [
    "Start by identifying the source stream for this task.",
    `Use this operation as a key step: ${hint}`,
    `Pipeline goal: ${instruction}. Keep the stream immutable and readable.`
  ];
}

function defaultEditorial(instruction, hint) {
  return [
    "Think of the problem as a data pipeline: source -> transformation -> terminal operation.",
    `For this challenge, a strong approach is to anchor around ${hint}.`,
    "Keep each stream step focused and avoid mutable shared state.",
    `Task objective: ${instruction}.`
  ].join("\n\n");
}

function makeTitle(base, index) {
  const adjective = TITLE_ADJECTIVES[index % TITLE_ADJECTIVES.length];
  const noun = TITLE_NOUNS[Math.floor(index / TITLE_ADJECTIVES.length) % TITLE_NOUNS.length];
  return `${adjective} ${noun} ${base}`;
}

function classicTitle(base, variant) {
  if (variant > 1) {
    return `${base} (Set ${variant})`;
  }
  return base;
}

function isPrime(value) {
  if (value < 2) {
    return false;
  }
  for (let i = 2; i * i <= value; i += 1) {
    if (value % i === 0) {
      return false;
    }
  }
  return true;
}

function isPalindrome(value) {
  const text = String(value);
  return text === text.split("").reverse().join("");
}

function digitSum(value) {
  return Math.abs(value)
    .toString()
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
}

function factorial(value) {
  let result = 1;
  for (let i = 2; i <= value; i += 1) {
    result *= i;
  }
  return result;
}

function fibonacciList(count) {
  const list = [];
  let a = 0;
  let b = 1;
  for (let i = 0; i < count; i += 1) {
    list.push(a);
    [a, b] = [b, a + b];
  }
  return list;
}

function anagramKey(word) {
  return word.toLowerCase().split("").sort().join("");
}

function countVowels(word) {
  return (word.match(/[aeiou]/gi) || []).length;
}

function pickClassicWords(rng, count) {
  return shuffle(rng, CLASSIC_WORDS).slice(0, count);
}

function buildEmployeeList(rng, count) {
  const names = shuffle(rng, NAME_POOL).slice(0, count);
  return names.map((name) => ({
    name,
    dept: pick(rng, DEPARTMENTS),
    salary: randomInt(rng, 45000, 125000)
  }));
}

function employeeConstants(employees) {
  return (
    "    static class Emp { String name; String dept; int salary; Emp(String n, String d, int s){name=n;dept=d;salary=s;} }\n" +
    `    private static final List<Emp> EMPLOYEES = List.of(${employees
      .map((emp) => `new Emp(${javaStringLiteral(emp.name)},${javaStringLiteral(emp.dept)},${emp.salary})`)
      .join(",")});\n`
  );
}

const PRIME_HELPER =
  "    private static boolean isPrime(int n) {\n" +
  "        if (n < 2) return false;\n" +
  "        for (int i = 2; i * i <= n; i++) {\n" +
  "            if (n % i == 0) return false;\n" +
  "        }\n" +
  "        return true;\n" +
  "    }\n";

const PALINDROME_TEXT_HELPER =
  "    private static boolean isPalindrome(String value) {\n" +
  "        String rev = new StringBuilder(value).reverse().toString();\n" +
  "        return value.equals(rev);\n" +
  "    }\n";

const PALINDROME_NUMBER_HELPER =
  "    private static boolean isPalindrome(int value) {\n" +
  "        String text = String.valueOf(value);\n" +
  "        String rev = new StringBuilder(text).reverse().toString();\n" +
  "        return text.equals(rev);\n" +
  "    }\n";

const DIGIT_SUM_HELPER =
  "    private static int digitSum(int value) {\n" +
  "        return String.valueOf(Math.abs(value)).chars().map(ch -> ch - '0').sum();\n" +
  "    }\n";

const FACTORIAL_HELPER =
  "    private static int factorial(int value) {\n" +
  "        int result = 1;\n" +
  "        for (int i = 2; i <= value; i++) { result *= i; }\n" +
  "        return result;\n" +
  "    }\n";

const VOWEL_HELPER =
  "    private static long vowelCount(String value) {\n" +
  "        return value.chars()\n" +
  "            .map(Character::toLowerCase)\n" +
  "            .filter(ch -> ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u')\n" +
  "            .count();\n" +
  "    }\n";

function acceptanceRateForDifficulty(difficulty, rng) {
  const base =
    difficulty === "Beginner" ? 78 : difficulty === "Intermediate" ? 62 : difficulty === "Advanced" ? 47 : 38;
  const variation = Math.round(rng() * 10 - 5);
  return Math.max(25, Math.min(95, base + variation));
}

function xpForDifficulty(difficulty, index) {
  const base =
    difficulty === "Beginner" ? 35 : difficulty === "Intermediate" ? 48 : difficulty === "Advanced" ? 65 : 80;
  return base + (index % 5);
}

function baseProblem({
  title,
  difficulty,
  topic,
  constants,
  instruction,
  hint,
  expectedOutput,
  assertion,
  imports,
  xpReward,
  extraTests = []
}) {
  const tags = Array.from(new Set([topic, "Stream API"]));
  return {
    title,
    difficulty,
    topic,
    tags,
    starterCode: starterCode(constants, instruction, imports),
    description: `${instruction}.`,
    hint,
    hintSteps: hintStepsFromHint(hint, instruction),
    inputFormat: "Input is provided as constants in Solution starter code.",
    outputFormat: "Return the expected value from solve().",
    constraints: "Use Java Stream API operations and avoid loop-based imperative rewrites.",
    examples: [
      {
        input: "See constants in starter code",
        output: expectedOutput
      }
    ],
    editorial: defaultEditorial(instruction, hint),
    optimizedSolution: "Use concise stream chaining and collector choices suitable for the target output.",
    acceptanceRate: 60,
    popularity: 50,
    expectedOutput,
    sampleTests: [{ assertion, message: "Sample test failed" }],
    testCases: [{ assertion, message: "Hidden test failed" }, ...extraTests],
    xpReward
  };
}

function templateFilterEven({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 1, 99, true);
  ensureMatch(numbers, (n) => n % 2 === 0, 42);
  const result = numbers.filter((n) => n % 2 === 0);
  const instruction = "Return a List<Integer> containing only even numbers from NUMBERS";
  return baseProblem({
    title: makeTitle("Even Filter", index),
    difficulty,
    topic: "Filtering",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use filter(n -> n % 2 == 0)",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateMapSquares({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 6, 10), 1, 20, true);
  const result = numbers.map((n) => n * n);
  const instruction = "Return a List<Integer> containing squares of NUMBERS";
  return baseProblem({
    title: makeTitle("Square Forge", index),
    difficulty,
    topic: "Mapping",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use map(n -> n * n)",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateSumNumbers({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 6, 10), 5, 40, true);
  const sum = numbers.reduce((a, b) => a + b, 0);
  const instruction = "Return the sum of NUMBERS as Integer";
  return baseProblem({
    title: makeTitle("Total Sum", index),
    difficulty,
    topic: "Reduction",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use reduce(0, Integer::sum)",
    expectedOutput: String(sum),
    assertion: `(result instanceof Integer) && ((Integer)result) == ${sum}`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateDistinctSorted({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 1, 15, true);
  const result = Array.from(new Set(numbers)).sort((a, b) => a - b);
  const instruction = "Return distinct NUMBERS sorted ascending as List<Integer>";
  return baseProblem({
    title: makeTitle("Distinct Sorter", index),
    difficulty,
    topic: "Distinct operations",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use distinct() then sorted()",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateUppercasePrefix({ index, rng, difficulty }) {
  const words = pickWords(rng, randomInt(rng, 6, 10), true);
  const prefix = pick(rng, ["st", "fl", "gr", "pa", "mo", "co"]);
  ensureMatch(words, (w) => w.startsWith(prefix), `${prefix}flow`);
  const result = words.filter((w) => w.startsWith(prefix)).map((w) => w.toUpperCase());
  const instruction = `Return uppercase words that start with \"${prefix}\"`;
  return baseProblem({
    title: makeTitle("Uppercase Crew", index),
    difficulty,
    topic: "Mapping",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "filter + map(String::toUpperCase)",
    expectedOutput: displayList(result, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateJoinFiltered({ index, rng, difficulty }) {
  const words = pickWords(rng, randomInt(rng, 6, 10), true);
  const minLength = randomInt(rng, 6, 9);
  ensureMatch(words, (w) => w.length >= minLength, "streamforge");
  const result = words.filter((w) => w.length >= minLength).join(" | ");
  const instruction = `Filter words with length >= ${minLength} and join with \" | \"`;
  return baseProblem({
    title: makeTitle("Filter and Join", index),
    difficulty,
    topic: "Collecting",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use Collectors.joining(\" | \")",
    expectedOutput: result,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateFlatMapTags({ index, rng, difficulty }) {
  const lists = [pickWords(rng, 3, true), pickWords(rng, 2, true), pickWords(rng, 3, true)];
  const flat = lists.flat();
  const listLiteral = lists.map((items) => `List.of(${items.map(javaStringLiteral).join(",")})`).join(", ");
  const instruction = "Flatten TAGS into a single List<String>";
  return baseProblem({
    title: makeTitle("Tag Flattener", index),
    difficulty,
    topic: "Flat Mapping",
    constants: `    private static final List<List<String>> TAGS = List.of(${listLiteral});\n`,
    instruction,
    hint: "Use flatMap(List::stream)",
    expectedOutput: displayList(flat, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(flat, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateSkipLimit({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 12, 16), 5, 70, true);
  const skip = randomInt(rng, 2, 4);
  const limit = randomInt(rng, 3, 6);
  const result = numbers.slice(skip, skip + limit);
  const instruction = `Skip first ${skip} numbers and return next ${limit} values`;
  return baseProblem({
    title: makeTitle("Skip Limit Window", index),
    difficulty,
    topic: "Limit and skip operations",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: `Use skip(${skip}).limit(${limit})`,
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateAnyMatchDivisible({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 10, 99, true);
  const divisor = pick(rng, [7, 9, 11, 13, 17]);
  const result = numbers.some((n) => n % divisor === 0);
  const instruction = `Return true if any number is divisible by ${divisor}`;
  return baseProblem({
    title: makeTitle("AnyMatch Gate", index),
    difficulty,
    topic: "Stream chaining",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: `Use anyMatch(n -> n % ${divisor} == 0)`,
    expectedOutput: String(result),
    assertion: result
      ? "(result instanceof Boolean) && ((Boolean)result)"
      : "(result instanceof Boolean) && !((Boolean)result)",
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateGroupByFirstLetter({ index, rng, difficulty }) {
  const words = pickWords(rng, randomInt(rng, 6, 9), true);
  const counts = new Map();
  words.forEach((word) => {
    const key = word.charAt(0).toUpperCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const entries = Array.from(counts.entries()).slice(0, 4);
  const instruction = "Return Map<String, Long> of word counts grouped by first letter";
  return baseProblem({
    title: makeTitle("First Letter Groups", index),
    difficulty,
    topic: "Grouping",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use groupingBy(word -> word.substring(0,1), counting())",
    expectedOutput: `{${entries.map(([k, v]) => `${k}=${v}`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => `${value}L`),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateAdjacentPairSum({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 5, 8), 2, 25, true);
  const result = [];
  for (let i = 0; i < numbers.length - 1; i += 1) {
    result.push(numbers[i] + numbers[i + 1]);
  }
  const instruction = "Return list of adjacent pair sums [a0+a1, a1+a2, ...]";
  return baseProblem({
    title: makeTitle("Adjacent Pair Sum", index),
    difficulty,
    topic: "Complex pipelines",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use IntStream.range(0, size - 1)",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateTopFrequentWords({ index, rng, difficulty }) {
  const words = pickWords(rng, randomInt(rng, 10, 14), true);
  const counts = new Map();
  words.forEach((word) => {
    counts.set(word, (counts.get(word) || 0) + 1);
  });
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([word]) => word);
  const instruction = "Return top 3 frequent words sorted by frequency desc then alphabetic";
  return baseProblem({
    title: makeTitle("Top Frequency Trio", index),
    difficulty,
    topic: "Sorting",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Count with groupingBy then sort entries",
    expectedOutput: displayList(sorted, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(sorted, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateMaxSalaryName({ index, rng, difficulty }) {
  const names = shuffle(rng, NAME_POOL).slice(0, randomInt(rng, 4, 6));
  const salaries = generateIntList(rng, names.length, 55000, 120000, true);
  const employees = names.map((name, idx) => ({
    name,
    salary: salaries[idx]
  }));
  const maxEmp = employees.reduce((best, current) => (current.salary > best.salary ? current : best), employees[0]);
  const constants =
    "    static class Emp { String name; int salary; Emp(String n, int s){name=n;salary=s;} }\n" +
    `    private static final List<Emp> EMPLOYEES = List.of(${employees
      .map((emp) => `new Emp(${javaStringLiteral(emp.name)},${emp.salary})`)
      .join(",")});\n`;
  const instruction = "Return employee name with max salary";
  return baseProblem({
    title: makeTitle("Highest Salary Hunter", index),
    difficulty,
    topic: "Reduction",
    constants,
    instruction,
    hint: "Use max(Comparator.comparingInt(...))",
    expectedOutput: maxEmp.name,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(maxEmp.name)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templatePartitionByThreshold({ index, rng, difficulty }) {
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 1, 50, true);
  const threshold = randomInt(rng, 20, 35);
  const above = numbers.filter((n) => n >= threshold);
  const below = numbers.filter((n) => n < threshold);
  const entries = [
    [true, above],
    [false, below]
  ];
  const instruction = `Return partitioned map where key true has numbers >= ${threshold}`;
  return baseProblem({
    title: makeTitle("Threshold Partition", index),
    difficulty,
    topic: "Grouping",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: `Collectors.partitioningBy(n -> n >= ${threshold})`,
    expectedOutput: `{true=[${above.join(", ")}], false=[${below.join(", ")}]}`,
    assertion: mapAssertion(entries, (value) => javaListLiteral(value)),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateCustomCollectorPipe({ index, rng, difficulty }) {
  const words = pickWords(rng, randomInt(rng, 4, 6), true);
  const result = words.map((w) => w.toLowerCase()).join("|");
  const instruction = "Return lowercase words joined with pipe symbol";
  return baseProblem({
    title: makeTitle("Custom Pipe Collector", index),
    difficulty,
    topic: "Custom collectors",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use map then Collectors.joining(\"|\")",
    expectedOutput: result,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicPrimeFilter({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 2, 60, true);
  ensureMatch(numbers, isPrime, 29);
  const result = numbers.filter(isPrime);
  const instruction = "Return a List<Integer> of prime numbers from NUMBERS";
  return baseProblem({
    title: classicTitle("Prime Number Filter", variant),
    difficulty,
    topic: "Number Streams",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n${PRIME_HELPER}`,
    instruction,
    hint: "Use filter(n -> isPrime(n))",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicPrimeCount({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 2, 60, true);
  ensureMatch(numbers, isPrime, 31);
  const result = numbers.filter(isPrime).length;
  const instruction = "Return the count of prime numbers in NUMBERS as Long";
  return baseProblem({
    title: classicTitle("Prime Count", variant),
    difficulty,
    topic: "Number Streams",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n${PRIME_HELPER}`,
    instruction,
    hint: "Use filter(isPrime).count()",
    expectedOutput: String(result),
    assertion: `(result instanceof Long) && ((Long)result) == ${result}L`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicPalindromeStrings({ index, rng, variant }) {
  const difficulty = "Beginner";
  const palindromes = shuffle(rng, PALINDROME_WORDS).slice(0, 3);
  const extras = pickClassicWords(rng, randomInt(rng, 3, 5));
  const words = shuffle(rng, [...palindromes, ...extras]).slice(0, randomInt(rng, 6, 8));
  ensureMatch(words, (w) => isPalindrome(w), "level");
  const result = words.filter((word) => isPalindrome(word));
  const instruction = "Return palindromic words from WORDS";
  return baseProblem({
    title: classicTitle("Palindrome Words", variant),
    difficulty,
    topic: "String Streams",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n${PALINDROME_TEXT_HELPER}`,
    instruction,
    hint: "Use filter(word -> isPalindrome(word))",
    expectedOutput: displayList(result, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicPalindromeNumbers({ index, rng, variant }) {
  const difficulty = "Beginner";
  const baseNumbers = [121, 131, 141, 202, 303, 454, 505, 818, 929];
  const numbers = shuffle(rng, [...baseNumbers, ...generateIntList(rng, 4, 10, 150, true)]).slice(0, 9);
  ensureMatch(numbers, (n) => isPalindrome(n), 121);
  const result = numbers.filter((n) => isPalindrome(n));
  const instruction = "Return palindromic numbers from NUMBERS";
  return baseProblem({
    title: classicTitle("Palindrome Numbers", variant),
    difficulty,
    topic: "Number Streams",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n${PALINDROME_NUMBER_HELPER}`,
    instruction,
    hint: "Filter numbers where isPalindrome(n) is true",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEvenOddPartition({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 1, 40, true);
  const evens = numbers.filter((n) => n % 2 === 0);
  const odds = numbers.filter((n) => n % 2 !== 0);
  const instruction = "Partition NUMBERS into even and odd lists using partitioningBy";
  return baseProblem({
    title: classicTitle("Even Odd Partition", variant),
    difficulty,
    topic: "Collectors",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Collectors.partitioningBy(n -> n % 2 == 0)",
    expectedOutput: `{true=[${evens.join(", ")}], false=[${odds.join(", ")}]}`,
    assertion: mapAssertion(
      [
        [true, evens],
        [false, odds]
      ],
      (value) => javaListLiteral(value)
    ),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicDigitSum({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 7, 10), 10, 99, true);
  const result = numbers.map((n) => digitSum(n));
  const instruction = "Return a List<Integer> of digit sums for NUMBERS";
  return baseProblem({
    title: classicTitle("Digit Sum List", variant),
    difficulty,
    topic: "Number Streams",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n${DIGIT_SUM_HELPER}`,
    instruction,
    hint: "Use map(n -> digitSum(n))",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicReverseStrings({ index, rng, variant }) {
  const difficulty = "Beginner";
  const words = pickClassicWords(rng, randomInt(rng, 6, 9));
  const result = words.map((word) => word.split("").reverse().join(""));
  const instruction = "Return a List<String> of WORDS reversed";
  return baseProblem({
    title: classicTitle("Reverse Strings", variant),
    difficulty,
    topic: "String Streams",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use map(word -> new StringBuilder(word).reverse().toString())",
    expectedOutput: displayList(result, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicFactorialList({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 4, 6), 2, 6, false);
  const result = numbers.map((n) => factorial(n));
  const instruction = "Return a List<Integer> of factorials for NUMBERS";
  return baseProblem({
    title: classicTitle("Factorial List", variant),
    difficulty,
    topic: "Number Streams",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n${FACTORIAL_HELPER}`,
    instruction,
    hint: "Use map(n -> factorial(n))",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicFibonacci({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const count = randomInt(rng, 6, 10);
  const result = fibonacciList(count);
  const instruction = `Return the first ${count} Fibonacci numbers as List<Integer>`;
  return baseProblem({
    title: classicTitle("Fibonacci Stream", variant),
    difficulty,
    topic: "Stream Generation",
    constants: `    private static final int N = ${count};\n`,
    instruction,
    hint: "Use Stream.iterate with an int[] pair and limit(N)",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicAnagramGroups({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const groups = shuffle(rng, ANAGRAM_SETS).slice(0, 2);
  const extra = pickClassicWords(rng, 2);
  const words = [...groups.flat(), ...extra];
  const entries = groups.map((group) => [anagramKey(group[0]), group]);
  const instruction = "Group WORDS by sorted-letter signature into Map<String, List<String>>";
  return baseProblem({
    title: classicTitle("Group Anagrams", variant),
    difficulty,
    topic: "Grouping",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Collectors.groupingBy(word -> sorted letters)",
    expectedOutput: `{${entries.map(([key, group]) => `${key}=[${group.join(", ")}]`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => javaListLiteral(value, "string")),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicDistinctCharacters({ index, rng, variant }) {
  const difficulty = "Beginner";
  const text = pick(rng, ["streamapi", "mississippi", "programming", "banana", "developer"]);
  const result = Array.from(new Set(text.split(""))).join("");
  const instruction = "Return String of distinct characters from TEXT in original order";
  return baseProblem({
    title: classicTitle("Distinct Characters", variant),
    difficulty,
    topic: "String Streams",
    constants: `    private static final String TEXT = ${javaStringLiteral(text)};\n`,
    instruction,
    hint: "Use TEXT.chars().distinct() then collect to String",
    expectedOutput: result,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicVowelCount({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const words = pickClassicWords(rng, randomInt(rng, 4, 6));
  const entries = words.map((word) => [word, countVowels(word)]);
  const instruction = "Return Map<String, Long> of vowel counts for each word";
  return baseProblem({
    title: classicTitle("Vowel Count Map", variant),
    difficulty,
    topic: "Collectors",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n${VOWEL_HELPER}`,
    instruction,
    hint: "Use Collectors.toMap(word -> word, word -> vowelCount(word))",
    expectedOutput: `{${entries.map(([key, value]) => `${key}=${value}`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => `${value}L`),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicSecondLargest({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 7, 10), 5, 90, true);
  const unique = Array.from(new Set(numbers)).sort((a, b) => b - a);
  const second = unique.length > 1 ? unique[1] : unique[0];
  const instruction = "Return the second largest distinct number in NUMBERS";
  return baseProblem({
    title: classicTitle("Second Largest", variant),
    difficulty,
    topic: "Sorting",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use distinct(), sorted(reverseOrder()), skip(1)",
    expectedOutput: String(second),
    assertion: `(result instanceof Integer) && ((Integer)result) == ${second}`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicTopK({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 8, 12), 10, 90, true);
  const result = [...numbers].sort((a, b) => b - a).slice(0, 3);
  const instruction = "Return top 3 numbers in descending order";
  return baseProblem({
    title: classicTitle("Top 3 Numbers", variant),
    difficulty,
    topic: "Sorting",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use sorted(reverseOrder()).limit(3)",
    expectedOutput: displayList(result),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicAverage({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 6, 9), 10, 60, true);
  const avg = Number((numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2));
  const instruction = "Return the average of NUMBERS rounded to 2 decimals";
  return baseProblem({
    title: classicTitle("Average of Numbers", variant),
    difficulty,
    topic: "Reduction",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use mapToInt and average()",
    expectedOutput: avg.toFixed(2),
    assertion: `(result instanceof Double) && Math.abs(((Double)result) - ${avg}) < 0.01`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicWordLengthMap({ index, rng, variant }) {
  const difficulty = "Beginner";
  const words = pickClassicWords(rng, randomInt(rng, 4, 6));
  const entries = words.map((word) => [word, word.length]);
  const instruction = "Return Map<String, Integer> of word lengths";
  return baseProblem({
    title: classicTitle("Word Length Map", variant),
    difficulty,
    topic: "Collectors",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use Collectors.toMap(word -> word, String::length)",
    expectedOutput: `{${entries.map(([key, value]) => `${key}=${value}`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => `${value}`),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicSortByLength({ index, rng, variant }) {
  const difficulty = "Beginner";
  const words = pickClassicWords(rng, randomInt(rng, 5, 7));
  const result = [...words].sort((a, b) => a.length - b.length || a.localeCompare(b));
  const instruction = "Return WORDS sorted by length then alphabetic";
  return baseProblem({
    title: classicTitle("Sort Words by Length", variant),
    difficulty,
    topic: "Sorting",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use sorted(Comparator.comparingInt(String::length).thenComparing(String::compareTo))",
    expectedOutput: displayList(result, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicLongestWord({ index, rng, variant }) {
  const difficulty = "Beginner";
  const words = pickClassicWords(rng, randomInt(rng, 5, 7));
  const result = [...words].sort((a, b) => b.length - a.length || a.localeCompare(b))[0];
  const instruction = "Return the longest word (tie-break alphabetically)";
  return baseProblem({
    title: classicTitle("Longest Word", variant),
    difficulty,
    topic: "String Streams",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use max with Comparator.comparingInt(String::length)",
    expectedOutput: result,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicAllPositive({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 6, 9), -8, 30, true);
  const result = numbers.every((n) => n > 0);
  const instruction = "Return true if all numbers are positive";
  return baseProblem({
    title: classicTitle("All Positive Check", variant),
    difficulty,
    topic: "Number Streams",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use allMatch(n -> n > 0)",
    expectedOutput: String(result),
    assertion: result
      ? "(result instanceof Boolean) && ((Boolean)result)"
      : "(result instanceof Boolean) && !((Boolean)result)",
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicSumOfSquares({ index, rng, variant }) {
  const difficulty = "Beginner";
  const numbers = generateIntList(rng, randomInt(rng, 6, 9), 2, 15, true);
  const result = numbers.reduce((sum, value) => sum + value * value, 0);
  const instruction = "Return the sum of squares of NUMBERS";
  return baseProblem({
    title: classicTitle("Sum of Squares", variant),
    difficulty,
    topic: "Reduction",
    constants: `    private static final List<Integer> NUMBERS = List.of(${numbers.join(",")});\n`,
    instruction,
    hint: "Use map(n -> n * n) then reduce",
    expectedOutput: String(result),
    assertion: `(result instanceof Integer) && ((Integer)result) == ${result}`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicDistinctStrings({ index, rng, variant }) {
  const difficulty = "Beginner";
  const words = shuffle(rng, [...pickClassicWords(rng, 5), ...pickClassicWords(rng, 3)]);
  const result = Array.from(new Set(words));
  const instruction = "Remove duplicates from WORDS, preserving order";
  return baseProblem({
    title: classicTitle("Distinct Words", variant),
    difficulty,
    topic: "Distinct operations",
    constants: `    private static final List<String> WORDS = List.of(${words.map(javaStringLiteral).join(",")});\n`,
    instruction,
    hint: "Use distinct()",
    expectedOutput: displayList(result, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicCharFrequency({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const text = pick(rng, ["banana", "stream", "level", "success", "developer"]);
  const counts = new Map();
  text.split("").forEach((char) => {
    counts.set(char, (counts.get(char) || 0) + 1);
  });
  const entries = Array.from(counts.entries()).slice(0, 3);
  const instruction = "Return Map<String, Long> of character frequencies in TEXT";
  return baseProblem({
    title: classicTitle("Character Frequency", variant),
    difficulty,
    topic: "Collectors",
    constants: `    private static final String TEXT = ${javaStringLiteral(text)};\n`,
    instruction,
    hint: "Use TEXT.chars().mapToObj and groupingBy",
    expectedOutput: `{${entries.map(([key, value]) => `${key}=${value}`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => `${value}L`),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicMostFrequentChar({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const text = pick(rng, ["mississippi", "committee", "success", "parallel"]);
  const counts = new Map();
  text.split("").forEach((char) => {
    counts.set(char, (counts.get(char) || 0) + 1);
  });
  const result = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  const instruction = "Return the most frequent character in TEXT (tie-break alphabetically)";
  return baseProblem({
    title: classicTitle("Most Frequent Character", variant),
    difficulty,
    topic: "Grouping",
    constants: `    private static final String TEXT = ${javaStringLiteral(text)};\n`,
    instruction,
    hint: "Group by character and pick max by count",
    expectedOutput: result,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeHighestSalary({ index, rng, variant }) {
  const difficulty = "Beginner";
  const employees = buildEmployeeList(rng, randomInt(rng, 4, 6));
  const top = employees.reduce((best, current) => (current.salary > best.salary ? current : best), employees[0]);
  const instruction = "Return the name of the employee with highest salary";
  return baseProblem({
    title: classicTitle("Employee Max Salary", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Use max(Comparator.comparingInt(emp -> emp.salary))",
    expectedOutput: top.name,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(top.name)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeAvgByDept({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const employees = buildEmployeeList(rng, randomInt(rng, 5, 7));
  const totals = new Map();
  const counts = new Map();
  employees.forEach((emp) => {
    totals.set(emp.dept, (totals.get(emp.dept) || 0) + emp.salary);
    counts.set(emp.dept, (counts.get(emp.dept) || 0) + 1);
  });
  const entries = Array.from(totals.entries()).map(([dept, total]) => [
    dept,
    Math.round(total / counts.get(dept))
  ]);
  const instruction = "Return Map<String, Integer> of average salary per department (rounded)";
  return baseProblem({
    title: classicTitle("Average Salary by Dept", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Use groupingBy with averagingInt then round",
    expectedOutput: `{${entries.map(([key, value]) => `${key}=${value}`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => `${value}`),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeCountByDept({ index, rng, variant }) {
  const difficulty = "Beginner";
  const employees = buildEmployeeList(rng, randomInt(rng, 5, 7));
  const counts = new Map();
  employees.forEach((emp) => {
    counts.set(emp.dept, (counts.get(emp.dept) || 0) + 1);
  });
  const entries = Array.from(counts.entries());
  const instruction = "Return Map<String, Long> of employee counts per department";
  return baseProblem({
    title: classicTitle("Employee Count by Dept", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Use groupingBy(emp -> emp.dept, counting())",
    expectedOutput: `{${entries.map(([key, value]) => `${key}=${value}`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => `${value}L`),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeNamesByDept({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const employees = buildEmployeeList(rng, randomInt(rng, 5, 7));
  const groups = new Map();
  employees.forEach((emp) => {
    const list = groups.get(emp.dept) || [];
    list.push(emp.name);
    groups.set(emp.dept, list);
  });
  const entries = Array.from(groups.entries()).map(([dept, list]) => [dept, list.sort((a, b) => a.localeCompare(b))]);
  const instruction = "Return Map<String, List<String>> of employee names per department sorted alphabetically";
  return baseProblem({
    title: classicTitle("Employee Names by Dept", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Use groupingBy then map and sort names",
    expectedOutput: `{${entries.map(([key, value]) => `${key}=[${value.join(", ")}]`).join(", ")}}`,
    assertion: mapAssertion(entries, (value) => javaListLiteral(value, "string")),
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeTopEarners({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const employees = buildEmployeeList(rng, randomInt(rng, 5, 7));
  const result = [...employees]
    .sort((a, b) => b.salary - a.salary)
    .slice(0, 2)
    .map((emp) => emp.name);
  const instruction = "Return names of top 2 earners in descending salary order";
  return baseProblem({
    title: classicTitle("Top Earners", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Sort by salary desc then limit(2)",
    expectedOutput: displayList(result, "string"),
    assertion: `(result instanceof java.util.List) && result.equals(${javaListLiteral(result, "string")})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeDeptTotal({ index, rng, variant }) {
  const difficulty = "Intermediate";
  const employees = buildEmployeeList(rng, randomInt(rng, 5, 7));
  const totals = new Map();
  employees.forEach((emp) => {
    totals.set(emp.dept, (totals.get(emp.dept) || 0) + emp.salary);
  });
  const result = Array.from(totals.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  const instruction = "Return the department with the highest total salary";
  return baseProblem({
    title: classicTitle("Highest Paying Dept", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Group by department then sum salaries",
    expectedOutput: result,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeJoinNames({ index, rng, variant }) {
  const difficulty = "Beginner";
  const employees = buildEmployeeList(rng, randomInt(rng, 4, 6));
  const result = employees.map((emp) => emp.name).sort((a, b) => a.localeCompare(b)).join(", ");
  const instruction = "Return employee names sorted alphabetically and joined with \", \"";
  return baseProblem({
    title: classicTitle("Employee Name Rollup", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Map to name then sorted + Collectors.joining(\", \")",
    expectedOutput: result,
    assertion: `(result instanceof String) && result.equals(${javaStringLiteral(result)})`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

function templateClassicEmployeeSalaryThreshold({ index, rng, variant }) {
  const difficulty = "Beginner";
  const employees = buildEmployeeList(rng, randomInt(rng, 5, 7));
  const threshold = randomInt(rng, 65000, 95000);
  const result = employees.filter((emp) => emp.salary >= threshold).length;
  const instruction = `Return number of employees with salary >= ${threshold} as Long`;
  return baseProblem({
    title: classicTitle("Salary Threshold Count", variant),
    difficulty,
    topic: "Employee Streams",
    constants: employeeConstants(employees),
    instruction,
    hint: "Use filter(emp -> emp.salary >= threshold).count()",
    expectedOutput: String(result),
    assertion: `(result instanceof Long) && ((Long)result) == ${result}L`,
    xpReward: xpForDifficulty(difficulty, index)
  });
}

const CLASSIC_TEMPLATES = [
  templateClassicPrimeFilter,
  templateClassicPrimeCount,
  templateClassicPalindromeStrings,
  templateClassicPalindromeNumbers,
  templateClassicEvenOddPartition,
  templateClassicDigitSum,
  templateClassicReverseStrings,
  templateClassicFactorialList,
  templateClassicFibonacci,
  templateClassicAnagramGroups,
  templateClassicDistinctCharacters,
  templateClassicVowelCount,
  templateClassicSecondLargest,
  templateClassicTopK,
  templateClassicAverage,
  templateClassicWordLengthMap,
  templateClassicSortByLength,
  templateClassicLongestWord,
  templateClassicAllPositive,
  templateClassicSumOfSquares,
  templateClassicDistinctStrings,
  templateClassicCharFrequency,
  templateClassicMostFrequentChar,
  templateClassicEmployeeHighestSalary,
  templateClassicEmployeeAvgByDept,
  templateClassicEmployeeCountByDept,
  templateClassicEmployeeNamesByDept,
  templateClassicEmployeeTopEarners,
  templateClassicEmployeeDeptTotal,
  templateClassicEmployeeJoinNames,
  templateClassicEmployeeSalaryThreshold
];

const DIFFICULTY_WEIGHTS = [
  { key: "Beginner", weight: 0.35 },
  { key: "Intermediate", weight: 0.4 },
  { key: "Advanced", weight: 0.2 },
  { key: "Expert", weight: 0.05 }
];

function pickDifficulty(rng) {
  const roll = rng();
  let cursor = 0;
  for (const entry of DIFFICULTY_WEIGHTS) {
    cursor += entry.weight;
    if (roll <= cursor) {
      return entry.key;
    }
  }
  return "Beginner";
}

const TEMPLATE_SETS = {
  Beginner: [templateFilterEven, templateMapSquares, templateSumNumbers, templateDistinctSorted],
  Intermediate: [templateUppercasePrefix, templateJoinFiltered, templateFlatMapTags, templateSkipLimit, templateAnyMatchDivisible],
  Advanced: [templateGroupByFirstLetter, templateAdjacentPairSum, templateTopFrequentWords, templateMaxSalaryName, templatePartitionByThreshold],
  Expert: [templateCustomCollectorPipe]
};

function buildProblemSeed(targetCount = 500) {
  const safeCount = Math.max(50, targetCount);
  const classicCount = Math.min(100, safeCount);
  const problems = [];
  const worldCounters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (let index = 0; index < safeCount; index += 1) {
    const rng = rngFor(index);
    let problem;
    let difficulty;
    if (index < classicCount) {
      const template = CLASSIC_TEMPLATES[index % CLASSIC_TEMPLATES.length];
      const variant = Math.floor(index / CLASSIC_TEMPLATES.length) + 1;
      problem = template({ index, rng, variant });
      difficulty = problem.difficulty || pickDifficulty(rng);
    } else {
      difficulty = pickDifficulty(rng);
      const templateList = TEMPLATE_SETS[difficulty] || TEMPLATE_SETS.Beginner;
      const template = templateList[index % templateList.length];
      problem = template({ index, rng, difficulty });
    }
    problem.acceptanceRate = acceptanceRateForDifficulty(difficulty, rng);
    problem.popularity = Math.max(5, 100 - (index % 90));
    const worldNumber = (index % 5) + 1;
    worldCounters[worldNumber] += 1;
    problems.push({
      ...problem,
      world: WORLD_NAMES[worldNumber],
      worldNumber,
      levelNumber: index + 1,
      worldLevelNumber: worldCounters[worldNumber],
      timeLimitMs: 5000,
      memoryLimitMb: 128,
      isPracticeFeatured: index % 9 === 0,
      isChallengeFeatured: index % 11 === 0
    });
  }

  return problems;
}

function buildAchievementSeed() {
  return [
    { key: "first_solve", name: "First Stream", description: "Solve your first StreamQuest level", badgeColor: "green", xpBonus: 20 },
    { key: "streak_3", name: "3-Day Streak", description: "Solve levels on 3 consecutive days", badgeColor: "blue", xpBonus: 30 },
    { key: "streak_7", name: "7-Day Streak", description: "Maintain a 7-day streak", badgeColor: "violet", xpBonus: 70 },
    { key: "ten_solves", name: "Top 10", description: "Complete 10 levels", badgeColor: "orange", xpBonus: 40 },
    { key: "fifty_solves", name: "Half-Century", description: "Complete 50 levels", badgeColor: "gold", xpBonus: 120 },
    { key: "world_1_master", name: "World 1 Master", description: "Complete all levels in World 1", badgeColor: "cyan", xpBonus: 60 },
    { key: "world_5_master", name: "Parallel Boss", description: "Complete all levels in World 5", badgeColor: "red", xpBonus: 150 }
  ];
}

module.exports = {
  WORLD_NAMES,
  buildProblemSeed,
  buildAchievementSeed
};
