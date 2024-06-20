import { gamelobbyConfigs } from "../gamelobby-configs";
import { SmokeBases, Components } from "sc-automation-core";
import { expect } from "@playwright/test";

export const gameLobbyLocators = [new Components.ImageLocator("gamelobby", 405, 667, 136, 44)];

class healthSmokeSpec extends SmokeBases.TableGameBase {
    /**
     *
     */
    constructor() {
        const smokeOptions: SmokeBases.IBaseOptions = {
            gameConfiguration: gamelobbyConfigs,
            locators: gameLobbyLocators,
            waitBetTimeout: 8000,
            placeBetChoices: [],
            snapshotFolderPath: __filename,
            placeBetAmount: process.env.npm_config_project === "l2" ? 10 : 1,
        };

        super(smokeOptions);
    }

    protected gameLobbyLoadsucceess(): void {
        //TODO implement tests
        // 	- expect total load less than ....MBs
        // 	- expect there is no duplicated files
        // 	- expect there is no PNGs > 500kbs
        Components.test("Verify that game looby is loaded success without error", async () => {
            const gamelobby = await this.game.captureLocator("gamelobby");
            const { firstLoad, totalLoad } = this.game.trackDownloadReport;

            expect(gamelobby.image).toMatchSnapshot(gamelobby.name, { maxDiffPixelRatio: 0.02 });
            expect(firstLoad.size).toBeLessThan(15);
            expect(firstLoad.duration).toBeLessThan(25_000);
        });
    }

    protected runScenario(): void {
        this.gameLobbyLoadsucceess();
    }
}

new healthSmokeSpec().start();
