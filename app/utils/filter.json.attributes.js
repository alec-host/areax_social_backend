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

module.exports = { filterJsonAttributes,filterJsonArrayAttributes };
