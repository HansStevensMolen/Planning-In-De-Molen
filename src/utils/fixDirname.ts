// Fix Node sandbox environment where globalThis.__dirname is incorrectly set to '.'
if (typeof globalThis !== 'undefined') {
  if ((globalThis as any).__dirname === '.') {
    try {
      delete (globalThis as any).__dirname;
    } catch {}
  }
}

if (typeof global !== 'undefined') {
  if ((global as any).__dirname === '.') {
    try {
      delete (global as any).__dirname;
    } catch {}
  }
}

