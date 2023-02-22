module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    "moduleNameMapper": {
        "@src/(.*)": "<rootDir>/src/$1",
        "@test/(.*)": "<rootDir>/test/$1",
        "@resources/(.*)": "<rootDir>/resources/$1",
        "@database/(.*)": "<rootDir>/prisma/$1",
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    collectCoverage: true,
    clearMocks: true,
    coverageDirectory: "coverage",
};