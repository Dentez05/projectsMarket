import { fetchWithAuth } from '../api/client';

export function getFileNameFromCD(cd: string, fallback: string): string {
  const star = cd.match(/filename\*=UTF-8''([^;\n]+)/i);
  if (star) return decodeURIComponent(star[1]);
  const quoted = cd.match(/filename="?([^";\n]+)"?/);
  if (quoted) return quoted[1];
  return fallback;
}

async function downloadSingle(fileRes: Response, fallback: string) {
  const cd = fileRes.headers.get('content-disposition') || '';
  const blob = await fileRes.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getFileNameFromCD(cd, fallback);
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadOrderFiles(orderId: number) {
  const res = await fetchWithAuth(`/api/Download/orders/${orderId}`);
  if (!res.ok) return;
  const ct = res.headers.get('content-type') || '';

  if (ct.includes('application/json')) {
    const files = await res.clone().json();
    for (const f of files) {
      const fileRes = await fetchWithAuth(`/api/Download/files/${f.id}`);
      if (!fileRes.ok) continue;
      await downloadSingle(fileRes, f.originalFileName || `file_${f.id}`);
    }
    return;
  }

  if (ct.includes('application/zip')) {
    await downloadSingle(res, `order_${orderId}_files.zip`);
  } else {
    await downloadSingle(res, `order_${orderId}_files`);
  }
}
