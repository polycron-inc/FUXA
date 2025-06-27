const sortOrderSmacss = require("stylelint-config-property-sort-order-smacss/generate");

module.exports = {
    extends: ["stylelint-config-recommended-scss"],
    plugins: ["stylelint-scss", "stylelint-order"],
    rules: {
        "order/properties-order": [
            sortOrderSmacss({
                emptyLineBefore: "always",
            }),
        ],
    },
};
