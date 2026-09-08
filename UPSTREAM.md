# Upstream maintenance

This repository is a maintained fork of [`bpmn-io/dmn-moddle`](https://github.com/bpmn-io/dmn-moddle).

Its purpose is to provide standards-based DMN 1.5 model and XML support while staying as close as practical to upstream. The fork is shared infrastructure for projects such as Atlas and Temis; it must not contain product-specific behavior from either project.

## Upstream

- Repository: `https://github.com/bpmn-io/dmn-moddle.git`
- Upstream default branch: `main`
- Fork repository: `https://github.com/pblumer/dmn-moddle.git`
- Fork default branch: `main`

For a local checkout, configure the remotes as follows:

```bash
git remote -v
git remote add upstream https://github.com/bpmn-io/dmn-moddle.git
git fetch upstream
```

If an `upstream` remote already exists, do not add it again.

## Fork scope

Changes maintained in this fork should be limited to generic DMN concerns, primarily:

- DMN 1.5 metamodel descriptors and namespaces;
- DMN 1.5 XML import and export;
- backwards-compatible reading of supported older DMN versions where practical;
- lossless semantic round-tripping;
- DMNDI preservation;
- tests and fixtures required to prove the above.

This repository must **not** contain:

- Atlas project, deployment, storage, or BusinessRuleTask behavior;
- Temis runtime or evaluation behavior;
- FEEL evaluation implementations;
- application-specific extensions that are not part of a documented DMN extension mechanism.

The integration contract with consuming applications is DMN XML and the public moddle API.

## Source of truth

The OMG DMN specification defines the normative behavior of the metamodel and XML format.

Temis may be used as a compatibility oracle and as a source of representative DMN 1.5 fixtures, but Temis-specific implementation details are not authoritative for this fork.

## Keeping the fork current

Before starting a feature, fetch upstream and integrate the latest upstream default branch:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

Resolve conflicts in favor of preserving upstream behavior unless the conflicting code is intentionally required for DMN 1.5 support.

Do not mix unrelated refactoring with an upstream sync or a DMN 1.5 feature change.

After synchronization, run the upstream verification suite before adding fork-specific changes:

```bash
npm ci
npm run all
```

## Development policy

Prefer small, independently reviewable changes.

For DMN 1.5 work:

1. add or identify a failing DMN 1.5 fixture/test;
2. implement the smallest metamodel or serialization change that makes it pass;
3. verify that existing upstream tests remain green;
4. add round-trip coverage where the change affects XML;
5. verify that DMNDI is preserved where applicable.

A feature is not complete merely because XML parses. The expected baseline is:

```text
DMN XML -> moddle model -> DMN XML -> moddle model
```

without loss of supported semantic information.

## Upstream contribution policy

Generic improvements should be structured so they can be proposed back to `bpmn-io/dmn-moddle` as focused pull requests.

When possible:

- keep upstreamable commits free of `pblumer`, Atlas, or Temis-specific naming;
- avoid broad formatting changes;
- separate compatibility infrastructure from individual DMN features;
- retain upstream coding style and test conventions;
- reference relevant OMG DMN specification sections in non-trivial changes.

The long-term goal is to reduce the fork delta if upstream adopts the required DMN 1.5 support.

## Versioning and dependencies

Consumers must pin an explicit released version, tag, or commit of this fork. Do not depend on a floating branch for reproducible Atlas or Temis builds.

When `pblumer/dmn-js` depends on this fork, the dependency update should identify the exact `dmn-moddle` revision it was tested against.

## Licensing

`dmn-moddle` is MIT licensed. Preserve the upstream license, copyright notices, attribution, and third-party notices when modifying or redistributing the fork.
