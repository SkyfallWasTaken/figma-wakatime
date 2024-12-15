export default function (propName: string): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any)[propName]) {
      resolve();
    } else {
      Object.defineProperty(window, propName, {
        configurable: true,
        enumerable: true,
        get: function () {
          return this[`_waiton_${propName}`];
        },
        set: function (val) {
          this[`_waiton_${propName}`] = val;
          resolve();
        },
      });
    }
  });
}
