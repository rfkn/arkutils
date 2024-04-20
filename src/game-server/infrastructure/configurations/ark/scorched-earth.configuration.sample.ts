import { ArkMapConfiguration, ArkMapName } from "src/game-server/application/interfaces/ark-game-configuration.interface";

const ScorchedEarthConfiguration = new ArkMapConfiguration({
    serverName: "My Ark Server",
    mapFolderName: ArkMapName.ScorchedEarth,
    mapDisplayName: "Scorched Earth",
    baseSavePath: "arksa/ShooterGame/Saved/SavedArks",
    profileExtensionRegex: ".arkprofile|.profilebak|.arktribe|.arktribebak|.arktributetribe|.formertribeownerlog",
});

// export { ScorchedEarthConfiguration };
