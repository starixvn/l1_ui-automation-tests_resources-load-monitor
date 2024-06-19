import { test } from "sc-automation-core/lib/components";
import { expect } from "sc-automation-core/lib/expects";
import { MiniGameBase } from "sc-automation-core/lib/smoke-bases";
import { BaseLobbyGame } from "./BaseLobbyGame";

export class GameLobby extends MiniGameBase {
    game: BaseLobbyGame;

    //TODO implement tests
    // - expect first load less than ....MBs
    // 	- expect total load less than ....MBs
    // 	- expect there is no duplicated files
    // 	- expect there is no PNGs > 500kbs

    protected inGameDealerTests() {
        test("GIVEN player joined game and saw dealer", async () => {
            // Act
            const dealerSnapshot = await this.game.captureDealer();

            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });
    }

    protected override runScenario(): void {
        this.inGameDealerTests();

        super.runScenario();
    }
}
