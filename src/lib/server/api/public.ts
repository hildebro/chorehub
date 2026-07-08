import { zValidator } from '@hono/zod-validator';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { Readable } from 'node:stream';
import zlib from 'node:zlib';
import tar from 'tar-stream';
import { dev } from '$app/environment';
import { SESSION_COOKIE } from '$lib';
import { getLoggedInUser } from '$lib/server/auth';
import { adminDb } from '$lib/server/db';
import { addHousehold, addUser, createSession, findAllUsers, findAndVerifyUser } from '$lib/server/db/functions';
import { Admin } from '$lib/utils/userHelper';
import { z } from '$lib/zod';

const initiateSchema = z.object({
  householdName: z.string().trim().nonempty(),
  username: z.string().trim().nonempty(),
  password: z.string().min(6).max(64)
});

const loginSchema = z.object({
  householdName: z.string().trim().nonempty(),
  username: z.string().trim(),
  password: z.string()
});

const importSchema = z.object({
  dumpFile: z.file().mime(['application/gzip']).nonoptional()
});

const publicRouter = new Hono()
  .get('/version', async (c) => {
    const serverVersion = __APP_VERSION__;
    const res = await fetch('https://api.github.com/repos/hildebro/laneh/releases/latest');

    if (!res.ok) {
      return c.json({ remoteVersion: '?', serverVersion });
    }

    const data = await res.json();
    const remoteVersion = data.tag_name.replace('v', '') as string;

    return c.json({ remoteVersion, serverVersion });
  })
  .get('/needsInitiation', async (c) => {
    const users = await findAllUsers();
    return c.json(users.length === 0);
  })
  .post('/initiate', zValidator('json', initiateSchema), async (c) => {
    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const initiateData = c.req.valid('json');

    const householdId = await addHousehold(initiateData.householdName);
    const userId = await addUser(initiateData.username, initiateData.password, householdId, Admin.Server);

    const session = await createSession(userId);
    setCookie(c, SESSION_COOKIE, session.id, {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'Lax',
      expires: session.expiresAt
    });

    return c.json({ success: true });
  })
  .post('/importDatabase', zValidator('form', importSchema), async (c) => {
    const users = await findAllUsers();
    if (users.length > 0) {
      return c.json({ success: false }, 405);
    }

    const importFile = c.req.valid('form');

    // Convert the uploaded file to a Node Buffer
    const arrayBuffer = await importFile.dumpFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const queries: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const extract = tar.extract();

      extract.on('entry', (header, stream, next) => {
        // Only process .sql files
        if (!header.name.endsWith('.sql')) {
          stream.on('end', () => next());
          stream.resume();

          return;
        }

        let sqlContent = '';
        stream.on('data', (chunk) => {
          sqlContent += chunk;
        });
        stream.on('end', () => {
          if (sqlContent.trim()) queries.push(sqlContent);
          next();
        });
      });

      extract.on('finish', () => resolve());
      extract.on('error', (err) => reject(err));

      // Pipe the buffer through gunzip and into the tar extractor
      Readable.from(buffer).pipe(zlib.createGunzip()).pipe(extract);
    });

    const db = adminDb;
    try {
      // Temporarily disable foreign key constraints and triggers for the import
      await db.execute(sql`SET session_replication_role = replica;`);

      for (const query of queries) {
        await db.execute(sql.raw(query));
      }
    } finally {
      await db.execute(sql`SET session_replication_role = origin;`);
    }

    return c.json({ success: true });
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const user = c.req.valid('json');

    const matchingUser = await findAndVerifyUser(user.username, user.password, user.householdName);
    if (!matchingUser) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['form'],
          message: 'auth_login_invalid'
        }
      ]);

      return c.json({ success: false, error }, 400);
    }

    const session = await createSession(matchingUser.id);
    setCookie(c, SESSION_COOKIE, session.id, {
      path: '/',
      httpOnly: true,
      secure: !dev,
      sameSite: 'Lax',
      expires: session.expiresAt
    });

    return c.json(session.id);
  })
  .get('/loggedInUser', async (c) => {
    const user = await getLoggedInUser(c);
    if (!user) {
      return c.json(null);
    }

    return c.json({
      id: user.id,
      username: user.username,
      admin: user.admin,
      helpDisclaimerDismissed: user.helpDisclaimerDismissed
    });
  })
  .get('/marco', async (c) => {
    return c.json('polo');
  })
;

export default publicRouter;
