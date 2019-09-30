/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// @flow

// In this router we implement the services required by the dockerflow mozilla
// best practices, as described in https://github.com/mozilla-services/Dockerflow.

import Router from '@koa/router';
import fs from 'fs';
import path from 'path';

export function dockerFlowRoutes() {
  const router = new Router();

  // "Respond to /__version__ with the contents of /app/version.json."
  // This file is generated by the script bin/generate-verison-file.js at build
  // time in CircleCI and lives in dist/version.json.
  // We serve it directly if present, otherwise returns a 404.
  router.get('/__version__', async ctx => {
    // We use path.join with __dirname so that the path doesn't depend on the
    // current working directory.
    // And we prefer it over require.resolve or path.resolve because they're not
    // easy to mock in tests (maybe impossible). Also path.join does no
    // filesystem access so it's probably faster than them.
    const fileName = path.join(__dirname, '../../dist/version.json');

    try {
      const content = await fs.promises.readFile(fileName);
      ctx.body = content;
      ctx.type = 'json';
    } catch (e) {
      if (e.code === 'ENOENT') {
        // ENOENT means "No such file or directory"
        ctx.status = 500;
        ctx.body = {
          error: "The version file couldn't be found",
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          error: `Unexpected error while retrieving the version file: ${e.message}`,
        };
        console.error('Unexpected error while retrieving the version file.', e);
      }
    }
  });

  // "Respond to /__heartbeat__ with a HTTP 200 or 5xx on error. This should
  // check backing services like a database for connectivity and may respond
  // with the status of backing services and application components as a JSON
  // payload."
  router.get('/__heartbeat__', ctx => {
    // TODO Later we'll need to ping back-end services like google storage.
    ctx.body = 'OK';
  });

  //
  // "Respond to /__lbheartbeat__ with an HTTP 200. This is for load balancer
  // checks and should not check backing services."
  router.get('/__lbheartbeat__', ctx => {
    ctx.body = 'OK';
  });

  return router;
}
