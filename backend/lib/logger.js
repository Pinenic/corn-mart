const isProd = process.env.NODE_ENV === 'production';

export default {
  error: (...args) => {
    console.error(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  info: (...args) => {
    if (!isProd) console.log(...args);
  },
};
