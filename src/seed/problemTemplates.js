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

const TOPICS_BY_WORLD = {
  1: ["Filtering", "Mapping", "Collecting", "Distinct operations", "Sorting", "Optional handling"],
  2: ["Filtering", "Mapping", "Flat Mapping", "Stream chaining", "Functional composition"],
  3: ["Reduction", "Aggregation", "Grouping", "Collecting", "Custom collectors"],
  4: ["Complex pipelines", "Limit and skip operations", "Sorting", "Reduction", "Aggregation"],
  5: ["Parallel streams", "Performance optimization", "Custom collectors", "Complex pipelines"]
};

function hintStepsFromHint(hint, instruction) {
  return [
    `Start by identifying the source stream for this task.`,
    `Use this operation as a key step: ${hint}`,
    `Pipeline goal: ${instruction}. Keep the stream immutable and readable.`
  ];
}

function defaultEditorial(instruction, hint) {
  return [
    `Think of the problem as a data pipeline: source -> transformation -> terminal operation.`,
    `For this challenge, a strong approach is to anchor around ${hint}.`,
    `Keep each stream step focused and avoid mutable shared state, especially in larger pipelines.`,
    `Task objective: ${instruction}.`
  ].join("\n\n");
}

function makeProblem({
  worldNumber,
  title,
  difficulty,
  constants,
  instruction,
  hint,
  expectedOutput,
  assertion,
  xpReward = 40,
  extraTests = [],
  imports,
  topic
}) {
  return {
    worldNumber,
    title,
    difficulty,
    topic,
    tags: topic ? [topic, "Stream API"] : ["Stream API"],
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
    acceptanceRate: 55,
    popularity: 50,
    expectedOutput,
    sampleTests: [{ assertion, message: "Sample test failed" }],
    testCases: [{ assertion, message: "Hidden test failed" }, ...extraTests],
    xpReward,
    isPracticeFeatured: false,
    isChallengeFeatured: false
  };
}

const WORLD_NAMES = {
  1: "World 1: Basic Streams",
  2: "World 2: Filtering & Mapping",
  3: "World 3: Collectors",
  4: "World 4: Advanced Stream Operations",
  5: "World 5: Parallel Streams"
};

const BASE_PROBLEMS = [
  makeProblem({
    worldNumber: 1,
    title: "Even Number Scout",
    difficulty: "Beginner",
    topic: "Filtering",
    constants: '    private static final List<Integer> NUMBERS = List.of(1,2,3,4,5,6,7,8,9,10);\n',
    instruction: "Return a List<Integer> containing only even numbers from NUMBERS",
    hint: "Use filter(n -> n % 2 == 0)",
    expectedOutput: "[2, 4, 6, 8, 10]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(2,4,6,8,10))",
    xpReward: 35
  }),
  makeProblem({
    worldNumber: 1,
    title: "Square Forge",
    difficulty: "Beginner",
    topic: "Mapping",
    constants: '    private static final List<Integer> NUMBERS = List.of(1,2,3,4,5);\n',
    instruction: "Return a List<Integer> containing squares of NUMBERS",
    hint: "Use map(n -> n * n)",
    expectedOutput: "[1, 4, 9, 16, 25]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(1,4,9,16,25))",
    xpReward: 35
  }),
  makeProblem({
    worldNumber: 1,
    title: "Reduce to Total",
    difficulty: "Beginner",
    topic: "Reduction",
    constants: '    private static final List<Integer> NUMBERS = List.of(5,10,15,20);\n',
    instruction: "Return the sum of NUMBERS as Integer",
    hint: "Use reduce(0, Integer::sum)",
    expectedOutput: "50",
    assertion: "(result instanceof Integer) && ((Integer)result) == 50",
    xpReward: 35
  }),
  makeProblem({
    worldNumber: 1,
    title: "Long Word Counter",
    difficulty: "Beginner",
    topic: "Filtering",
    constants: '    private static final List<String> WORDS = List.of(\"stream\",\"api\",\"java\",\"lambda\",\"map\",\"filter\");\n',
    instruction: "Return count of words where length is at least 5 as Long",
    hint: "Use filter and count",
    expectedOutput: "3",
    assertion: "(result instanceof Long) && ((Long)result) == 3L",
    xpReward: 35
  }),
  makeProblem({
    worldNumber: 1,
    title: "Distinct Sorter",
    difficulty: "Beginner",
    topic: "Distinct operations",
    constants: '    private static final List<Integer> NUMBERS = List.of(4,2,5,2,1,4,3,3);\n',
    instruction: "Return distinct NUMBERS sorted ascending as List<Integer>",
    hint: "Use distinct() then sorted()",
    expectedOutput: "[1, 2, 3, 4, 5]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(1,2,3,4,5))",
    xpReward: 35
  }),
  makeProblem({
    worldNumber: 1,
    title: "First Match Finder",
    difficulty: "Beginner",
    topic: "Optional handling",
    constants: '    private static final List<String> WORDS = List.of(\"java\",\"stream\",\"collector\",\"sum\");\n',
    instruction: "Return first word starting with 's' or empty string",
    hint: "Use findFirst().orElse(\"\")",
    expectedOutput: "stream",
    assertion: "(result instanceof String) && result.equals(\"stream\")",
    xpReward: 35
  }),
  makeProblem({
    worldNumber: 2,
    title: "Uppercase A-Team",
    difficulty: "Intermediate",
    topic: "Filtering",
    constants: '    private static final List<String> WORDS = List.of(\"apple\",\"banana\",\"apricot\",\"mango\");\n',
    instruction: "Return uppercase words that start with 'a'",
    hint: "filter + map(String::toUpperCase)",
    expectedOutput: "[APPLE, APRICOT]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(\"APPLE\",\"APRICOT\"))",
    xpReward: 45
  }),
  makeProblem({
    worldNumber: 2,
    title: "Name Length Mapper",
    difficulty: "Intermediate",
    topic: "Mapping",
    constants: '    private static final List<String> NAMES = List.of(\"Ivy\",\"Zed\",\"Luna\",\"Nova\");\n',
    instruction: "Return list of name lengths",
    hint: "map(String::length)",
    expectedOutput: "[3, 3, 4, 4]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(3,3,4,4))",
    xpReward: 45
  }),
  makeProblem({
    worldNumber: 2,
    title: "Tag Flattener",
    difficulty: "Intermediate",
    topic: "Flat Mapping",
    constants:
      '    private static final List<List<String>> TAGS = List.of(List.of("java","stream"), List.of("collector"), List.of("map","flatMap"));\n',
    instruction: "Flatten TAGS into a single List<String>",
    hint: "Use flatMap(List::stream)",
    expectedOutput: "[java, stream, collector, map, flatMap]",
    assertion:
      "(result instanceof java.util.List) && result.equals(java.util.List.of(\"java\",\"stream\",\"collector\",\"map\",\"flatMap\"))",
    xpReward: 45
  }),
  makeProblem({
    worldNumber: 2,
    title: "Filter and Join",
    difficulty: "Intermediate",
    topic: "Collecting",
    constants: '    private static final List<String> WORDS = List.of(\"api\",\"stream\",\"map\",\"filter\",\"zip\");\n',
    instruction: "Filter words with length >= 4 and join with comma",
    hint: "Collectors.joining(\",\")",
    expectedOutput: "stream,filter",
    assertion: "(result instanceof String) && result.equals(\"stream,filter\")",
    xpReward: 45
  }),
  makeProblem({
    worldNumber: 2,
    title: "Null Cleaner",
    difficulty: "Intermediate",
    topic: "Stream chaining",
    constants: '    private static final List<String> RAW = Arrays.asList("  alpha ", null, "", " beta", "   ", "gamma  ");\n',
    instruction: "Remove nulls, trim values, and keep non-empty strings",
    hint: "filter non-null, map trim, filter not empty",
    expectedOutput: "[alpha, beta, gamma]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(\"alpha\",\"beta\",\"gamma\"))",
    xpReward: 45
  }),
  makeProblem({
    worldNumber: 2,
    title: "Positive Doubler",
    difficulty: "Intermediate",
    topic: "Functional composition",
    constants: '    private static final List<Integer> NUMBERS = List.of(-2,0,1,2,3,-4);\n',
    instruction: "Filter positive integers and return each multiplied by 2",
    hint: "filter(n -> n > 0).map(n -> n * 2)",
    expectedOutput: "[2, 4, 6]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(2,4,6))",
    xpReward: 45
  }),
  makeProblem({
    worldNumber: 3,
    title: "Department Grouping",
    difficulty: "Intermediate",
    topic: "Grouping",
    imports: "import java.util.*;\nimport java.util.stream.*;",
    constants:
      "    static class Emp { String name; String dept; Emp(String n, String d){name=n;dept=d;} }\n" +
      "    private static final List<Emp> EMPLOYEES = List.of(new Emp(\"Ava\",\"Eng\"), new Emp(\"Ben\",\"Design\"), new Emp(\"Kai\",\"Eng\"));\n",
    instruction: "Return Map<String, List<String>> grouped by department name",
    hint: "groupingBy(Emp::dept) with mapping to names",
    expectedOutput: "{Design=[Ben], Eng=[Ava, Kai]}",
    assertion:
      "(result instanceof java.util.Map) && ((java.util.Map)result).get(\"Eng\").equals(java.util.List.of(\"Ava\",\"Kai\"))",
    xpReward: 55
  }),
  makeProblem({
    worldNumber: 3,
    title: "Department Counter",
    difficulty: "Intermediate",
    topic: "Aggregation",
    imports: "import java.util.*;\nimport java.util.stream.*;",
    constants:
      "    static class Emp { String dept; Emp(String d){dept=d;} }\n" +
      "    private static final List<Emp> EMPLOYEES = List.of(new Emp(\"Eng\"),new Emp(\"Eng\"),new Emp(\"Design\"),new Emp(\"QA\"));\n",
    instruction: "Return Map<String, Long> counts per department",
    hint: "Collectors.groupingBy + counting",
    expectedOutput: "{Eng=2, Design=1, QA=1}",
    assertion: "(result instanceof java.util.Map) && ((java.util.Map)result).get(\"Eng\").equals(2L)",
    xpReward: 55
  }),
  makeProblem({
    worldNumber: 3,
    title: "Highest Salary Hunter",
    difficulty: "Advanced",
    topic: "Reduction",
    imports: "import java.util.*;\nimport java.util.stream.*;",
    constants:
      "    static class Emp { String name; int salary; Emp(String n, int s){name=n;salary=s;} }\n" +
      "    private static final List<Emp> EMPLOYEES = List.of(new Emp(\"Asha\",80000),new Emp(\"Ravi\",95000),new Emp(\"Mira\",90000));\n",
    instruction: "Return employee name with max salary",
    hint: "Use max(Comparator.comparingInt(...))",
    expectedOutput: "Ravi",
    assertion: "(result instanceof String) && result.equals(\"Ravi\")",
    xpReward: 55
  }),
  makeProblem({
    worldNumber: 3,
    title: "ID to Name Map",
    difficulty: "Intermediate",
    topic: "Collecting",
    imports: "import java.util.*;\nimport java.util.stream.*;",
    constants:
      "    static class Emp { int id; String name; Emp(int i, String n){id=i;name=n;} }\n" +
      "    private static final List<Emp> EMPLOYEES = List.of(new Emp(1,\"Lia\"),new Emp(2,\"Noah\"),new Emp(3,\"Zane\"));\n",
    instruction: "Return Map<Integer, String> mapping id to name",
    hint: "Use toMap(e -> e.id, e -> e.name)",
    expectedOutput: "{1=Lia, 2=Noah, 3=Zane}",
    assertion: "(result instanceof java.util.Map) && ((java.util.Map)result).get(2).equals(\"Noah\")",
    xpReward: 55
  }),
  makeProblem({
    worldNumber: 3,
    title: "Pass/Fail Partitioner",
    difficulty: "Intermediate",
    topic: "Grouping",
    constants: '    private static final List<Integer> SCORES = List.of(40,55,72,33,91,50);\n',
    instruction: "Return partitioned map where key true has scores >= 50",
    hint: "Collectors.partitioningBy(score -> score >= 50)",
    expectedOutput: "{false=[40, 33], true=[55, 72, 91, 50]}",
    assertion:
      "(result instanceof java.util.Map) && ((java.util.Map)result).get(true).equals(java.util.List.of(55,72,91,50))",
    xpReward: 55
  }),
  makeProblem({
    worldNumber: 3,
    title: "Salary Summary Stats",
    difficulty: "Advanced",
    topic: "Aggregation",
    constants: '    private static final List<Integer> SALARIES = List.of(3000,4500,4000,5500);\n',
    instruction: "Return IntSummaryStatistics for SALARIES",
    hint: "mapToInt(Integer::intValue).summaryStatistics()",
    expectedOutput: "count=4,sum=17000,min=3000,max=5500",
    assertion:
      "(result instanceof java.util.IntSummaryStatistics) && ((java.util.IntSummaryStatistics)result).getSum() == 17000",
    xpReward: 55
  }),
  makeProblem({
    worldNumber: 4,
    title: "Skip and Limit Window",
    difficulty: "Advanced",
    topic: "Limit and skip operations",
    constants: '    private static final List<Integer> NUMBERS = List.of(10,20,30,40,50,60,70);\n',
    instruction: "Skip first 2 and return next 4 numbers",
    hint: "skip(2).limit(4)",
    expectedOutput: "[30, 40, 50, 60]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(30,40,50,60))",
    xpReward: 65
  }),
  makeProblem({
    worldNumber: 4,
    title: "Adjacent Pair Sum",
    difficulty: "Advanced",
    topic: "Complex pipelines",
    constants: '    private static final List<Integer> NUMBERS = List.of(3,5,8,13);\n',
    instruction: "Return list of adjacent pair sums [a0+a1, a1+a2, ...]",
    hint: "Use IntStream.range(0, size - 1)",
    expectedOutput: "[8, 13, 21]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(8,13,21))",
    xpReward: 65
  }),
  makeProblem({
    worldNumber: 4,
    title: "Top Frequent Words",
    difficulty: "Expert",
    topic: "Sorting",
    constants:
      '    private static final List<String> WORDS = List.of("java","stream","java","api","stream","java","map","stream","api");\n',
    instruction: "Return top 3 frequent words sorted by frequency desc then alphabetic",
    hint: "Count with groupingBy then sort entries",
    expectedOutput: "[java, stream, api]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(\"java\",\"stream\",\"api\"))",
    xpReward: 65
  }),
  makeProblem({
    worldNumber: 4,
    title: "Duplicate Detector",
    difficulty: "Advanced",
    topic: "Grouping",
    constants: '    private static final List<Integer> NUMBERS = List.of(4,1,2,2,3,4,5,5,5,6);\n',
    instruction: "Return sorted numbers that appear more than once",
    hint: "Group and count, then filter count > 1",
    expectedOutput: "[2, 4, 5]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(2,4,5))",
    xpReward: 65
  }),
  makeProblem({
    worldNumber: 4,
    title: "Longest Word Survivor",
    difficulty: "Advanced",
    topic: "Reduction",
    constants: '    private static final List<String> WORDS = List.of("stream","collector","api","parallel");\n',
    instruction: "Return the longest word using reduce",
    hint: "Use reduce((a,b) -> a.length() >= b.length() ? a : b)",
    expectedOutput: "collector",
    assertion: "(result instanceof String) && result.equals(\"collector\")",
    xpReward: 65
  }),
  makeProblem({
    worldNumber: 4,
    title: "Custom Pipe Collector",
    difficulty: "Expert",
    topic: "Custom collectors",
    constants: '    private static final List<String> WORDS = List.of("JAVA","STREAM","API");\n',
    instruction: "Return lowercase words joined with pipe symbol",
    hint: "Use Collector.of or joining after map",
    expectedOutput: "java|stream|api",
    assertion: "(result instanceof String) && result.equals(\"java|stream|api\")",
    xpReward: 65
  }),
  makeProblem({
    worldNumber: 5,
    title: "Parallel Totalizer",
    difficulty: "Advanced",
    topic: "Parallel streams",
    constants: "    private static final List<Integer> NUMBERS = java.util.stream.IntStream.rangeClosed(1, 100).boxed().toList();\n",
    instruction: "Return sum of NUMBERS using parallel stream",
    hint: "parallelStream().reduce(0, Integer::sum)",
    expectedOutput: "5050",
    assertion: "(result instanceof Integer) && ((Integer)result) == 5050",
    xpReward: 75
  }),
  makeProblem({
    worldNumber: 5,
    title: "Parallel Unique Upper",
    difficulty: "Advanced",
    topic: "Parallel streams",
    constants: '    private static final List<String> WORDS = List.of("api","stream","api","java","stream");\n',
    instruction: "Return sorted distinct uppercase words using parallel stream",
    hint: "parallelStream + map + distinct + sorted",
    expectedOutput: "[API, JAVA, STREAM]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(\"API\",\"JAVA\",\"STREAM\"))",
    xpReward: 75
  }),
  makeProblem({
    worldNumber: 5,
    title: "Concurrent Department Count",
    difficulty: "Expert",
    topic: "Parallel streams",
    constants: '    private static final List<String> DEPTS = List.of("Eng","QA","Eng","Design","Eng","QA");\n',
    instruction: "Return ConcurrentMap<String, Long> with department frequencies",
    hint: "Use groupingByConcurrent with counting",
    expectedOutput: "{Eng=3, QA=2, Design=1}",
    assertion:
      "(result instanceof java.util.Map) && ((java.util.Map)result).get(\"Eng\").equals(3L) && ((java.util.Map)result).get(\"QA\").equals(2L)",
    xpReward: 75
  }),
  makeProblem({
    worldNumber: 5,
    title: "Parallel Desc Sort",
    difficulty: "Advanced",
    topic: "Parallel streams",
    constants: '    private static final List<Integer> NUMBERS = List.of(8,3,9,1,5,7);\n',
    instruction: "Return numbers sorted descending",
    hint: "sorted(Comparator.reverseOrder())",
    expectedOutput: "[9, 8, 7, 5, 3, 1]",
    assertion: "(result instanceof java.util.List) && result.equals(java.util.List.of(9,8,7,5,3,1))",
    xpReward: 75
  }),
  makeProblem({
    worldNumber: 5,
    title: "Parallel AnyMatch Gate",
    difficulty: "Advanced",
    topic: "Parallel streams",
    constants: '    private static final List<Integer> NUMBERS = List.of(10,34,51,68,85);\n',
    instruction: "Return true if any number is divisible by 17",
    hint: "parallelStream().anyMatch(n -> n % 17 == 0)",
    expectedOutput: "true",
    assertion: "(result instanceof Boolean) && ((Boolean)result)",
    xpReward: 75
  }),
  makeProblem({
    worldNumber: 5,
    title: "Parallel Frequency Map",
    difficulty: "Expert",
    topic: "Performance optimization",
    constants: '    private static final List<String> WORDS = List.of("a","b","a","c","b","a");\n',
    instruction: "Return word frequencies as Map<String, Long>",
    hint: "groupingByConcurrent(word -> word, counting())",
    expectedOutput: "{a=3, b=2, c=1}",
    assertion:
      "(result instanceof java.util.Map) && ((java.util.Map)result).get(\"a\").equals(3L) && ((java.util.Map)result).get(\"c\").equals(1L)",
    xpReward: 75
  })
];

function cloneVariant(base, variantNumber) {
  return {
    ...base,
    title: `${base.title} (Variant ${variantNumber})`,
    description: `${base.description}\n\nVariant mission ${variantNumber}: solve the same concept with cleaner stream code.`,
    xpReward: base.xpReward + Math.min(variantNumber, 5),
    popularity: Math.max(1, base.popularity - variantNumber)
  };
}

function buildProblemSeed(targetCount = 200) {
  const grouped = new Map();
  for (let world = 1; world <= 5; world += 1) {
    grouped.set(world, []);
  }
  BASE_PROBLEMS.forEach((problem) => grouped.get(problem.worldNumber).push(problem));

  const result = [];
  const basePerWorld = Math.floor(targetCount / 5);
  let remainder = targetCount % 5;

  for (let world = 1; world <= 5; world += 1) {
    const list = grouped.get(world);
    const desired = basePerWorld + (remainder > 0 ? 1 : 0);
    remainder -= 1;

    const expanded = [...list];
    let variant = 1;
    while (expanded.length < desired) {
      const template = list[(expanded.length - list.length) % list.length];
      expanded.push(cloneVariant(template, variant));
      variant += 1;
    }

    expanded.slice(0, desired).forEach((problem, index) => {
      const worldTopics = TOPICS_BY_WORLD[world] || ["Complex pipelines"];
      const topic = problem.topic || worldTopics[index % worldTopics.length];
      const acceptanceBase =
        problem.difficulty === "Beginner" ? 74 : problem.difficulty === "Intermediate" ? 61 : problem.difficulty === "Advanced" ? 47 : 38;
      const acceptanceRate = Math.max(30, Math.min(95, acceptanceBase + ((index % 7) - 3)));
      result.push({
        ...problem,
        topic,
        tags: Array.from(new Set([...(problem.tags || []), topic])),
        acceptanceRate,
        popularity: Math.max(5, 100 - index * 2 + world * 3),
        world: WORLD_NAMES[world],
        worldNumber: world,
        worldLevelNumber: index + 1
      });
    });
  }

  return result
    .slice(0, targetCount)
    .map((problem, index) => ({
      ...problem,
      levelNumber: index + 1,
      timeLimitMs: 5000,
      memoryLimitMb: 128,
      isPracticeFeatured: index % 9 === 0,
      isChallengeFeatured: index % 11 === 0
    }));
}

function buildAchievementSeed() {
  return [
    {
      key: "first_solve",
      name: "First Stream",
      description: "Solve your first StreamQuest level",
      badgeColor: "green",
      xpBonus: 20
    },
    {
      key: "streak_3",
      name: "3-Day Streak",
      description: "Solve levels on 3 consecutive days",
      badgeColor: "blue",
      xpBonus: 30
    },
    {
      key: "streak_7",
      name: "7-Day Streak",
      description: "Maintain a 7-day streak",
      badgeColor: "violet",
      xpBonus: 70
    },
    {
      key: "ten_solves",
      name: "Top 10",
      description: "Complete 10 levels",
      badgeColor: "orange",
      xpBonus: 40
    },
    {
      key: "fifty_solves",
      name: "Half-Century",
      description: "Complete 50 levels",
      badgeColor: "gold",
      xpBonus: 120
    },
    {
      key: "world_1_master",
      name: "World 1 Master",
      description: "Complete all levels in World 1",
      badgeColor: "cyan",
      xpBonus: 60
    },
    {
      key: "world_5_master",
      name: "Parallel Boss",
      description: "Complete all levels in World 5",
      badgeColor: "red",
      xpBonus: 150
    }
  ];
}

module.exports = {
  WORLD_NAMES,
  BASE_PROBLEMS,
  buildProblemSeed,
  buildAchievementSeed
};
