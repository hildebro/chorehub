import { argon2id, argon2Verify } from 'hash-wasm';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = new Uint8Array(16);
  globalThis.crypto.getRandomValues(salt);

  return argon2id({
    password: password,
    salt: salt,
    memorySize: 65536, // 64 MB
    iterations: 3,     // timeCost
    parallelism: 1,    // number of threads
    hashLength: 32,    // standard output byte length
    outputType: 'encoded' // Returns standard $argon2id$... string
  });
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return argon2Verify({
    password: password,
    hash: hashedPassword
  });
}
