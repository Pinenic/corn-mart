export const saveLastClickedItem = (key, id) => {
    console.log("saving item");
  sessionStorage.setItem(key, id);
  console.log(key);
  console.log(sessionStorage.getItem(key));
};

export const getLastClickedItem = (key) => {
    console.log("getting item");
  console.log(sessionStorage.getItem(key));
  return sessionStorage.getItem(key);
};

export const clearLastClickedItem = (key) => {
    console.log("clearing item");
  sessionStorage.removeItem(key);
};