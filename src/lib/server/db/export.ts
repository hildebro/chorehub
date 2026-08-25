import { getTableColumns, getTableName, type Table } from 'drizzle-orm';
import { PassThrough, Readable } from 'node:stream';
import { createGzip } from 'node:zlib';
import tar from 'tar-stream';
import { adminDb } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

function escapeSqlValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);

  // Format Dates to ISO strings for Postgres
  if (val instanceof Date) return `'${val.toISOString()}'`;

  // Escape single quotes by doubling them (standard SQL)
  return `'${String(val).replace(/'/g, '\'\'')}'`;
}

function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function generateDatabaseBackup() {
  const pack = tar.pack();
  const gzip = createGzip();

  // Create a PassThrough stream to bridge Node streams to Web streams
  const passThrough = new PassThrough();

  // Pipe the tar stream through gzip, then to the passthrough
  pack.pipe(gzip).pipe(passThrough);

  // Helper to append entries as Promises for proper backpressure handling
  const appendEntry = (name: string, content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      pack.entry({ name }, content, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  // Process tables asynchronously without blocking the stream initialization
  const processTables = async () => {
    try {
      for (const [, entity] of Object.entries(schema)) {
        let tableName: string;
        try {
          tableName = getTableName(entity as Table);
        } catch {
          continue;
        }

        // system_store is automatically populated, so no need to export.
        if (!tableName || tableName === 'system_store') {
          continue;
        }

        // Fetch all rows for this dynamic table
        // Need to use admin db connection, because it will circumvent RLS.
        const rows = await adminDb.select().from(entity as Table);

        if (rows.length === 0) {
          continue;
        }

        const tableCols = getTableColumns(entity as Table);

        // Convert the JS keys back to their snake_case DB equivalents
        const columns = Object.keys(rows[0])
          .map((jsKey) => {
            const col = tableCols[jsKey];
            const dbColName = col?.name ? toSnakeCase(col.name) : toSnakeCase(jsKey);
            return `"${dbColName}"`;
          })
          .join(', ');

        // Map all rows into grouped value strings with indentation
        const allValues = rows.map((row) => {
          return `  (${Object.values(row).map(escapeSqlValue).join(', ')})`;
        }).join(',\n'); // Add a newline after each row

        // Create exactly ONE massive INSERT statement per table, properly formatted
        const sql = `INSERT INTO "${tableName}" (${columns}) VALUES\n${allValues};\n`;

        await appendEntry(`${tableName}.sql`, sql);
      }
    } catch (error) {
      console.error('Export error:', error);
      await appendEntry('error.log', 'ERROR GENERATING DUMP');
    } finally {
      // Finalize the tar stream to end it, which propagates to gzip and passThrough
      pack.finalize();
    }
  };

  // Start processing in the background immediately
  processTables();

  // Convert Node stream to Web Stream
  const webStream = Readable.toWeb(passThrough) as ReadableStream;

  // Generate filename timestamp
  const now = new Date();
  const Y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const H = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${Y}${m}${d}-${H}${min}`;

  const filename = `laneh-${__APP_VERSION__}-db-${timestamp}.tar.gz`;

  return { webStream, filename };
}
