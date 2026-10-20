// `yarn dev`: rebuild on save, restart the server, reload the browser.
//
// Uses the esbuild already in dependencies (same options as the build:client /
// build:server scripts) in watch mode, runs `node build/server.js` as a child
// process, and serves a tiny Server-Sent Events endpoint that the page connects
// to. server/server.jsx only injects that connection when LIVE_RELOAD_PORT is
// set, which only this script does, so production output is unaffected.

const http = require("http");
const path = require("path");
const { spawn } = require("child_process");
const esbuild = require("esbuild");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 3000);
const LIVE_RELOAD_PORT = Number(process.env.LIVE_RELOAD_PORT || 35729);

const log = (msg) =>
  console.log(`[dev ${new Date().toLocaleTimeString()}] ${msg}`);

// --- Live-reload endpoint ---------------------------------------------------

const clients = new Set();

const liveReload = http.createServer((req, res) => {
  if (req.url !== "/livereload") {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    // The page is served from the app port, so this is a cross-origin request.
    "Access-Control-Allow-Origin": "*",
  });
  res.write(": connected\n\n");
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

const reloadBrowsers = (why) => {
  for (const res of clients) res.write(`event: reload\ndata: ${why}\n\n`);
  if (clients.size) log(`reloading ${clients.size} browser(s) (${why})`);
};

// --- Express server child ---------------------------------------------------

let server = null;

const stopServer = () =>
  new Promise((resolve) => {
    if (!server || server.exitCode !== null) return resolve();
    server.once("exit", resolve);
    server.kill("SIGTERM");
  });

// Resolves once the server prints its "listening" line, so reloaded browsers
// don't hit a connection refused.
const startServer = () =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, ["build/server.js"], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT), LIVE_RELOAD_PORT: String(LIVE_RELOAD_PORT) },
      stdio: ["ignore", "pipe", "inherit"],
    });
    server = child;
    let ready = false;
    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      if (!ready && /listening/i.test(chunk.toString())) {
        ready = true;
        resolve();
      }
    });
    child.on("exit", (code, signal) => {
      if (!ready) resolve();
      if (child === server && signal !== "SIGTERM") {
        log(`server exited (${signal || `code ${code}`}); waiting for changes`);
      }
    });
  });

const restartServer = async () => {
  await stopServer();
  await startServer();
};

// --- esbuild watchers -------------------------------------------------------

const formatErrors = (errors) =>
  esbuild
    .formatMessagesSync(errors, { kind: "error", color: true })
    .join("\n");

const watch = (name, options, onSuccess) =>
  esbuild
    .build({
      ...options,
      bundle: true,
      absWorkingDir: ROOT,
      logLevel: "silent",
      watch: {
        onRebuild(error) {
          if (error) {
            log(`${name} build failed:`);
            console.error(formatErrors(error.errors));
            return;
          }
          log(`${name} rebuilt`);
          onSuccess();
        },
      },
    })
    .then((result) => {
      log(`${name} built`);
      return result;
    })
    .catch((error) => {
      // esbuild 0.14 stops watching if the very first build fails.
      log(`${name} initial build failed; fix the error and run \`yarn dev\` again:`);
      console.error(formatErrors(error.errors || []));
      process.exit(1);
    });

let shuttingDown = false;
let results = [];

const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  log("shutting down");
  results.forEach((r) => r && r.stop && r.stop());
  for (const res of clients) res.end();
  liveReload.close();
  await stopServer();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const main = async () => {
  await new Promise((resolve, reject) => {
    liveReload.once("error", reject);
    liveReload.listen(LIVE_RELOAD_PORT, resolve);
  });

  // Serialise server restarts so rapid saves can't leave two servers racing.
  let restarting = Promise.resolve();

  // A change under src/ rebuilds both bundles (the server renders <App>), so
  // coalesce them into one reload, sent once any restart has finished.
  const reasons = new Set();
  let reloadTimer = null;
  const scheduleReload = (why) => {
    reasons.add(why);
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      restarting.then(() => {
        // Don't reload into a crashed server; its next rebuild will.
        if (!reasons.size || !server || server.exitCode !== null) return;
        const what = [...reasons].join("+");
        reasons.clear();
        reloadBrowsers(what);
      });
    }, 300);
  };

  const onServerRebuilt = () => {
    restarting = restarting.then(restartServer);
    scheduleReload("server");
  };

  results = await Promise.all([
    watch(
      "client",
      {
        entryPoints: ["src/index.js"],
        outfile: "dist/bundle.js",
        loader: { ".js": "jsx" },
      },
      // The server re-hashes the bundle per request in dev, so no restart.
      () => scheduleReload("client")
    ),
    watch(
      "server",
      {
        entryPoints: ["server/server.jsx"],
        outfile: "build/server.js",
        platform: "node",
      },
      onServerRebuilt
    ),
  ]);

  await startServer();
  log(`app: http://localhost:${PORT}  (live reload on :${LIVE_RELOAD_PORT})`);
};

main().catch((error) => {
  console.error(error);
  shutdown();
});
