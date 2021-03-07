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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hapi_1 = __importDefault(require("@hapi/hapi"));
var twitter_app_api_1 = require("twitter-app-api");
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var twit, err_1, server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!process.env.TWITTER_API_KEY) {
                        console.error('TWITTER_API_KEY must be defind');
                        process.exit(1);
                    }
                    if (!process.env.TWITTER_API_SECRET) {
                        console.error('TWITTER_API_SECRET must be defind');
                        process.exit(1);
                    }
                    console.log('Authenticating client against Twitter API v1.1');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, twitter_app_api_1.Twitter.authenticate(process.env.TWITTER_API_KEY, process.env.TWITTER_API_SECRET, { tweet_mode: 'extended' })];
                case 2:
                    twit = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1.message);
                    console.error(err_1.body);
                    process.exit(2);
                    return [3 /*break*/, 4];
                case 4:
                    console.log('Authentication completed');
                    server = hapi_1.default.server({
                        port: process.env.PORT || 4000,
                        host: '0.0.0.0'
                    });
                    require('./routes')(twit, server);
                    return [4 /*yield*/, server.start()];
                case 5:
                    _a.sent();
                    console.log('Server running on %s', server.info.uri);
                    return [2 /*return*/];
            }
        });
    });
}
function attachProcessHooks() {
    process.on('unhandledRejection', function (err) {
        console.log(err);
        process.exit(7);
    });
    process.on('exit', function (code) {
        console.log("Process exited with code: " + code);
    });
    process.on('SIGTERM', function (signal) {
        console.log("Process " + process.pid + " received a SIGTERM signal");
        process.exit(0);
    });
    process.on('SIGINT', function (signal) {
        console.log("Process " + process.pid + " has been interrupted");
        process.exit(0);
    });
}
attachProcessHooks();
init()
    .catch(function (err) {
    console.log(err);
    process.exit(1);
});