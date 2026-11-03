/**
 * Architecture rules of architecture.md section 4, checked on every pull request.
 * A violation fails CI.
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "module-public-api",
      comment:
        "Rule 1: a module imports another module only through its index.ts. " +
        "Never import another module's files, schema or repository.",
      severity: "error",
      from: { path: "^packages/core/src/([^/]+)/" },
      to: {
        path: "^packages/core/src/[^/]+/",
        pathNot: ["^packages/core/src/$1/", "^packages/core/src/[^/]+/index\\.ts$"],
      },
    },
    {
      name: "erp-port-only-in-integration",
      comment:
        "Rule 2 (T3-D-005, T3-AC-001): only the integration module depends on the ERP port. " +
        "Other modules call the integration module's public API.",
      severity: "error",
      from: {
        path: "^(packages|apps)/",
        pathNot: ["^packages/core/src/integration/", "^packages/erp-"],
      },
      to: { path: "^packages/erp-port/" },
    },
    {
      name: "adapter-only-in-runtime-units",
      comment:
        "Rule 2: only apps/worker and apps/integration-gateway load an ERP adapter " +
        "(erp-nav, erp-fake, erp-bc). Tests of the integration module may use erp-fake.",
      severity: "error",
      from: {
        path: "^(packages|apps)/",
        pathNot: [
          "^apps/(worker|integration-gateway)/",
          "^packages/erp-",
          "^packages/core/src/integration/.+\\.test\\.ts$",
        ],
      },
      to: { path: "^packages/erp-(nav|fake|bc)/" },
    },
    {
      name: "core-is-framework-free",
      comment: "Rule 3: packages/core does not import an app, the web framework or the HTTP layer.",
      severity: "error",
      from: { path: "^packages/core/" },
      to: {
        path: ["^apps/", "node_modules/(react|react-dom|@tanstack|hono|express|fastify|h3|vinxi)/"],
      },
    },
    {
      name: "kernel-is-the-base",
      comment: "kernel is the shared base. It imports no other module.",
      severity: "error",
      from: { path: "^packages/core/src/kernel/" },
      to: { path: "^packages/core/src/(?!kernel/)[^/]+/" },
    },
    {
      name: "no-module-cycles",
      comment:
        "Rule 4: modules react to each other through events. A cycle between modules means " +
        "one module calls back into another; publish an event instead.",
      severity: "error",
      from: { path: "^packages/core/src/" },
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { exportsFields: ["exports"], conditionNames: ["import", "default"] },
  },
};
