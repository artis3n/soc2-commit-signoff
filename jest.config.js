module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    testRunner: 'jest-circus/runner',
    verbose: true,
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    verbose: true
};
