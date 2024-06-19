import { test as base } from "@playwright/test";
import { GameConfiguration, ImageLocator } from "sc-automation-core/lib/components";
import { BaseLobbyGame } from "./BaseLobbyGame";
global.logMsg = [];
global.ssoLink;

type BaseFixtures = {
    gameConfigurations: GameConfiguration;
    locators: Array<ImageLocator>;
    baseGame: BaseLobbyGame;
    device: any;
};

export const test = base.extend<BaseFixtures>({
    gameConfigurations: new GameConfiguration(),
    locators: new Array<ImageLocator>(),
    baseGame: async ({ browser, locators, gameConfigurations }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await context.tracing.start({ screenshots: true, snapshots: true });
            const game = new BaseLobbyGame(page, locators, gameConfigurations);
            await game.login();
            await use(game);
        } catch (error) {
            await context.tracing.stop({
                path: "./test-results/failed-setup-trace.zip",
            });
            await browser.close();
            throw error;
        }
    },
});

test.beforeEach(async ({}, testInfo) => {
    testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;
});

test.afterAll(async ({ browser }) => {
    await browser.close();
});
