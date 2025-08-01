
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};


export const generateShortcode = () => {
  return Math.random().toString(36).substring(2, 8);
};


export const isShortcodeTaken = (shortcode, data) => {
  return !!data[shortcode];
};


export const getStoredData = () => {
  return JSON.parse(localStorage.getItem('urlData') || '{}');
};


export const saveStoredData = (data) => {
  localStorage.setItem('urlData', JSON.stringify(data));
};
