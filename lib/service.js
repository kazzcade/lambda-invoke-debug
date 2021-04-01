"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var express_1 = __importDefault(require("express"));
var express_graphql_1 = require("express-graphql");
var graphql_1 = require("graphql");
var portfinder_1 = __importDefault(require("portfinder"));
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var find_process_1 = __importDefault(require("find-process"));
var execa_1 = __importDefault(require("execa"));
var BASE_PORT = 8000;
var MAX_PORT = 9999;
var scalarTypes = ['AWSDateTime', 'AWSDate', 'AWSEmail', 'AWSURL', 'AWSPhone', 'AWSJSON', 'AWSTime'];
var UNKNOWN_ERROR = 'Unknown error occurred during the execution of the Lambda function';
;
var service = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, gql, port, configModule_1, subscriptionRegExp, schema, app, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Promise.all([
                        promises_1.default.readFile(options.schema),
                        portfinder_1.default.getPortPromise({
                            startPort: BASE_PORT,
                            stopPort: MAX_PORT
                        })
                    ])];
            case 1:
                _a = _b.sent(), gql = _a[0], port = _a[1];
                configModule_1 = require(path_1.default.resolve(options.config));
                subscriptionRegExp = /type Subscription \{(.|\n)*\}/ig;
                schema = graphql_1.buildSchema(scalarTypes.map(function (x) { return "scalar " + x; }).join('\n') + "\n" + gql.toString().replace(subscriptionRegExp, ''));
                app = express_1.default();
                app.use('/graphql', express_graphql_1.graphqlHTTP({
                    schema: schema,
                    customExecuteFn: function (request) {
                        if (request.operationName === 'IntrospectionQuery') {
                            return graphql_1.execute(request);
                        }
                        var rootValue = request.document.definitions.reduce(function (acc, next) {
                            return __assign(__assign({}, acc), next.selectionSet.selections.reduce(function (acc, next) {
                                var _a;
                                var field = next.name.value;
                                if (!(field in configModule_1)) {
                                    throw new Error("Field: \"" + field + "\" not in config module");
                                }
                                var fieldConfig = configModule_1[field];
                                return __assign(__assign({}, acc), (_a = {},
                                    _a[next.name.value] = function (args, request, field) { return __awaiter(void 0, void 0, void 0, function () {
                                        var functionName, debugProcess, payload, finds, found, stdout, pidRegex, stat, debugProcessPort, debugPort, processResult, _a, _b, _c, _d, _e, _f, _g, lambdaResult, errorMessage;
                                        var _h, _j;
                                        return __generator(this, function (_k) {
                                            switch (_k.label) {
                                                case 0:
                                                    functionName = fieldConfig.functionName, debugProcess = fieldConfig.debugProcess, payload = fieldConfig.payload;
                                                    return [4 /*yield*/, find_process_1.default('name', debugProcess)];
                                                case 1:
                                                    finds = _k.sent();
                                                    found = finds.filter(function (x) { return x.cmd.includes(functionName); })[0];
                                                    return [4 /*yield*/, execa_1.default('netstat', ['-ltnp', found.pid.toString()])];
                                                case 2:
                                                    stdout = (_k.sent()).stdout;
                                                    pidRegex = new RegExp(found.pid.toString());
                                                    stat = stdout.split('\n').filter(function (x) { return pidRegex.test(x); })[0];
                                                    debugProcessPort = stat.match(/127.0.0.1:([\d]{1,5})/);
                                                    debugPort = parseInt(debugProcessPort[1], 10);
                                                    _a = execa_1.default;
                                                    _b = ['./src/goInvoke/main'];
                                                    _h = {};
                                                    _d = (_c = JSON).stringify;
                                                    _j = {
                                                        timeoutMilliseconds: 5000,
                                                        port: debugPort
                                                    };
                                                    _e = "";
                                                    _g = (_f = JSON).stringify;
                                                    return [4 /*yield*/, payload(args, request, field)];
                                                case 3: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_h.input = _d.apply(_c, [(_j.payload = _e + _g.apply(_f, [_k.sent(), null]),
                                                                _j), null]) + "\n",
                                                            _h)]))];
                                                case 4:
                                                    processResult = _k.sent();
                                                    if (processResult.exitCode === 0) {
                                                        lambdaResult = JSON.parse(processResult.stdout);
                                                        if (lambdaResult.Response) {
                                                            try {
                                                                return [2 /*return*/, JSON.parse(lambdaResult.Response)];
                                                            }
                                                            catch (_l) {
                                                                return [2 /*return*/, lambdaResult.Response];
                                                            }
                                                        }
                                                        else {
                                                            throw new Error(lambdaResult.Error || UNKNOWN_ERROR);
                                                        }
                                                    }
                                                    else {
                                                        errorMessage = processResult.stderr || UNKNOWN_ERROR;
                                                        throw new Error("Lambda invoker exit code: " + processResult.exitCode + ", message: " + errorMessage);
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); },
                                    _a));
                            }, {}));
                        }, {});
                        return graphql_1.execute(__assign(__assign({}, request), { rootValue: rootValue }));
                    },
                    graphiql: true,
                }));
                app.listen(port);
                return [2 /*return*/, "Running a GraphQL API server at http://localhost:" + port + "/graphql"];
            case 2:
                e_1 = _b.sent();
                console.log(e_1);
                throw e_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = service;
