const filterJsonAttributes = (users, excludedKeys) => {	
    return users.map(user => {
        return Object.fromEntries(
            Object.entries(user).filter(([key]) => !excludedKeys.includes(key))
        );
    });
};

const filterJsonArrayAttributes = (data, excludedKeys) => {
    return data.map(entry => ({
        ...entry,
        user: entry.user?.map(user =>
            Object.fromEntries(Object.entries(user).filter(([key]) => !excludedKeys.includes(key)))
        ) || []
    }));
};

function filterUserAttributes(dataArray, excludeKeys = []) {
  return dataArray.map(user => {
    const filteredUser = {};
    for (const key in user) {
      if (!excludeKeys.includes(key)) {
        filteredUser[key] = user[key];
      }
    }
    return filteredUser;
  });
}

module.exports = { filterJsonAttributes,filterJsonArrayAttributes,filterUserAttributes };
