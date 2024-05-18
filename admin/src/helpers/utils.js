function formatVndCurrency(amount) {
  // Format the amount with comma separated thousands
  let formattedAmount = Number(amount).toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&,');
  // Append 'đ' to indicate Vietnamese đồng
  formattedAmount += 'vnđ';
  return formattedAmount;
}

function getMimeTypeFromBase64(base64) {
  const result = base64.match(/data:([^;]+);base64,/);
  return result ? result[1] : '';
}
function base64ToBlob(base64, mime) {
  let byteString = atob(base64.split(',')[1]);
  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

function base64ToFile(base64, filename, mime) {
  const blob = base64ToBlob(base64, mime);
  return new File([blob], filename, { type: mime });
}

function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function addBase64Files(base64Array) {
  const files = base64Array?.length && base64Array.map(base64 => {
    const mimeType = getMimeTypeFromBase64(base64.image);
    const extension = mimeType.split('/')[1];
    console.log(mimeType)
    const now = new Date();
    const file = base64ToFile(base64.image, `${now.getTime()}.${extension}`, mimeType);
    return {
      uid: generateUniqueId(),
      name: file.name,
      status: 'done',
      url: URL.createObjectURL(file),
      originFileObj: file,
    };
  });
  return files;
}

export default {
  formatVndCurrency,
  getMimeTypeFromBase64,
  base64ToFile,
  base64ToBlob,
  addBase64Files
}