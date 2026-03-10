function escapeJavaString(input) {
  return String(input || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function buildRunnerSource(testCases, timeoutMs) {
  const cases = (testCases || [])
    .map((testCase, index) => {
      const assertion = testCase.assertion || "false";
      const message = escapeJavaString(testCase.message || `Test ${index + 1} failed`);
      return [
        "        total++;",
        "        try {",
        `            if (${assertion}) {`,
        "                passed++;",
        "            } else {",
        `                failures.add("${message}");`,
        "            }",
        "        } catch (Throwable testError) {",
        `            failures.add("${message}" + " (error: " + testError.getClass().getSimpleName() + ")");`,
        "        }"
      ].join("\n");
    })
    .join("\n");

  return `import java.util.*;
import java.util.concurrent.*;
public class Runner {
    public static void main(String[] args) {
        List<String> failures = new ArrayList<>();
        Object result = null;
        int total = 0;
        int passed = 0;
        long started = System.nanoTime();
        long maxRuntimeMs = ${Number(timeoutMs) > 0 ? Number(timeoutMs) : 5000};
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<Object> future = null;

        try {
            future = executor.submit(Solution::solve);
            result = future.get(maxRuntimeMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException timeoutError) {
            System.out.println("__EXEC_TIMEOUT__");
            if (future != null) {
                future.cancel(true);
            }
            executor.shutdownNow();
            System.exit(124);
            return;
        } catch (ExecutionException executionError) {
            Throwable runtimeError = executionError.getCause();
            String runtimeMessage = runtimeError == null ? "Unknown runtime error" : String.valueOf(runtimeError.getMessage());
            String runtimeName = runtimeError == null ? "RuntimeException" : runtimeError.getClass().getSimpleName();
            System.out.println("__RUNTIME_ERROR__:" + runtimeName + ":" + runtimeMessage);
            executor.shutdownNow();
            return;
        } catch (Throwable runtimeError) {
            System.out.println("__RUNTIME_ERROR__:" + runtimeError.getClass().getSimpleName() + ":" + runtimeError.getMessage());
            executor.shutdownNow();
            return;
        } finally {
            executor.shutdownNow();
        }

${cases}

        long elapsed = (System.nanoTime() - started) / 1000000L;
        System.out.println("__RESULT__:" + passed + ":" + total);
        if (failures.isEmpty()) {
            System.out.println("__PASS__");
        } else {
            for (String failure : failures) {
                System.out.println("__FAIL__:" + failure);
            }
        }
        System.out.println("__RETURN__:" + String.valueOf(result));
        System.out.println("__TIME_MS__:" + elapsed);
    }
}`;
}

module.exports = {
  buildRunnerSource
};
