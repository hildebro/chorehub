import { getTableColumns, getTableName, type Table } from 'drizzle-orm';
import * as schema from '$lib/backend/db/schema';
import { getAdminTx } from '$lib/context';

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

class TarWriter {
  private buffers: Uint8Array[] = [];

  addFile(name: string, content: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const size = data.length;
    const header = new Uint8Array(512);

    encoder.encodeInto(name, header.subarray(0, 100));
    encoder.encodeInto("0000664\0", header.subarray(100, 108));
    encoder.encodeInto("0001750\0", header.subarray(108, 116));
    encoder.encodeInto("0001750\0", header.subarray(116, 124));

    const sizeOctal = size.toString(8).padStart(11, '0') + ' ';
    encoder.encodeInto(sizeOctal, header.subarray(124, 136));

    const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + ' ';
    encoder.encodeInto(mtime, header.subarray(136, 148));

    encoder.encodeInto("        ", header.subarray(148, 156));
    header[156] = 48; // '0' = file
    encoder.encodeInto("ustar ", header.subarray(257, 263));
    encoder.encodeInto(" \0", header.subarray(263, 265));

    let checksum = 0;
    for (let i = 0; i < 512; i++) checksum += header[i];
    const checksumOctal = checksum.toString(8).padStart(6, '0') + '\0 ';
    encoder.encodeInto(checksumOctal, header.subarray(148, 156));

    this.buffers.push(header, data);

    const padding = 512 - (size % 512);
    if (padding < 512) this.buffers.push(new Uint8Array(padding));
  }

  finish(): Uint8Array {
    this.buffers.push(new Uint8Array(1024)); // Two empty blocks mark EOF
    const total = this.buffers.reduce((acc, b) => acc + b.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const b of this.buffers) {
      out.set(b, offset);
      offset += b.length;
    }
    return out;
  }
}

export function generateDatabaseBackup() {
  const now = new Date();
  const Y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const H = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${Y}${m}${d}-${H}${min}`;
  const filename = `laneh-${__APP_VERSION__}-db-${timestamp}.tar.gz`;

  // Use native Web Streams available in both Node and Browser
  const { readable, writable } = new TransformStream();

  const processTables = async () => {
    const tar = new TarWriter();
    try {
      for (const [, entity] of Object.entries(schema)) {
        let tableName: string;
        try { tableName = getTableName(entity as Table); } catch { continue; }
        if (!tableName || tableName === 'system_store') continue;

        const tx = await getAdminTx();
        const rows = await tx.select().from(entity as Table);
        if (rows.length === 0) continue;

        const tableCols = getTableColumns(entity as Table);
        const columns = Object.keys(rows[0])
          .map((jsKey) => `"${tableCols[jsKey]?.name ? toSnakeCase(tableCols[jsKey].name) : toSnakeCase(jsKey)}"`)
          .join(', ');

        const allValues = rows.map((row) => `  (${Object.values(row).map(escapeSqlValue).join(', ')})`).join(',\n');
        const sqlString = `INSERT INTO "${tableName}" (${columns}) VALUES\n${allValues};\n`;

        tar.addFile(`${tableName}.sql`, sqlString);
      }

      // Finalize Tar and compress with native CompressionStream
      const tarBuffer = tar.finish();
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      writer.write(tarBuffer as BufferSource);
      writer.close();

      // Pipe the compressed output directly to the endpoint response stream
      await cs.readable.pipeTo(writable);
    } catch (e) {
      console.error('Export error:', e);
      writable.getWriter().abort(e);
    }
  };

  // Start processing in background without blocking the return
  processTables();

  return { webStream: readable, filename };
}
