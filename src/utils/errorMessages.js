const errMessagesNotFound = (field, value) => ({
    message: `There is no field: ${field} with value: ${value}!`
});

module.exports = {
    errMessagesNotFound
}
