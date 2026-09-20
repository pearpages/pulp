---
'@pearpages/pulp-react': patch
---

The build raises Node's heap for the declaration step. With 45 entries the single tsup dts worker exceeded the default limit and the build failed with `ERR_WORKER_OUT_OF_MEMORY` right after a successful esbuild pass, which reads like a broken type but is a count-of-entries ceiling.
