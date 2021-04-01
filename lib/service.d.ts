interface Options {
    schema: string;
    config: string;
}
declare const service: (options: Options) => Promise<string>;
export default service;
