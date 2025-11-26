module.exports.removeValueAndSize = (arr, valueToRemove) => {
  if (!Array.isArray(arr)) {
    return [false, { message: "List of invite_reference_numbers is not an array" }];
  }

  const exists = arr.includes(valueToRemove);
  if (!exists) {
    return [false, { array: [...arr], size: arr.length, removed: false }];
  }

  const filtered = arr.filter(x => x !== valueToRemove);
  return [true, { array: filtered, size: filtered.length, removed: true }];
};
