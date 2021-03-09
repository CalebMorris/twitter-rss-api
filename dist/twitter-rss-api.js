'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hapi_1 = __importDefault(require("@hapi/hapi"));
const twitter_app_api_1 = require("twitter-app-api");
const routes_1 = require("./routes");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.TWITTER_API_KEY) {
            console.error('TWITTER_API_KEY must be defind');
            process.exit(1);
        }
        if (!process.env.TWITTER_API_SECRET) {
            console.error('TWITTER_API_SECRET must be defind');
            process.exit(1);
        }
        console.log('Authenticating client against Twitter API v1.1');
        let twit;
        try {
            twit = yield twitter_app_api_1.Twitter.authenticate(process.env.TWITTER_API_KEY, process.env.TWITTER_API_SECRET, { tweet_mode: 'extended' });
        }
        catch (err) {
            console.error(err.message);
            console.error(err.body);
            process.exit(2);
        }
        console.log('Authentication completed');
        const server = hapi_1.default.server({
            port: process.env.PORT || 4000,
            host: '0.0.0.0'
        });
        routes_1.routes(twit, server);
        yield server.start();
        console.log('Server running on %s', server.info.uri);
    });
}
function attachProcessHooks() {
    process.on('unhandledRejection', (err) => {
        console.log(err);
        process.exit(7);
    });
    process.on('exit', code => {
        console.log(`Process exited with code: ${code}`);
    });
    process.on('SIGTERM', signal => {
        console.log(`Process ${process.pid} received a SIGTERM signal`);
        process.exit(0);
    });
    process.on('SIGINT', signal => {
        console.log(`Process ${process.pid} has been interrupted`);
        process.exit(0);
    });
}
attachProcessHooks();
init()
    .catch(err => {
    console.log(err);
    process.exit(1);
});
