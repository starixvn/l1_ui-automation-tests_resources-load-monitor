import { Page } from "@playwright/test";
import { BaseGame } from "sc-automation-core/lib/components";
import { ssoToGame, getConfig } from "sc-automation-core/lib/auth/auth";
import * as accounts from "sc-automation-core/lib/auth/configs/config.account";
import { GameEvent, parseSocketPayload } from "sc-automation-core/lib/_shared";

export class BaseLobbyGame extends BaseGame {
    async login() {
        const env = (process.env.npm_config_env ?? "local").toLowerCase();
        const projectCode = process.env.npm_config_project ?? "l1";
        let account: string;
        if (env.includes("local")) {
            account = this.gameConfiguration.accounts[env];
        } else {
            account = projectCode != "ultra888" ? accounts[`${projectCode}${env}`][this.gameConfiguration.id] : this.gameConfiguration.id;
        }
        const startTime = performance.now(); // Measure start time
        await ssoToGame(this.page, this.gameConfiguration.id, account, this.gameConfiguration.productId[projectCode], env, projectCode);
        this.msgpack = getConfig().enabledMsgPack;
        this.trackDownload = getConfig().trackDownload;

        if (this.trackDownload) {
            await this.trackDownloadResources(this.page);
        }

        this.page.on("websocket", async (ws) => {
            if (!ws.url().includes("notification")) {
                this.gameSocket = ws;

                ws.on("framereceived", async (msg: any) => {
                    const { payload } = msg ?? "";

                    if (this.odds === null && payload.includes(GameEvent.GameConfig)) {
                        const ingameResponse = parseSocketPayload(payload, this.msgpack).message;
                        this.odds = ingameResponse.gameConfigs?.odds || ingameResponse.odds;
                        this.gameConfigs = ingameResponse.gameConfigs;
                    }

                    Object.keys(this.capturedEvents)?.forEach((event) => {
                        if (payload.includes(event)) {
                            this.capturedEvents[event] = parseSocketPayload(payload, this.msgpack).message;
                        }
                    });
                });
            }
        });

        await this.logConsole();
        if (this.gameConfiguration.id === 0) {
            await this.waitUntilGameLobbyUiLoad();
            console.log(`Total download (first):${this.convertToMb(this.totalDownloadSize)} MB`);

            if (this.trackDownload) {
                let time = 0;
                while (time < 1 * 60 * 1000) {
                    await this.page.waitForTimeout(3000);
                    time += 3000;
                }
            }
        } else {
            await this.waitUntilGameUiLoad();
        }
        const endTime = performance.now(); // Measure end time
        console.log(`Total login time: ${endTime - startTime} ms`);

        if (this.trackDownload) {
            console.log(`Total download (all): ${this.convertToMb(this.totalDownloadSize)} MB`);
            console.log("BIG FILES");
            this.bigFiles.forEach((bigFile) => {
                console.log(bigFile);
            });
        }
    }

    convertToMb(size: number) {
        return size / 1000 / 1000;
    }

    async trackDownloadResources(page: Page) {
        const bigSize = 500_000;

        page.on("request", async (request) => {
            try {
                const response = await request.response();

                if (response) {
                    const content = await response.body();
                    const resourceSize = content.byteLength;
                    const contentType = response.headers()["content-type"];

                    if (resourceSize > bigSize) {
                        this.bigFiles.push(`${request.url()} - File type: ${contentType} -size: ${this.convertToMb(resourceSize)} MB`);
                    }
                    this.totalDownloadSize += resourceSize;
                }
            } catch (error) {
                console.log(`Error load file ${request.url()}`);
            }
        });
    }
}
